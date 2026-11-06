import { db, parseJson } from "../database.js";

const mapPayment = (row) => row && ({
  id: row.id, externalId: row.external_id, orderId: row.order_id, amount: row.amount,
  currency: row.currency, description: row.description, customer: parseJson(row.customer_json),
  provider: row.provider, providerReference: row.provider_reference, status: row.status,
  paymentType: row.payment_type || "FULL", totalAmount: row.total_amount || row.amount,
  createdAt: row.created_at, updatedAt: row.updated_at,
});

export function createPayment(payment) {
  db.prepare(`INSERT INTO payments (id, external_id, order_id, amount, currency, description, customer_json, provider, provider_reference, status, created_at, updated_at, payment_type, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(payment.id, payment.externalId, payment.orderId || null, payment.amount, payment.currency, payment.description, payment.customer ? JSON.stringify(payment.customer) : null, payment.provider, payment.providerReference || null, payment.status, payment.createdAt, payment.updatedAt || null, payment.paymentType || "FULL", payment.totalAmount || payment.amount);
  return payment;
}

export function getPayment(id) {
  return mapPayment(db.prepare("SELECT * FROM payments WHERE id = ?").get(id));
}

export function updatePayment(id, changes) {
  const payment = getPayment(id);
  if (!payment) return null;
  const updated = { ...payment, ...changes, updatedAt: new Date().toISOString() };
  db.prepare(`UPDATE payments SET order_id = ?, amount = ?, currency = ?, description = ?, customer_json = ?, provider = ?, provider_reference = ?, status = ?, updated_at = ?, payment_type = ?, total_amount = ? WHERE id = ?`)
    .run(updated.orderId || null, updated.amount, updated.currency, updated.description, updated.customer ? JSON.stringify(updated.customer) : null, updated.provider, updated.providerReference || null, updated.status, updated.updatedAt, updated.paymentType || "FULL", updated.totalAmount || updated.amount, id);
  return updated;
}
