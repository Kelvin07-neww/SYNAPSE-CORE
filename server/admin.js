import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { config } from "./config.js";
import { db, parseJson } from "./database.js";

const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "uploads");
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const extensionByType = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf" };
const adminSessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createAdminSession(username, password) {
  if (!config.adminApiKey || username !== config.adminUsername || !safeEqual(password, config.adminApiKey)) return null;
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  adminSessions.set(token, expiresAt);
  return { token, expiresAt: new Date(expiresAt).toISOString() };
}

export function revokeAdminSession(token) { adminSessions.delete(token); }

export function requireAdmin(req, res, next) {
  const token = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!config.adminApiKey) return res.status(503).json({ error: "ADMIN_API_KEY belum dikonfigurasi di server." });
  const expiresAt = adminSessions.get(token);
  if (expiresAt && expiresAt <= Date.now()) adminSessions.delete(token);
  if (!token || (!safeEqual(token, config.adminApiKey) && !adminSessions.has(token))) return res.status(401).json({ error: "Sesi admin tidak valid atau telah berakhir." });
  return next();
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => { fs.mkdirSync(uploadDir, { recursive: true }); callback(null, uploadDir); },
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${extensionByType[file.mimetype] || ""}`),
});

export const uploadPaymentProof = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedTypes.has(file.mimetype)),
}).single("proof");

const mapOrder = (row) => ({
  id: row.id, createdAt: row.created_at, status: row.status, type: row.type, source: row.source,
  customer: { phone: row.phone || "", email: row.email || "", name: row.name || "" },
  brief: parseJson(row.brief_json), estimate: parseJson(row.estimate_json),
});
const mapPayment = (row) => row && ({ id: row.id, amount: row.amount, totalAmount: row.total_amount || row.amount, paymentType: row.payment_type || "FULL", currency: row.currency, status: row.status, provider: row.provider, createdAt: row.created_at });
const mapProof = (row) => ({ id: row.id, paymentId: row.payment_id, originalName: row.original_name, mimeType: row.mime_type, size: row.size, status: row.status, reviewNote: row.review_note, uploadedAt: row.uploaded_at, reviewedAt: row.reviewed_at });

export function listOrderRecap() {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all().map(mapOrder);
  const paymentRows = db.prepare("SELECT * FROM payments ORDER BY created_at DESC").all();
  const proofRows = db.prepare("SELECT * FROM payment_proofs ORDER BY uploaded_at DESC").all();
  const paymentsByOrder = new Map();
  for (const payment of paymentRows) if (payment.order_id) {
    const current = paymentsByOrder.get(payment.order_id) || { payments: [], paidAmount: 0 };
    current.payments.push(mapPayment(payment));
    if (payment.status === "PAID") current.paidAmount += payment.amount;
    paymentsByOrder.set(payment.order_id, current);
  }
  const proofsByOrder = new Map();
  for (const proof of proofRows) {
    const items = proofsByOrder.get(proof.order_id) || [];
    items.push(mapProof(proof));
    proofsByOrder.set(proof.order_id, items);
  }
  return orders.map((order) => {
    const payments = paymentsByOrder.get(order.id);
    return { ...order, payment: payments?.payments[0] || null, payments: payments?.payments || [], paidAmount: payments?.paidAmount || 0, proofs: proofsByOrder.get(order.id) || [] };
  });
}

export function listChatLeads() {
  return db.prepare("SELECT phone, name, memory_json, updated_at FROM chat_profiles ORDER BY updated_at DESC").all().map((row) => {
    const memory = parseJson(row.memory_json) || {};
    return {
      phone: row.phone,
      name: row.name || "",
      updatedAt: row.updated_at,
      selectedPlan: memory.selectedPlan || "",
      needs: Array.isArray(memory.needs) ? memory.needs : [],
    };
  });
}

export function getAdminDashboard() {
  const orders = listOrderRecap();
  const leads = listChatLeads();
  const paid = db.prepare("SELECT amount FROM payments WHERE status = 'PAID'").all();
  return {
    orders,
    leads,
    metrics: {
      totalOrders: orders.length,
      newOrders: orders.filter((order) => ["baru", "belum_dikerjakan"].includes(order.status)).length,
      inProgress: orders.filter((order) => order.status === "sedang_dikerjakan").length,
      completed: orders.filter((order) => order.status === "selesai").length,
      chatbotLeads: leads.length,
      paidRevenue: paid.reduce((total, payment) => total + Number(payment.amount || 0), 0),
    },
  };
}

// Mimetype dari browser bisa dipalsukan; cocokkan dengan signature isi berkas.
const fileSignatures = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP",
  "application/pdf": (b) => b.toString("latin1", 0, 5) === "%PDF-",
};

function hasValidSignature(file) {
  const header = Buffer.alloc(12);
  const fd = fs.openSync(file.path, "r");
  try { fs.readSync(fd, header, 0, 12, 0); } finally { fs.closeSync(fd); }
  return Boolean(fileSignatures[file.mimetype]?.(header));
}

function setOrderStatus(orderId, previousStatus, nextStatus, actor) {
  if (previousStatus === nextStatus) return null;
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(nextStatus, orderId);
  recordStatusChange(orderId, previousStatus, nextStatus, actor);
  return nextStatus;
}

export function addPaymentProof(orderId, paymentId, file) {
  const order = db.prepare("SELECT id, status FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  if (!hasValidSignature(file)) return "invalid-file";
  if (paymentId && !db.prepare("SELECT id FROM payments WHERE id = ? AND order_id = ?").get(paymentId, orderId)) return "invalid-payment";
  const proof = { id: `PROOF-${crypto.randomUUID()}`, orderId, paymentId: paymentId || null, originalName: file.originalname, storedName: file.filename, mimeType: file.mimetype, size: file.size, status: "PENDING_REVIEW", uploadedAt: new Date().toISOString() };
  db.prepare(`INSERT INTO payment_proofs (id, order_id, payment_id, original_name, stored_name, mime_type, size, status, uploaded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(proof.id, proof.orderId, proof.paymentId, proof.originalName, proof.storedName, proof.mimeType, proof.size, proof.status, proof.uploadedAt);
  const orderStatus = setOrderStatus(orderId, order.status, "menunggu_verifikasi_pembayaran", "payment-proof");
  return { ...proof, orderStatus };
}

