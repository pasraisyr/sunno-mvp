import { SupabaseClient } from "@supabase/supabase-js";

// Konfigurasi Piawai MORRA Fasa 1 (Berasaskan Fi Platform 5%)
export const MORRA_CONFIG = {
  PLATFORM_FEE_PERCENT: 0.05, // 5% daripada nilai transaksi yang layak
  SCENARIO_A: {
    PROMOTER_L1: 0.5, // 50% daripada fi platform (2.5% nilai transaksi)
    MORRA: 0.5,       // 50% daripada fi platform (2.5% nilai transaksi)
  },
  SCENARIO_B: {
    MERCHANT_L1: 0.5, // 50% daripada fi platform (2.5% nilai transaksi)
    PROMOTER_L2: 0.1, // 10% daripada fi platform (0.5% nilai transaksi)
    MORRA: 0.4,       // 40% daripada fi platform (2.0% nilai transaksi)
    MORRA_NO_PROMOTER: 0.5, // 50% jika merchant tiada agen perujuk
  },
  SCENARIO_C: {
    MERCHANT_L1: 0.5, // 50% daripada fi platform (2.5% nilai transaksi)
    MERCHANT_SELLER: 0.0, // 0% komisen networking
    MORRA: 0.5,       // 50% daripada fi platform (2.5% nilai transaksi)
  },
};

// Konfigurasi Piawai Caj Gerbang Pembayaran CHIP (ADDENDUM CHIP FEE)
export const CHIP_FEE_CONFIG = {
  PERCENT: 0.01,      // 1% daripada nilai transaksi
  MIN_FEE_RM: 0.15,   // Minimum caj RM0.15
  MAX_FEE_RM: 1.50,   // Maksimum caj RM1.50
};

/**
 * Formula CHIP Payment Gateway Fee:
 * 1% x Transaction Amount (Min RM0.15, Max RM1.50)
 * Caj ini terpisah sepenuhnya daripada Fi Platform MORRA 5% dan tidak termasuk dalam perkongsian komisen.
 */
export function calculateChipGatewayFee(transactionAmountRm: number): number {
  if (transactionAmountRm <= 0) return 0;
  const rawFee = transactionAmountRm * CHIP_FEE_CONFIG.PERCENT;
  const cappedFee = Math.min(Math.max(rawFee, CHIP_FEE_CONFIG.MIN_FEE_RM), CHIP_FEE_CONFIG.MAX_FEE_RM);
  return Number(cappedFee.toFixed(2));
}

/**
 * Formula Struktur Pecahan Settlement Pesanan:
 * 1. MORRA Platform Fee: 5%
 * 2. CHIP Gateway Fee: 1% (Min RM0.15, Max RM1.50)
 * 3. Jumlah Potongan Asas: ~6%
 * 4. Baki Bersih Merchant: ~94%
 */
export function calculateOrderSplitSettlement(transactionAmountRm: number) {
  const morraPlatformFee = Number((transactionAmountRm * MORRA_CONFIG.PLATFORM_FEE_PERCENT).toFixed(2));
  const chipGatewayFee = calculateChipGatewayFee(transactionAmountRm);
  const merchantNetAmount = Number(Math.max(0, transactionAmountRm - morraPlatformFee - chipGatewayFee).toFixed(2));

  return {
    morraPlatformFee,
    chipGatewayFee,
    merchantNetAmount,
    totalDeduction: Number((morraPlatformFee + chipGatewayFee).toFixed(2)),
  };
}

export type ScenarioType = "SCENARIO_A" | "SCENARIO_B" | "SCENARIO_C" | "NO_REFERRAL";

export interface CommissionSplitResult {
  scenario: ScenarioType;
  platformFee: number;
  promoterCommission: number;
  promoterId?: string;
  referrerMerchantCommission: number;
  referrerMerchantId?: string;
  morraRevenue: number;
  ledgers: Array<{
    scenario_type: ScenarioType;
    recipient_id: string | null;
    recipient_role: "AGEN_PROMOTER" | "MERCHANT" | "MORRA";
    network_level: number;
    platform_fee_base: number;
    percentage_allocated: number;
    commission_amount: number;
  }>;
}

