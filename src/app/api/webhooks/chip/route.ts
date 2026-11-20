import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyChipSignature } from "@/lib/chip/client";
import { distributeOrderCommissions } from "@/lib/commission";

export async function POST(request: NextRequest) {
  try {
    // 1. Baca isi mesej mentah (raw text) & tandatangan X-Signature dari CHIP
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");
    const publicKey = process.env.CHIP_WEBHOOK_PUBLIC_KEY;

    // 2. Sahkan tandatangan jika Public Key telah ditetapkan
    if (publicKey && !publicKey.startsWith("letak-")) {
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
    const orderId: string = payload.reference; // ID order dari jadual orders kita
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

    // 5. Jika bayaran BERJAYA ('paid')
    if (status === "paid") {
      const { data: existingOrder, error: fetchError } = await supabaseAdmin
        .from("orders")
        .select("id, user_id, cash_paid_rm, tokens_used, status")
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
        // A. Kemas kini status order kepada PAID
        await supabaseAdmin
          .from("orders")
          .update({
            status: "PAID",
            chip_purchase_id: chipPurchaseId,
          })
          .eq("id", orderId);

        // B. Tolak token jika ada ditebus (REDEEMED)
        const tokensRedeemed = Number(existingOrder.tokens_used);
        if (tokensRedeemed > 0) {
          await supabaseAdmin.from("token_ledger").insert({
            user_id: existingOrder.user_id,
            amount: tokensRedeemed,
            type: "REDEEMED",
            reference_id: existingOrder.id,
            description: `Penebusan token untuk pesanan #${existingOrder.id.slice(0, 8)}`,
          });
        }

        // C. Kreditkan Token: RM1.00 tunai = 1 Token
        const tokensEarned = Math.floor(Number(existingOrder.cash_paid_rm));
        if (tokensEarned > 0) {
          await supabaseAdmin.from("token_ledger").insert({
            user_id: existingOrder.user_id,
            amount: tokensEarned,
            type: "EARNED",
            reference_id: existingOrder.id,
            description: `Ganjaran tunai pesanan #${existingOrder.id.slice(0, 8)}`,
          });
        }

        // D. Enjin Komisen 3-Tier (L1: 50%, L2: 15%, L3: 12.5%)
        await distributeOrderCommissions(
          supabaseAdmin,
          existingOrder.id,
          existingOrder.user_id,
          Number(existingOrder.cash_paid_rm)
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
