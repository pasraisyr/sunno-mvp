"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import type { NetworkMemberItem, CommissionRecordItem } from "./types";

interface ProfileJoin {
  full_name?: string | null;
  phone_number?: string | null;
  role?: string | null;
  created_at?: string | null;
}

export async function getNetworkDashboardDataAction() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sila log masuk untuk melihat dashboard rangkaian anda." };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Ambil profil pengguna semasa
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  const isUserRestricted = profile?.role === "USER";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  // Pautan rujukan lalai
  const referralRoleParam = profile?.role === "AGEN_PROMOTER" ? "&role=MERCHANT" : "";
  const referralLink = `${baseUrl}/register?ref=${user.id}${referralRoleParam}`;
  const referralCode = user.id.slice(0, 8).toUpperCase();

  // 1. Ambil rujukan (Hanya L1 dan L2 sahaja mengikut piawaian 2-Level MORRA, tiada L3)
  const { data: treeData } = await supabaseAdmin
    .from("network_trees")
    .select("user_id, tier, created_at, profiles!user_id(full_name, phone_number, role, created_at)")
    .eq("ancestor_id", user.id)
    .in("tier", ["L1", "L2"])
    .order("created_at", { ascending: false });

  const members: NetworkMemberItem[] = [];
  let l1Count = 0;
  let l2Count = 0;

  if (treeData) {
    for (const item of treeData) {
      if (item.tier === "L1") l1Count++;
      else if (item.tier === "L2") l2Count++;

      const p = item.profiles as unknown as ProfileJoin;
      members.push({
        userId: item.user_id,
        fullName: p?.full_name || "Ahli MORRA",
        phoneNumber: p?.phone_number || null,
        role: p?.role || "USER",
        tier: item.tier as "L1" | "L2",
        createdAt: item.created_at,
      });
    }
  }

  // 2. Ambil rekod komisen bagi pengguna ini (daripada commission_ledgers & commissions)
  const { data: commData } = await supabaseAdmin
    .from("commissions")
    .select("*")
    .eq("beneficiary_id", user.id)
    .in("tier", ["L1", "L2"])
    .order("created_at", { ascending: false });

  const commissions: CommissionRecordItem[] = [];
  let totalCommissionsRm = 0;
  let unpaidCommissionsRm = 0;
  let paidCommissionsRm = 0;

  if (commData) {
    for (const c of commData) {
      const amt = Number(c.amount_rm);
      totalCommissionsRm += amt;
      if (c.is_paid) {
        paidCommissionsRm += amt;
      } else {
        unpaidCommissionsRm += amt;
      }

      commissions.push({
        id: c.id,
        orderId: c.order_id,
        tier: c.tier as "L1" | "L2",
        percentage: Number(c.percentage),
        amountRm: amt,
        isPaid: c.is_paid,
        createdAt: c.created_at,
      });
    }
  }

  return {
    user,
    profile,
    isUserRestricted,
    referralLink,
    referralCode,
    totalCommissionsRm: Number(totalCommissionsRm.toFixed(2)),
    unpaidCommissionsRm: Number(unpaidCommissionsRm.toFixed(2)),
    paidCommissionsRm: Number(paidCommissionsRm.toFixed(2)),
    l1Count,
    l2Count,
    members,
    commissions,
  };
}
