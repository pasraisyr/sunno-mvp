"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { AdminMerchantItem, AdminUserItem, AdminOrderItem } from "./types";

interface ProfileJoin {
  full_name?: string | null;
  phone_number?: string | null;
}

export async function getAdminDashboardDataAction() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sila log masuk untuk mengakses panel pentadbir." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Semak peranan pengguna semasa
  const { data: myProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = myProfile?.role === "ADMIN";

  // 1. Ambil semua Merchant
  const { data: merchantsData } = await supabaseAdmin
    .from("merchants")
    .select("id, shop_name, slug, is_active, created_at, profiles(full_name, phone_number)")
    .order("created_at", { ascending: false });

  const merchants: AdminMerchantItem[] = (merchantsData || []).map((m) => {
    const p = m.profiles as unknown as ProfileJoin;
    return {
      id: m.id,
      shopName: m.shop_name,
      slug: m.slug,
      ownerName: p?.full_name || "Peniaga",
      ownerPhone: p?.phone_number || null,
      isActive: m.is_active,
      pioneerFeePaidRm: m.is_active ? 512.0 : 0.0,
      createdAt: m.created_at,
    };
  });

  // 2. Ambil semua Pengguna & Penaja mereka
  const { data: usersData } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone_number, role, created_at, sponsor_id")
    .order("created_at", { ascending: false });

  // Cari nama penaja untuk paparan
  const userMap = new Map<string, string>();
  for (const u of usersData || []) {
    userMap.set(u.id, u.full_name);
  }

  const users: AdminUserItem[] = (usersData || []).map((u) => ({
    id: u.id,
    fullName: u.full_name,
    phoneNumber: u.phone_number,
    role: u.role,
    sponsorName: u.sponsor_id ? userMap.get(u.sponsor_id) || "Penaja ID: " + u.sponsor_id.slice(0, 6) : null,
    createdAt: u.created_at,
  }));

  // 3. Ambil semua Pesanan Transaksi
  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount_rm, tokens_used, cash_paid_rm, platform_fee_rm, merchant_net_rm, status, created_at, profiles(full_name), merchants(shop_name)")
    .order("created_at", { ascending: false });

  const orders: AdminOrderItem[] = (ordersData || []).map((o) => {
    const prof = o.profiles as unknown as { full_name?: string };
    const merch = o.merchants as unknown as { shop_name?: string };
    return {
      id: o.id,
      customerName: prof?.full_name || "Pelanggan",
      shopName: merch?.shop_name || "Kedai",
      totalAmountRm: Number(o.total_amount_rm),
      tokensUsed: Number(o.tokens_used),
      cashPaidRm: Number(o.cash_paid_rm),
      platformFeeRm: Number(o.platform_fee_rm || 0),
      merchantNetRm: Number(o.merchant_net_rm || 0),
      status: o.status,
      createdAt: o.created_at,
    };
  });

  // 4. Statistik Kewangan Bersih HQ & Ekosistem
  const totalActiveMerchants = merchants.filter((m) => m.isActive).length;

  // A. Kutipan Yuran Pioneer RM512 (Hasil Lesen / Pendaftaran Peniaga ke HQ)
  const totalPioneerFeesRm = totalActiveMerchants * 512.0;

  // B. Nilai Kasar Transaksi Pasaran (GMV - Jualan Peniaga di Marketplace)
  const paidOrders = orders.filter((o) => o.status === "PAID" || o.status === "COMPLETED");
  const totalGmvRm = paidOrders.reduce((sum, o) => sum + o.totalAmountRm, 0);

  // C. Bahagian Syarikat (22.5% daripada 10% Pool komisen transaksi + Caj Platform)
  const totalCompanyShareRm = paidOrders.reduce((sum, o) => {
    const commissionPool = o.cashPaidRm * 0.1;
    const companyPoolShare = commissionPool * 0.225;
    return sum + companyPoolShare + o.platformFeeRm;
  }, 0);

  // D. Jumlah Pendapatan Bersih HQ (Pioneer Fees + Bahagian Syarikat)
  const totalHqRevenueRm = totalPioneerFeesRm + totalCompanyShareRm;

  // Kira jumlah token yang telah dikeluarkan
  const { data: tokenData } = await supabaseAdmin
    .from("token_ledger")
    .select("amount")
    .eq("type", "EARNED");

  const totalTokensIssued = (tokenData || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  return {
    user: { id: user.id, email: user.email },
    isAdmin,
    stats: {
      totalPioneerFeesRm: Number(totalPioneerFeesRm.toFixed(2)),
      totalCompanyShareRm: Number(totalCompanyShareRm.toFixed(2)),
      totalHqRevenueRm: Number(totalHqRevenueRm.toFixed(2)),
      totalGmvRm: Number(totalGmvRm.toFixed(2)),
      totalOrdersCount: orders.length,
      totalActiveMerchants,
      totalUsersCount: users.length,
      totalTokensIssued,
    },
    merchants,
    users,
    orders,
  };
}

// Tindakan 1: Luluskan atau Nyahaktifkan Merchant
export async function toggleMerchantStatusAction(merchantId: string, newActiveStatus: boolean) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("merchants")
    .update({ is_active: newActiveStatus })
    .eq("id", merchantId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

// Tindakan 2: Kemas Kini Peranan Pengguna (Role)
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "CONSUMER" | "MERCHANT" | "ADMIN"
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

// Tindakan Pembantu: Naik Taraf Akaun Sendiri Menjadi ADMIN (Untuk Ujian Dev Tempatan)
export async function claimAdminRoleAction() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesi tidak sah." };

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: "ADMIN" })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

