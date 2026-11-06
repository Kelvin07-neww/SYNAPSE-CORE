import crypto from "node:crypto";
import { config, missingDanaConfig } from "../config.js";

export class PaymentProviderNotConfiguredError extends Error {
  constructor(message) {
    super(message);
    this.name = "PaymentProviderNotConfiguredError";
  }
}

// This adapter is intentionally not allowed to create a QR before merchant
// credentials and DANA's API contract are configured. QRIS credentials must
// never be exposed to the Vite/React application.
export async function createDanaQrisPayment(payment) {
  const missing = missingDanaConfig();
  if (config.paymentProvider !== "dana-qris" || missing.length) {
    throw new PaymentProviderNotConfiguredError(
      `DANA QRIS belum dikonfigurasi. Lengkapi: ${missing.join(", ") || "PAYMENT_PROVIDER=dana-qris"}`,
    );
  }

  // DANA Business can use different API products/contracts per merchant.
  // Add the signed OAuth + QRIS create request here after the merchant's
  // official endpoint, request schema, and certificate are issued by DANA.
  throw new PaymentProviderNotConfiguredError(
    "Kontrak API QRIS dari DANA Business belum dipasang. Backend dan endpoint pembayaran sudah siap.",
  );
}

export function verifyDanaWebhook(rawBody, signature) {
  if (!config.dana.DANA_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", config.dana.DANA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const received = String(signature).replace(/^sha256=/i, "");
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
