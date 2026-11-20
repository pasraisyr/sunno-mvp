import { SupabaseClient } from "@supabase/supabase-js";

// Konfigurasi peratusan tabung komisen Sunno (Configurable)
export const COMMISSION_CONFIG = {
  POOL_PERCENTAGE: 0.1, // 10% daripada perbelanjaan tunai pesanan dijadikan Commission Pool
  L1_SHARE: 0.5, // 50% daripada Pool untuk L1
  L2_SHARE: 0.15, // 15% daripada Pool untuk L2
  L3_SHARE: 0.125, // 12.5% daripada Pool untuk L3
  COMPANY_SHARE: 0.225, // 22.5% daripada Pool untuk Syarikat
};

export async function distributeOrderCommissions(
  supabaseAdmin: SupabaseClient,
  orderId: string,
  buyerId: string,
  cashPaidRm: number
) {
  if (cashPaidRm <= 0) return { distributed: 0 };

  // Elakkan pengiraan komisen berganda (Idempotency check)
  const { data: existingComms } = await supabaseAdmin
    .from("commissions")
    .select("id")
    .eq("order_id", orderId);

  if (existingComms && existingComms.length > 0) {
    return { alreadyDistributed: true };
  }

  // Cari salasilah penaja 3-Tier bagi pembeli ini dari network_trees
  const { data: ancestors } = await supabaseAdmin
    .from("network_trees")
    .select("ancestor_id, tier")
    .eq("user_id", buyerId);

  if (!ancestors || ancestors.length === 0) {
    return { distributed: 0, reason: "Tiada penaja rangkaian bagi pembeli ini." };
  }

  // Kira Commission Pool
  const commissionPool = cashPaidRm * COMMISSION_CONFIG.POOL_PERCENTAGE;

  const commissionRows: Array<{
    order_id: string;
    beneficiary_id: string;
    tier: "L1" | "L2" | "L3";
    percentage: number;
    amount_rm: number;
    is_paid: boolean;
  }> = [];

  for (const anc of ancestors) {
    let share = 0;
    let percentage = 0;

    if (anc.tier === "L1") {
      share = COMMISSION_CONFIG.L1_SHARE;
      percentage = 50.0;
    } else if (anc.tier === "L2") {
      share = COMMISSION_CONFIG.L2_SHARE;
      percentage = 15.0;
    } else if (anc.tier === "L3") {
      share = COMMISSION_CONFIG.L3_SHARE;
      percentage = 12.5;
    }

    const commAmount = Number((commissionPool * share).toFixed(2));
    if (commAmount > 0) {
      commissionRows.push({
        order_id: orderId,
        beneficiary_id: anc.ancestor_id,
        tier: anc.tier,
        percentage,
        amount_rm: commAmount,
        is_paid: false,
      });
    }
  }

  if (commissionRows.length > 0) {
    await supabaseAdmin.from("commissions").insert(commissionRows);
  }

  return { distributed: commissionRows.length, totalPool: commissionPool };
}

