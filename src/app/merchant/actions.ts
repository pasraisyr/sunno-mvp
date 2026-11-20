"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createChipPurchase } from "@/lib/chip/client";
import { revalidatePath } from "next/cache";

// 1. Dapatkan data peniaga & kedai semasa yang sedang log masuk
export async function getMerchantDashboardData(isPaidRedirect?: boolean) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sila log masuk terlebih dahulu." };
  }

  // Ambil profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Ambil maklumat kedai peniaga (jika ada)
  const { data: merchant } = await supabase
    .from("merchants")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // JIKA PATAH BALIK DARI CHIP DENGAN STATUS ?paid=true
  if (isPaidRedirect && merchant && !merchant.is_active) {
    await supabase
      .from("merchants")
      .update({ is_active: true })
      .eq("id", merchant.id);
    merchant.is_active = true;
  }

  // Jika kedai wujud, ambil senarai produk kedai ini
  let products = [];
  let orders = [];
  if (merchant) {
    const { data: prodData } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false });

    products = prodData || [];

    const { data: ordData } = await supabase
      .from("orders")
      .select("*, profiles(full_name, phone_number), order_items(*, products(title))")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false });
    orders = ordData || [];
  }

  // Ambil semua kategori untuk pilihan dropdown produk
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  return {
    user,
    profile,
    merchant,
    products,
    orders,
    categories: categories || [],
  };
}

// 2. Daftar atau Kemas Kini Profil Kedai
export async function saveMerchantShopAction(formData: {
  shopName: string;
  slug: string;
  description: string;
  address: string;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak sah." };

  // Bersihkan format slug (huruf kecil & sengkang sahaja, cth: "kedai-ali")
  const cleanSlug = formData.slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Semak sama ada kedai dah wujud
  const { data: existing } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("merchants")
      .update({
        shop_name: formData.shopName,
        slug: cleanSlug,
        description: formData.description,
        address: formData.address,
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("merchants").insert({
      user_id: user.id,
      shop_name: formData.shopName,
      slug: cleanSlug,
      description: formData.description,
      address: formData.address,
      is_active: false, // Perlu bayar RM512 untuk aktif
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/merchant/dashboard");
  return { success: true };
}

// 3. Tambah Produk Baru Kedai
export async function addProductAction(formData: {
  merchantId: string;
  title: string;
  description: string;
  priceRm: number;
  categoryId?: string;
  imageUrl?: string;
}) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("products").insert({
    merchant_id: formData.merchantId,
    title: formData.title,
    description: formData.description,
    price_rm: formData.priceRm,
    category_id: formData.categoryId || null,
    image_url: formData.imageUrl || null,
    is_available: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/merchant/dashboard");
  return { success: true };
}

// 4. Padam Produk
export async function deleteProductAction(productId: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/merchant/dashboard");
  return { success: true };
}

// 5. Cipta Sesi Bayaran CHIP Pakej Pioneer Merchant RM512
export async function payPioneerPackageAction(merchantId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak sah." };

  try {
    // Bina sesi bayaran CHIP
    const purchase = await createChipPurchase({
      orderId: `PIONEER-${merchantId.slice(0, 8)}`,
      customerEmail: user.email || "merchant@sunno.asia",
      customerName: user.user_metadata?.full_name || "Pioneer Merchant",
      productTitle: "Pakej Pioneer Merchant Sunno.asia (Setup Fee)",
      amountInRm: 512.0,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/merchant/dashboard?paid=true`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/merchant/dashboard?paid=false`,
      webhookCallbackUrl: "https://sunno.asia/api/webhooks/chip",
    });

    return { checkoutUrl: purchase.checkout_url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghubungi sistem pembayaran CHIP.";
    return { error: msg };
  }
}

// 6. Kemas kini status pesanan (contoh: PENDING -> PAID -> COMPLETED)
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED"
) {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/merchant/dashboard");
  return { success: true };
}