export function addPublicPaymentProof(paymentId, file) {
  const payment = db.prepare("SELECT id, order_id FROM payments WHERE id = ?").get(paymentId);
  if (!payment?.order_id) return null;
  return addPaymentProof(payment.order_id, payment.id, file);
}

export function reviewPaymentProof(proofId, approved, note = "") {
  const proof = db.prepare("SELECT * FROM payment_proofs WHERE id = ?").get(proofId);
  if (!proof) return null;
  const status = approved ? "ACCEPTED" : "REJECTED";
  const now = new Date().toISOString();
  db.prepare("UPDATE payment_proofs SET status = ?, review_note = ?, reviewed_at = ? WHERE id = ?").run(status, String(note).slice(0, 500), now, proofId);
  const payment = proof.payment_id ? db.prepare("SELECT payment_type FROM payments WHERE id = ?").get(proof.payment_id) : null;
  if (payment) db.prepare("UPDATE payments SET status = ?, updated_at = ? WHERE id = ?").run(approved ? "PAID" : "PENDING", now, proof.payment_id);
  // Pelunasan terjadi saat pekerjaan berjalan, jadi status kembali ke pengerjaan, bukan ke awal.
  const isFinal = payment?.payment_type === "FINAL";
  const nextStatus = approved ? (isFinal ? "sedang_dikerjakan" : "siap_dikerjakan") : (isFinal ? "menunggu_pelunasan" : "menunggu_bukti_pembayaran");
  const order = db.prepare("SELECT status FROM orders WHERE id = ?").get(proof.order_id);
  const orderStatus = setOrderStatus(proof.order_id, order.status, nextStatus, approved ? "admin-approve-proof" : "admin-reject-proof");
  return { ...mapProof({ ...proof, status, review_note: String(note).slice(0, 500), reviewed_at: now }), orderId: proof.order_id, orderStatus };
}

const manualOrderStatuses = new Set(["baru", "belum_dikerjakan", "sedang_dikerjakan", "selesai"]);

