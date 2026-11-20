"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getWalletDataAction() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sila log masuk untuk melihat dompet anda." };
  }

  // Ambil profil pengguna
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number")
    .eq("id", user.id)
    .single();

  // Ambil semua transaksi lejar token bagi pengguna ini
  const { data: transactions } = await supabase
    .from("token_ledger")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ledgerList = transactions || [];

  // Kiraan baki dan statistik
  let currentBalance = 0;
  let totalEarned = 0;
  let totalRedeemed = 0;

  for (const item of ledgerList) {
    const val = Number(item.amount);
    if (item.type === "EARNED") {
      totalEarned += val;
      currentBalance += val;
    } else if (item.type === "REDEEMED") {
      totalRedeemed += val;
      currentBalance -= val;
    } else if (item.type === "ADJUSTMENT") {
      currentBalance += val;
    }
  }

  return {
    user,
    profile,
    currentBalance,
    totalEarned,
    totalRedeemed,
    transactions: ledgerList,
  };
}

