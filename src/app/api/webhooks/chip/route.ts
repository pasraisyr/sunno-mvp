import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyChipSignature } from "@/lib/chip/client";
import {
  calculateAndDistributeMorraCommissions,
  calculateOrderSplitSettlement,
} from "@/lib/commission";

export async function POST(request: NextRequest) {
  try {
    // 1. Baca isi mesej mentah (raw text) & tandatangan X-Signature dari CHIP
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");
    const publicKey = process.env.CHIP_WEBHOOK_PUBLIC_KEY;

    // 2. Sahkan tandatangan jika Public Key telah ditetapkan
    if (publicKey && !publicKey.startsWith("letak-") && publicKey !== "none") {
      const isValid = verifyChipSignature(rawBody, signature, publicKey);
      if (!isValid) {
        return NextResponse.json(
          { error: "Tandatangan webhook tidak sah (Invalid signature)" },
          { status: 401 }
        );
      }
    }

    // 3. Tukar teks JSON kepada objek JavaScript
    const payload = JSON.parse(rawBody);
    const chipPurchaseId: string = payload.id;
    const orderId: string = payload.reference; // ID order dari jadual orders atau rujukan PIONEER
    const status: string = payload.status; // 'paid', 'failed', 'cancelled', 'expired'

    if (!orderId) {
      return NextResponse.json(
        { error: "Tiada reference (orderId) dalam webhook" },
        { status: 400 }
      );
    }

    // 4. Sambung ke Supabase guna SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ========================================================================
    // KES KHAS A: BAYARAN PAKEJ PIONEER MERCHANT RM512
    // ========================================================================
    if (orderId.startsWith("PIONEER")) {
      const merchantId = orderId.replace(/^PIONEER[-_]/, "");

      if (status === "paid") {
        // Single Source of Truth: Aktifkan kedai & kemas kini status pembayaran
        await supabaseAdmin
          .from("merchants")
          .update({
            is_active: true,
            pioneer_payment_status: "PAID",
            pioneer_paid_at: new Date().toISOString(),
            pioneer_payment_ref: chipPurchaseId,
          })
          .eq("id", merchantId);
      } else if (status === "failed" || status === "cancelled" || status === "expired") {
        await supabaseAdmin
          .from("merchants")
          .update({
            pioneer_payment_status: "UNPAID",
          })
          .eq("id", merchantId)
          .eq("pioneer_payment_status", "PENDING");
      }

      return NextResponse.json({ received: true, type: "PIONEER", status });
    }

    // ========================================================================
    // KES STANDARD B: PESANAN E-COMMERCE MARKETPLACE
    // ========================================================================
    if (status === "paid") {
      const { data: existingOrder, error: fetchError } = await supabaseAdmin
        .from("orders")
        .select("id, user_id, merchant_id, total_amount_rm, cash_paid_rm, tokens_used, status")
        .eq("id", orderId)
        .single();

      if (fetchError || !existingOrder) {
        return NextResponse.json(
          { error: "Order tidak dijumpai" },
          { status: 404 }
        );
      }

      // Hanya proses jika order masih PENDING (Idempotency check)
      if (existingOrder.status === "PENDING") {
        const cashPaid = Number(existingOrder.cash_paid_rm);
        const grossAmount = Number(existingOrder.total_amount_rm);
        const tokenDiscount = Number(existingOrder.tokens_used);

        // Pecahan Settlement (ADDENDUM CHIP GATEWAY FEE 1% Min RM0.15, Max RM1.50 & Fi MORRA 5%)
        const { morraPlatformFee, chipGatewayFee, merchantNetAmount } =
          calculateOrderSplitSettlement(grossAmount);

        // A. Kemas kini status order & pecahan lejar settlement
        await supabaseAdmin
          .from("orders")
          .update({
            status: "PAID",
            chip_purchase_id: chipPurchaseId,
            gross_amount: grossAmount,
            token_discount_amount: tokenDiscount,
            chip_gateway_fee: chipGatewayFee,
            morra_platform_fee: morraPlatformFee,
            merchant_net_amount: merchantNetAmount,
            platform_fee_rm: morraPlatformFee,
            merchant_net_rm: merchantNetAmount,
          })
          .eq("id", orderId);

        // B. Tolak token jika ada ditebus (REDEEMED)
        if (tokenDiscount > 0) {
          await supabaseAdmin.from("token_ledger").insert({
            user_id: existingOrder.user_id,
            amount: tokenDiscount,
            type: "REDEEMED",
            reference_id: existingOrder.id,
            description: `Penebusan token untuk pesanan #${existingOrder.id.slice(0, 8)}`,
          });
        }

        // C. Kreditkan Token Ganjaran Rasmi: RM1 = 1 Token
        const tokensEarned = Math.floor(cashPaid);
        if (tokensEarned > 0) {
          await supabaseAdmin.from("token_ledger").insert({
            user_id: existingOrder.user_id,
            amount: tokensEarned,
            type: "EARNED",
            reference_id: existingOrder.id,
            description: `Kumpul token pesanan #${existingOrder.id.slice(0, 8)}`,
          });
        }

        // D. Enjin Komisen 2-Level MORRA (Berasaskan Fi Platform 5%)
        await calculateAndDistributeMorraCommissions(
          supabaseAdmin,
          existingOrder.id,
          existingOrder.user_id,
          existingOrder.merchant_id,
          grossAmount
        );
      }
    }

    // 6. Jika bayaran GAGAL atau DIBATALKAN ('failed', 'cancelled', 'expired')
    if (status === "failed" || status === "cancelled" || status === "expired") {
      await supabaseAdmin
        .from("orders")
        .update({
          status: "CANCELLED",
          chip_purchase_id: chipPurchaseId,
        })
        .eq("id", orderId)
        .eq("status", "PENDING");
    }

    return NextResponse.json({ received: true, status });
  } catch (error) {
    console.error("Ralat memproses webhook CHIP:", error);
    return NextResponse.json(
      { error: "Ralat dalaman pelayan (Internal Server Error)" },
      { status: 500 }
    );
  }
}
