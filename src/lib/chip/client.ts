import crypto from "crypto";

const CHIP_API_BASE_URL = "https://gate.chip-in.asia/api/v1";

interface CreatePurchaseParams {
  orderId: string;
  customerEmail: string;
  customerName: string;
  productTitle: string;
  amountInRm: number; // Contoh: 512.00
  successRedirectUrl: string;
  failureRedirectUrl: string;
  webhookCallbackUrl: string;
}

// 1. Fungsi untuk cipta sesi pembayaran (Purchase) di CHIP
export async function createChipPurchase(params: CreatePurchaseParams) {
  const brandId = process.env.CHIP_BRAND_ID;
  const secretKey = process.env.CHIP_SECRET_KEY;

  if (!brandId || !secretKey) {
    throw new Error("CHIP_BRAND_ID atau CHIP_SECRET_KEY belum ditetapkan dalam .env.local");
  }

  // CHIP menerima harga dalam unit SEN (RM1.00 = 100 sen)
  const priceInCents = Math.round(params.amountInRm * 100);

  const response = await fetch(`${CHIP_API_BASE_URL}/purchases/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      brand_id: brandId,
      reference: params.orderId,
      client: {
        email: params.customerEmail,
        full_name: params.customerName,
      },
      purchase: {
        currency: "MYR",
        products: [
          {
            name: params.productTitle,
            price: priceInCents,
            quantity: 1,
          },
        ],
      },
      success_redirect: params.successRedirectUrl,
      failure_redirect: params.failureRedirectUrl,
      success_callback: params.webhookCallbackUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ralat CHIP API (${response.status}): ${errorText}`);
  }

  return response.json();
}

// 2. Fungsi untuk mengesahkan tandatangan (X-Signature) daripada Webhook CHIP
export function verifyChipSignature(
  rawBody: string,
  signatureBase64: string | null,
  publicKeyPem: string | undefined
): boolean {
  if (!signatureBase64 || !publicKeyPem) {
    return false;
  }

  try {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(rawBody);
    return verifier.verify(publicKeyPem, signatureBase64, "base64");
  } catch {
    return false;
  }
}