/**
 * Enjin Agihan Komisen 2-Level MORRA
 * Dikira daripada nilai Fi Platform 5%
 */
export async function calculateAndDistributeMorraCommissions(
  supabaseAdmin: SupabaseClient,
  orderId: string,
  buyerId: string,
  sellerMerchantId: string,
  eligibleAmountRm: number
): Promise<CommissionSplitResult | { alreadyDistributed: true }> {
  // 1. Idempotency Check: Elakkan komisen berganda
  const { data: existingLedger } = await supabaseAdmin
    .from("commission_ledgers")
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (existingLedger && existingLedger.length > 0) {
    return { alreadyDistributed: true };
  }

  // 2. Kira Fi Platform 5%
  const platformFee = Number((eligibleAmountRm * MORRA_CONFIG.PLATFORM_FEE_PERCENT).toFixed(2));
  if (platformFee <= 0) {
    return {
      scenario: "NO_REFERRAL",
      platformFee: 0,
      promoterCommission: 0,
      referrerMerchantCommission: 0,
      morraRevenue: 0,
      ledgers: [],
    };
  }

  // 3. Kenal pasti pembeli & penjual
  const { data: buyerProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, role, sponsor_id, referred_by_id, referred_by_role")
    .eq("id", buyerId)
    .single();

  // Tentukan siapa penaja/perujuk pembeli
  const buyerReferrerId = buyerProfile?.referred_by_id || buyerProfile?.sponsor_id || null;

  let scenario: ScenarioType = "NO_REFERRAL";
  let promoterCommission = 0;
  let promoterId: string | undefined;
  let referrerMerchantCommission = 0;
  let referrerMerchantId: string | undefined;
  let morraRevenue = platformFee;

  const ledgers: CommissionSplitResult["ledgers"] = [];

  // --------------------------------------------------------------------------
  // SENARIO A: Pembeli adalah Merchant yang diperkenalkan oleh Agen Promoter
  // --------------------------------------------------------------------------
  if (buyerProfile?.role === "MERCHANT") {
    // Cari kedai pembeli untuk mengetahui agen promoter yang merujuknya
    const { data: buyerMerchant } = await supabaseAdmin
      .from("merchants")
      .select("id, referred_by_promoter_id")
      .eq("user_id", buyerId)
      .maybeSingle();

    const agentId = buyerMerchant?.referred_by_promoter_id || buyerReferrerId;

    if (agentId) {
      // Sahkan peranan agen
      const { data: agentProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", agentId)
        .maybeSingle();

      if (agentProfile && (agentProfile.role === "AGEN_PROMOTER" || agentProfile.role === "PARTNER" || agentProfile.role === "NETWORKER")) {
        scenario = "SCENARIO_A";
        promoterId = agentProfile.id;
        promoterCommission = Number((platformFee * MORRA_CONFIG.SCENARIO_A.PROMOTER_L1).toFixed(2));
        morraRevenue = Number((platformFee - promoterCommission).toFixed(2));

        ledgers.push({
          scenario_type: "SCENARIO_A",
          recipient_id: promoterId || null,
          recipient_role: "AGEN_PROMOTER",
          network_level: 1, // L1
          platform_fee_base: platformFee,
          percentage_allocated: 50.0,
          commission_amount: promoterCommission,
        });

        ledgers.push({
          scenario_type: "SCENARIO_A",
          recipient_id: null,
          recipient_role: "MORRA",
          network_level: 0, // MORRA
          platform_fee_base: platformFee,
          percentage_allocated: 50.0,
          commission_amount: morraRevenue,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // JIKA BUKAN SENARIO A: Pembeli adalah Pengguna Biasa (USER)
  // --------------------------------------------------------------------------
  if (scenario === "NO_REFERRAL" && buyerReferrerId) {
    // Semak profil perujuk pembeli
    const { data: referrerProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", buyerReferrerId)
      .maybeSingle();

    if (referrerProfile) {
      // Jika perujuk adalah MERCHANT
      if (referrerProfile.role === "MERCHANT") {
        // Cari merchant ID bagi perujuk ini
        const { data: refMerchant } = await supabaseAdmin
          .from("merchants")
          .select("id, user_id, referred_by_promoter_id")
          .eq("user_id", referrerProfile.id)
          .maybeSingle();

        const isSameShop = refMerchant && refMerchant.id === sellerMerchantId;

        if (isSameShop) {
          // ------------------------------------------------------------------
          // SENARIO B: Pelanggan Merchant A membeli di Merchant A sendiri
          // ------------------------------------------------------------------
          scenario = "SCENARIO_B";
          referrerMerchantId = referrerProfile.id;
          referrerMerchantCommission = Number((platformFee * MORRA_CONFIG.SCENARIO_B.MERCHANT_L1).toFixed(2));

          // Semak jika Merchant A ada Agen Promoter penaja (L2)
          const promoterL2Id = refMerchant?.referred_by_promoter_id;
          if (promoterL2Id) {
            promoterId = promoterL2Id;
            promoterCommission = Number((platformFee * MORRA_CONFIG.SCENARIO_B.PROMOTER_L2).toFixed(2));
            morraRevenue = Number((platformFee - referrerMerchantCommission - promoterCommission).toFixed(2));

            ledgers.push({
              scenario_type: "SCENARIO_B",
              recipient_id: referrerMerchantId || null,
              recipient_role: "MERCHANT",
              network_level: 1, // L1
              platform_fee_base: platformFee,
              percentage_allocated: 50.0,
              commission_amount: referrerMerchantCommission,
            });

            ledgers.push({
              scenario_type: "SCENARIO_B",
              recipient_id: promoterId || null,
              recipient_role: "AGEN_PROMOTER",
              network_level: 2, // L2
              platform_fee_base: platformFee,
              percentage_allocated: 10.0,
              commission_amount: promoterCommission,
            });

            ledgers.push({
              scenario_type: "SCENARIO_B",
              recipient_id: null,
              recipient_role: "MORRA",
              network_level: 0,
              platform_fee_base: platformFee,
              percentage_allocated: 40.0,
              commission_amount: morraRevenue,
            });
          } else {
            // Tiada Agen Promoter bagi Merchant A: Baki 10% kembali ke MORRA (MORRA = 50%)
            morraRevenue = Number((platformFee - referrerMerchantCommission).toFixed(2));

            ledgers.push({
              scenario_type: "SCENARIO_B",
              recipient_id: referrerMerchantId || null,
              recipient_role: "MERCHANT",
              network_level: 1,
              platform_fee_base: platformFee,
              percentage_allocated: 50.0,
              commission_amount: referrerMerchantCommission,
            });

            ledgers.push({
              scenario_type: "SCENARIO_B",
              recipient_id: null,
              recipient_role: "MORRA",
              network_level: 0,
              platform_fee_base: platformFee,
              percentage_allocated: 50.0,
              commission_amount: morraRevenue,
            });
          }
        } else {
          // ------------------------------------------------------------------
          // SENARIO C: Pelanggan Merchant A membeli di Merchant B
          // ------------------------------------------------------------------
          scenario = "SCENARIO_C";
          referrerMerchantId = referrerProfile.id;
          referrerMerchantCommission = Number((platformFee * MORRA_CONFIG.SCENARIO_C.MERCHANT_L1).toFixed(2));
          morraRevenue = Number((platformFee - referrerMerchantCommission).toFixed(2));

          ledgers.push({
            scenario_type: "SCENARIO_C",
            recipient_id: referrerMerchantId || null,
            recipient_role: "MERCHANT",
            network_level: 1, // L1
            platform_fee_base: platformFee,
            percentage_allocated: 50.0,
            commission_amount: referrerMerchantCommission,
          });

          ledgers.push({
            scenario_type: "SCENARIO_C",
            recipient_id: null,
            recipient_role: "MORRA",
            network_level: 0, // MORRA
            platform_fee_base: platformFee,
            percentage_allocated: 50.0,
            commission_amount: morraRevenue,
          });
        }
      } else if (referrerProfile.role === "AGEN_PROMOTER") {
        // Agen terus memperkenalkan User
        scenario = "SCENARIO_A";
        promoterId = referrerProfile.id;
        promoterCommission = Number((platformFee * MORRA_CONFIG.SCENARIO_A.PROMOTER_L1).toFixed(2));
        morraRevenue = Number((platformFee - promoterCommission).toFixed(2));

        ledgers.push({
          scenario_type: "SCENARIO_A",
          recipient_id: promoterId || null,
          recipient_role: "AGEN_PROMOTER",
          network_level: 1,
          platform_fee_base: platformFee,
          percentage_allocated: 50.0,
          commission_amount: promoterCommission,
        });

        ledgers.push({
          scenario_type: "SCENARIO_A",
          recipient_id: null,
          recipient_role: "MORRA",
          network_level: 0,
          platform_fee_base: platformFee,
          percentage_allocated: 50.0,
          commission_amount: morraRevenue,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // JIKA TIADA REFERRAL: 100% Fi Platform kepada MORRA
  // --------------------------------------------------------------------------
  if (scenario === "NO_REFERRAL") {
    morraRevenue = platformFee;
    ledgers.push({
      scenario_type: "NO_REFERRAL",
      recipient_id: null,
      recipient_role: "MORRA",
      network_level: 0,
      platform_fee_base: platformFee,
      percentage_allocated: 100.0,
      commission_amount: morraRevenue,
    });
  }

  // Simpan ke jadual commission_ledgers
  if (ledgers.length > 0) {
    const rowsToInsert = ledgers.map((l) => ({
      order_id: orderId,
      scenario_type: l.scenario_type,
      recipient_id: l.recipient_id,
      recipient_role: l.recipient_role,
      network_level: l.network_level,
      platform_fee_base: l.platform_fee_base,
      percentage_allocated: l.percentage_allocated,
      commission_amount: l.commission_amount,
      status: "CREDITED",
    }));

    await supabaseAdmin.from("commission_ledgers").insert(rowsToInsert);
  }

  // Kemas kini rekod orders dengan pecahan settlement & status
  await supabaseAdmin
    .from("orders")
    .update({
      morra_platform_fee: platformFee,
      promoter_commission: promoterCommission,
      referrer_merchant_commission: referrerMerchantCommission,
      morra_net_revenue: morraRevenue,
      commission_processed: true,
    })
    .eq("id", orderId);

  // Simpan juga ke jadual legacy `commissions` jika ada penerima komisen (untuk backward-compatibility paparan ringkas)
  const legacyCommissions: Array<{
    order_id: string;
    beneficiary_id: string;
    tier: "L1" | "L2";
    percentage: number;
    amount_rm: number;
    is_paid: boolean;
  }> = [];

  for (const l of ledgers) {
    if (l.recipient_id && (l.network_level === 1 || l.network_level === 2)) {
      legacyCommissions.push({
        order_id: orderId,
        beneficiary_id: l.recipient_id,
        tier: l.network_level === 1 ? "L1" : "L2",
        percentage: l.percentage_allocated,
        amount_rm: l.commission_amount,
        is_paid: false,
      });
    }
  }

  if (legacyCommissions.length > 0) {
    await supabaseAdmin.from("commissions").insert(legacyCommissions);
  }

  return {
    scenario,
    platformFee,
    promoterCommission,
    promoterId,
    referrerMerchantCommission,
    referrerMerchantId,
    morraRevenue,
    ledgers,
  };
}

// Fungsi serasi legasi jika dipanggil dari tempat lama
export async function distributeOrderCommissions(
  supabaseAdmin: SupabaseClient,
  orderId: string,
  buyerId: string,
  cashPaidRm: number
) {
  // Dapatkan seller merchant ID dari order
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("merchant_id")
    .eq("id", orderId)
    .single();

  const sellerMerchantId = order?.merchant_id || "";
  return calculateAndDistributeMorraCommissions(
    supabaseAdmin,
    orderId,
    buyerId,
    sellerMerchantId,
    cashPaidRm
  );
}
