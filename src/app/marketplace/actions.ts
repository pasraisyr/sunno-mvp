"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { createChipPurchase } from "@/lib/chip/client";
import {
  calculateAndDistributeMorraCommissions,
  calculateOrderSplitSettlement,
} from "@/lib/commission";

// 1. Dapatkan produk & kedai aktif untuk Marketplace
export async function getMarketplaceData(completedOrderId?: string) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika baru selesai bayar di CHIP (simulasi redirect browser)
  let completedOrder = null;
  if (completedOrderId && user) {
    const { data: ord } = await supabase
      .from("orders")
      .select("*, merchants(id, shop_name)")
      .eq("id", completedOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ord && ord.status === "PENDING") {
      const cashPaid = Number(ord.cash_paid_rm);
      const grossAmount = Number(ord.total_amount_rm);
      const tokensRedeemed = Number(ord.tokens_used);

      // Pecahan Settlement (ADDENDUM CHIP GATEWAY FEE 1% Min RM0.15, Max RM1.50 & Fi MORRA 5%)
      const { morraPlatformFee, chipGatewayFee, merchantNetAmount } =
        calculateOrderSplitSettlement(grossAmount);

      // Kemas kini status kepada PAID beserta lejar kewangan
      await supabase
        .from("orders")
        .update({
          status: "PAID",
          gross_amount: grossAmount,
          token_discount_amount: tokensRedeemed,
          chip_gateway_fee: chipGatewayFee,
          morra_platform_fee: morraPlatformFee,
          merchant_net_amount: merchantNetAmount,
          platform_fee_rm: morraPlatformFee,
          merchant_net_rm: merchantNetAmount,
        })
        .eq("id", ord.id);

      // A. Jika ada token yang ditebus, tolak dari lejar (REDEEMED)
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
      const tokenEarned = Math.floor(cashPaid);
      if (tokenEarned > 0) {
        await supabase.from("token_ledger").insert({
          user_id: user.id,
          amount: tokenEarned,
          type: "EARNED",
          reference_id: ord.id,
          description: `Kumpul token pesanan #${ord.id.slice(0, 8)}`,
        });
      }

      // C. Enjin Komisen 2-Level MORRA (Berasaskan Fi Platform 5%)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await calculateAndDistributeMorraCommissions(
        supabaseAdmin,
        ord.id,
        user.id,
        ord.merchant_id,
        grossAmount
      );

      ord.status = "PAID";
    }
    completedOrder = ord;
  }

  // Ambil semua produk dari kedai yang AKTIF (is_active = true)
  const { data: products } = await supabase
    .from("products")
    .select("*, merchants!inner(id, shop_name, slug, is_active, token_discount_enabled, max_token_discount_percent), categories(id, name)")
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
        role: prof.role || "USER",
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

  // Ambil maklumat tetapan diskaun kedai merchant
  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, token_discount_enabled, max_token_discount_percent")
    .eq("id", params.merchantId)
    .single();

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

  // Hadkan penebusan token mengikut polisi MORRA Fasa 1:
  // - Merchant bebas menetapkan sama ada diskaun token diaktifkan
  // - Tidak boleh melebihi baki pengguna
  // - 1 Token = RM1.00 diskaun
  let maxTokensAllowed = 0;
  if (merchant?.token_discount_enabled) {
    const maxPercent = Number(merchant.max_token_discount_percent || 10) / 100;
    const maxDiscountAllowed = Math.floor(totalAmountRm * maxPercent);
    const requestedRedeem = Math.max(0, Math.floor(params.tokensToRedeem || 0));
    maxTokensAllowed = Math.min(requestedRedeem, Math.max(0, availableTokens), maxDiscountAllowed);
  } else if (params.tokensToRedeem && params.tokensToRedeem > 0) {
    // Jika kedai tidak mengaktifkan diskaun token
    maxTokensAllowed = 0;
  }

  const tokensUsed = maxTokensAllowed;

  // Kiraan Tunai Sebenar
  const cashPaidRm = Math.max(0, Number((totalAmountRm - tokensUsed).toFixed(2)));

  // Pecahan Settlement mengikut addendum rasmi:
  // 1. MORRA Platform Fee: 5%
  // 2. CHIP Gateway Fee: 1% (Min RM0.15, Max RM1.50)
  // 3. Hak Bersih Peniaga: ~94% (Total - Fi 5% - Caj CHIP)
  const { morraPlatformFee, chipGatewayFee, merchantNetAmount } =
    calculateOrderSplitSettlement(totalAmountRm);

  // A. Cipta rekod kepala resit di jadual 'orders'
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      merchant_id: params.merchantId,
      total_amount_rm: totalAmountRm,
      gross_amount: totalAmountRm,
      tokens_used: tokensUsed,
      token_discount_amount: tokensUsed,
      cash_paid_rm: cashPaidRm,
      morra_platform_fee: morraPlatformFee,
      chip_gateway_fee: chipGatewayFee,
      merchant_net_amount: merchantNetAmount,
      platform_fee_rm: morraPlatformFee,
      merchant_net_rm: merchantNetAmount,
      status: "PENDING",
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await calculateAndDistributeMorraCommissions(
      supabaseAdmin,
      order.id,
      user.id,
      params.merchantId,
      totalAmountRm
    );

    return {
      redirectUrl: `${siteUrl}/marketplace?order_id=${order.id}&paid=true`,
    };
  }

  // D. Sesi pembayaran tunai CHIP untuk baki cash_paid_rm
  try {
    const purchase = await createChipPurchase({
      orderId: order.id,
      customerEmail: user.email || "consumer@morra.asia",
      customerName: user.user_metadata?.full_name || "Pelanggan MORRA",
      productTitle: `Pesanan #${order.id.slice(0, 8)} (Tebus ${tokensUsed} Token)`,
      amountInRm: cashPaidRm,
      successRedirectUrl: `${siteUrl}/marketplace?order_id=${order.id}&paid=true`,
      failureRedirectUrl: `${siteUrl}/marketplace?order_id=${order.id}&paid=false`,
      webhookCallbackUrl: `${siteUrl}/api/webhooks/chip`,
    });

    return { checkoutUrl: purchase.checkout_url };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Ralat menghubungi gerbang pembayaran CHIP.";
    return { error: errorMessage };
  }
}