function recordStatusChange(orderId, previousStatus, nextStatus, actor = "admin") {
  db.prepare(`INSERT INTO order_status_history (id, order_id, previous_status, next_status, actor, changed_at)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(`STATUS-${crypto.randomUUID()}`, orderId, previousStatus, nextStatus, actor, new Date().toISOString());
}

export function updateOrderStatus(orderId, status, { allowReopen = false } = {}) {
  if (!manualOrderStatuses.has(status)) return "invalid-status";
  const order = db.prepare("SELECT id, status FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  // Pesanan tanpa tagihan (data lama) tetap bebas diubah agar tidak terkunci.
  const { paid, total } = getPaymentSummary(orderId);
  if (status === "sedang_dikerjakan" && total > 0 && paid === 0) return "dp-required";
  if (status === "selesai" && total > 0 && paid < total) return "unpaid";
  if (order.status === "selesai" && !allowReopen) return "locked";
  if (order.status === status) return { id: orderId, status };
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
  recordStatusChange(orderId, order.status, status, allowReopen ? "admin-reopen" : "admin");
  return { id: orderId, status };
}

export function reopenOrder(orderId) {
  return updateOrderStatus(orderId, "sedang_dikerjakan", { allowReopen: true });
}

export function getOrderCustomer(orderId) {
  const row = db.prepare("SELECT id, name, phone FROM orders WHERE id = ?").get(orderId);
  return row && { id: row.id, name: row.name || "", phone: row.phone || "" };
}

export function findCustomerPayment(phone) {
  if (!phone) return null;
  return db.prepare(`SELECT p.id, p.order_id, p.amount, p.payment_type FROM payments p JOIN orders o ON o.id = p.order_id
    WHERE o.phone = ? AND p.status = 'PENDING' ORDER BY p.created_at DESC LIMIT 1`).get(phone) || null;
}

export function savePaymentProofBuffer(orderId, paymentId, { buffer, originalname, mimetype }) {
  const extension = extensionByType[mimetype] || "";
  fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  const file = { path: path.join(uploadDir, filename), filename, originalname: String(originalname).slice(0, 150), mimetype, size: buffer.length };
  fs.writeFileSync(file.path, buffer);
  let result;
  try { result = allowedTypes.has(mimetype) ? addPaymentProof(orderId, paymentId, file) : "invalid-file"; }
  catch (error) { fs.unlink(file.path, () => {}); throw error; }
  if (!result || typeof result === "string") fs.unlink(file.path, () => {});
  return result;
}

export function markOrderAwaitingPayment(orderId, nextStatus = "menunggu_bukti_pembayaran") {
  const order = db.prepare("SELECT id, status FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  if (order.status === "selesai") return "locked";
  setOrderStatus(orderId, order.status, nextStatus, "admin-invoice");
  return { id: orderId, status: nextStatus };
}

function getPaymentSummary(orderId) {
  const row = db.prepare(`SELECT COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS paid,
    COALESCE(MAX(total_amount), 0) AS total, SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending
    FROM payments WHERE order_id = ?`).get(orderId);
  return { paid: Number(row.paid), total: Number(row.total), pending: Number(row.pending || 0) };
}

const invalid = (error, httpStatus = 400) => ({ error, httpStatus });

// FULL/DP adalah tagihan awal; FINAL menagih sisa dari total yang tercatat pada tagihan DP.
export function planInvoice(orderId, { paymentType, totalAmount, dpPercent }) {
  const type = ["DP", "FINAL"].includes(paymentType) ? paymentType : "FULL";
  const { paid, total, pending } = getPaymentSummary(orderId);
  if (pending) return invalid("Masih ada tagihan yang menunggu pembayaran/verifikasi untuk pesanan ini.", 409);
  if (type === "FINAL") {
    if (!paid || !total) return invalid("Pelunasan hanya bisa dibuat setelah DP disetujui.", 409);
    if (paid >= total) return invalid("Pesanan ini sudah lunas.", 409);
    return { paymentType: type, totalAmount: total, amount: total - paid };
  }
  if (paid) return invalid("Pembayaran awal sudah diterima. Gunakan tagihan pelunasan untuk sisa pembayaran.", 409);
  const fullAmount = Number(totalAmount);
  if (!Number.isInteger(fullAmount) || fullAmount < 1000 || fullAmount > 100_000_000) return invalid("Total harga harus bilangan bulat antara Rp1.000 dan Rp100.000.000.");
  if (type === "FULL") return { paymentType: type, totalAmount: fullAmount, amount: fullAmount };
  const percent = Number(dpPercent);
  if (!Number.isInteger(percent) || percent < 10 || percent > 90) return invalid("Persentase DP harus bilangan bulat 10–90%.");
  const amount = Math.round(fullAmount * percent / 100);
  if (amount < 1000) return invalid("Nominal DP minimal Rp1.000.");
  return { paymentType: type, totalAmount: fullAmount, amount };
}

export function getProofFile(proofId) {
  const proof = db.prepare("SELECT * FROM payment_proofs WHERE id = ?").get(proofId);
  if (!proof) return null;
  return { path: path.join(uploadDir, proof.stored_name), name: proof.original_name, type: proof.mime_type };
}
