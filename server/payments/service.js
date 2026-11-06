import crypto from "node:crypto";
import { createPayment, getPayment, updatePayment } from "./store.js";

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 100_000_000;

export async function startPayment({ amount, orderId, description, customer, paymentType = "FULL", totalAmount }) {
  const numericAmount = Number(amount);
  if (!Number.isInteger(numericAmount) || numericAmount < MIN_AMOUNT || numericAmount > MAX_AMOUNT) {
    const error = new Error(`Nominal harus bilangan bulat antara Rp${MIN_AMOUNT.toLocaleString("id-ID")} dan Rp${MAX_AMOUNT.toLocaleString("id-ID")}.`);
    error.statusCode = 400;
    throw error;
  }

  const payment = {
    id: `PAY-${crypto.randomUUID()}`,
    externalId: `SYN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    orderId: String(orderId || ""),
    amount: numericAmount,
    currency: "IDR",
    description: String(description || "Pembayaran SYNAPSE CORE").slice(0, 200),
    customer: customer ? { name: String(customer.name || "").slice(0, 100), phone: String(customer.phone || "").slice(0, 30) } : null,
    provider: "manual-qris",
    paymentType: ["DP", "FINAL", "FULL"].includes(paymentType) ? paymentType : "FULL",
    totalAmount: Number.isInteger(Number(totalAmount)) ? Number(totalAmount) : numericAmount,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  // QRIS statis diverifikasi manual oleh admin melalui bukti pembayaran.
  return createPayment(payment);
}

export function findPayment(id) {
  return getPayment(id);
}

export function markPaymentFromWebhook({ paymentId, externalId, status, providerReference }) {
  const payment = paymentId ? getPayment(paymentId) : null;
  if (!payment || (externalId && payment.externalId !== externalId)) return null;
  const allowedStatuses = new Set(["PENDING", "PAID", "EXPIRED", "FAILED"]);
  if (!allowedStatuses.has(status)) return null;
  return updatePayment(payment.id, { status, providerReference: providerReference || payment.providerReference || "" });
}
