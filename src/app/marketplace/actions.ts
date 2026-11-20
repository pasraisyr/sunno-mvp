"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { createChipPurchase } from "@/lib/chip/client";
import { distributeOrderCommissions } from "@/lib/commission";

// 1. Dapatkan produk & kedai aktif untuk Marketplace
export async function getMarketplaceData(completedOrderId?: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika baru selesai bayar di CHIP (simulasi redirect localhost)
  let completedOrder = null;
  if (completedOrderId && user) {
    const { data: ord } = await supabase
      .from("orders")
      .select("*, merchants(shop_name)")
      .eq("id", completedOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ord && ord.status === "PENDING") {
      // Kemas kini status kepada PAID
      await supabase
        .from("orders")
        .update({ status: "PAID" })
        .eq("id", ord.id);

      // A. Jika ada token yang ditebus, tolak dari lejar (REDEEMED)
      const tokensRedeemed = Number(ord.tokens_used);
      if (tokensRedeemed > 0) {
        await supabase.from("token_ledger").insert({
          user_id: user.id,
          amount: tokensRedeemed,
          type: "REDEEMED",
          reference_id: ord.id,
          description: `Penebusan diskaun pesanan #${ord.id.slice(0, 8)}`,
        });
      }

      // B. Tambah Token baru bagi tunai yang dibayar (RM1 tunai = 1 Token)
      const tokenEarned = Math.floor(Number(ord.cash_paid_rm));
      if (tokenEarned > 0) {
        await supabase.from("token_ledger").insert({
          user_id: user.id,
          amount: tokenEarned,
          type: "EARNED",
          reference_id: ord.id,
          description: `Ganjaran tunai pesanan #${ord.id.slice(0, 8)}`,
        });
      }

      // C. Enjin Komisen 3-Tier (L1: 50%, L2: 15%, L3: 12.5%)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await distributeOrderCommissions(
        supabaseAdmin,
        ord.id,
        user.id,
        Number(ord.cash_paid_rm)
      );

      ord.status = "PAID";
    }
    completedOrder = ord;
  }

  // Ambil semua produk dari kedai yang AKTIF (is_active = true)
  const { data: products } = await supabase
    .from("products")
    .select("*, merchants!inner(id, shop_name, slug, is_active), categories(id, name)")
    .eq("is_available", true)
    .eq("merchants.is_active", true)
    .order("created_at", { ascending: false });

  // Ambil senarai kategori
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Ambil baki Token terkini pengguna & profil (jika log masuk)
  let userTokens = 0;
  let profile = null;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (prof) {
      profile = {
        id: prof.id,
        fullName: prof.full_name,
        role: prof.role as "CONSUMER" | "MERCHANT" | "ADMIN",
      };
    }

    const { data: ledger } = await supabase
      .from("token_ledger")
      .select("amount, type")
      .eq("user_id", user.id);

    if (ledger) {
      userTokens = ledger.reduce((acc, curr) => {
        return curr.type === "EARNED" ? acc + Number(curr.amount) : acc - Number(curr.amount);
      }, 0);
    }
  }

  return {
    user,
    profile,
    products: products || [],
    categories: categories || [],
    userTokens: Math.max(0, userTokens),
    completedOrder,
  };
}

// 2. Buat Pesanan, Tebus Token & Sesi Bayaran CHIP
export async function checkoutCartAction(params: {
  merchantId: string;
  items: Array<{
    productId: string;
    productTitle: string;
    price: number;
    quantity: number;
  }>;
  tokensToRedeem?: number;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sila log masuk untuk membuat pesanan." };
  }

  if (!params.items || params.items.length === 0) {
    return { error: "Bakul belanja anda kosong." };
  }

  // Kira jumlah harga pesanan (RM)
  const totalAmountRm = params.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Semak baki token pengguna semasa
  const { data: ledger } = await supabase
    .from("token_ledger")
    .select("amount, type")
    .eq("user_id", user.id);

  const availableTokens = (ledger || []).reduce((acc, curr) => {
    return curr.type === "EARNED" ? acc + Number(curr.amount) : acc - Number(curr.amount);
  }, 0);

  // Hadkan penebusan token:
  // - Tidak boleh melebihi baki pengguna
  // - 1 Token = RM1.00 diskaun
  // - Maksimum tebusan ialah nilai bil tolak RM1 (supaya ada baki tunai CHIP minima) melainkan 100% token
  const requestedRedeem = Math.max(0, Math.floor(params.tokensToRedeem || 0));
  const maxTokensAllowed = Math.min(requestedRedeem, Math.max(0, availableTokens), Math.floor(totalAmountRm));
  const tokensUsed = maxTokensAllowed;

  // Kiraan Tunai Sebenar
  const cashPaidRm = Math.max(0, Number((totalAmountRm - tokensUsed).toFixed(2)));

  // Kira caj pengurusan / transaction fee platform Sunno (2% atau min RM0.50)
  const platformFeeRm = Number((totalAmountRm * 0.02).toFixed(2));
  const merchantNetRm = Number(Math.max(0, totalAmountRm - platformFeeRm).toFixed(2));

  // A. Cipta rekod kepala resit di jadual 'orders'
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      merchant_id: params.merchantId,
      total_amount_rm: totalAmountRm,
      cash_paid_rm: cashPaidRm,
      tokens_used: tokensUsed,
      status: "PENDING",
      platform_fee_rm: platformFeeRm,
      merchant_net_rm: merchantNetRm,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return { error: `Gagal mencipta pesanan: ${orderErr?.message}` };
  }

  // B. Cipta butiran barang di jadual 'order_items'
  const orderItemsData = params.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price_rm: item.price,
    subtotal_rm: item.price * item.quantity,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItemsData);

  if (itemsErr) {
    return { error: `Gagal menyimpan butiran pesanan: ${itemsErr.message}` };
  }

  // C. Jika baki tunai kena bayar adalah 0 (dibayar 100% dengan token)
  if (cashPaidRm === 0) {
    await supabase.from("orders").update({ status: "PAID" }).eq("id", order.id);
    await supabase.from("token_ledger").insert({
      user_id: user.id,
      amount: tokensUsed,
      type: "REDEEMED",
      reference_id: order.id,
      description: `Penebusan 100% token bagi pesanan #${order.id.slice(0, 8)}`,
    });
    return {
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/marketplace?order_id=${order.id}&paid=true`,
    };
  }

  // D. Sesi pembayaran tunai CHIP untuk baki cash_paid_rm
  try {
    const purchase = await createChipPurchase({
      orderId: order.id,
      customerEmail: user.email || "consumer@sunno.asia",
      customerName: user.user_metadata?.full_name || "Pelanggan Sunno",
      productTitle: `Pesanan #${order.id.slice(0, 8)} (Tebus ${tokensUsed} Token)`,
      amountInRm: cashPaidRm,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/marketplace?order_id=${order.id}&paid=true`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/marketplace?order_id=${order.id}&paid=false`,
      webhookCallbackUrl: "https://sunno.asia/api/webhooks/chip",
    });

    return { checkoutUrl: purchase.checkout_url };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Ralat menghubungi gerbang pembayaran CHIP.";
    return { error: errorMessage };
  }
}
