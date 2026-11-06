import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { addPaymentProof, getAdminDashboard, getOrderCustomer, getProofFile, listOrderRecap, markOrderAwaitingPayment, planInvoice, reopenOrder, requireAdmin, reviewPaymentProof, updateOrderStatus, uploadPaymentProof } from "./admin.js";
import { PaymentProviderNotConfiguredError, verifyDanaWebhook } from "./payments/danaQris.js";
import { findPayment, markPaymentFromWebhook, startPayment } from "./payments/service.js";
import { normalizePhone, saveOrder } from "../bot/orders.js";
import { getCustomerChatId } from "../bot/memory.js";

const app = express();
const qrisFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "images", "qris.png");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", config.frontendOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Signature");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true, provider: config.paymentProvider }));

app.post("/api/orders", express.json({ limit: "20kb" }), async (req, res, next) => {
  try {
    const body = req.body || {};
    const required = ["name", "email", "project", "platform", "budget", "description"];
    if (required.some((field) => !String(body[field] || "").trim())) return res.status(400).json({ error: "Data brief belum lengkap." });
    const brief = {
      name: String(body.name).trim().slice(0, 100), project: String(body.project).trim().slice(0, 100),
      platform: String(body.platform).trim().slice(0, 100), budget: String(body.budget).trim().slice(0, 100),
      deadline: String(body.deadline || "fleksibel").trim().slice(0, 100), description: String(body.description).trim().slice(0, 2000),
    };
    const order = saveOrder({ type: "brief", source: "website", customer: { name: brief.name, email: String(body.email).trim().slice(0, 150), phone: normalizePhone(String(body.whatsapp || "").slice(0, 30), { local: true }) }, brief });
    notifyAdmin(`*PESANAN BARU*\n\nID: ${order.id}\nPelanggan: ${order.customer.name}\nProject: ${brief.project}\nStatus: baru`);
    return res.status(201).json({ order: { id: order.id, status: order.status } });
  } catch (error) { return next(error); }
});

app.get("/api/bot/status", async (_req, res) => {
  if (!config.whatsappBotEnabled) return res.json({ enabled: false, status: "disabled" });
  const { getWhatsAppBotStatus } = await import("../bot/adapters/whatsapp.js");
  return res.json({ enabled: true, status: getWhatsAppBotStatus() });
});

app.get("/api/admin/orders", requireAdmin, (_req, res) => res.json({ orders: listOrderRecap() }));
app.get("/api/admin/dashboard", requireAdmin, (_req, res) => res.json(getAdminDashboard()));

app.post("/api/admin/orders/:orderId/invoice", requireAdmin, express.json({ limit: "5kb" }), async (req, res, next) => {
  try {
    const customer = getOrderCustomer(req.params.orderId);
    if (!customer) return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    const plan = planInvoice(req.params.orderId, req.body || {});
    if (plan.error) return res.status(plan.httpStatus).json({ error: plan.error });
    const { amount, totalAmount, paymentType } = plan;
    const label = { DP: "DP", FINAL: "Pelunasan", FULL: "Tagihan" }[paymentType];
    const order = markOrderAwaitingPayment(req.params.orderId, paymentType === "FINAL" ? "menunggu_pelunasan" : "menunggu_bukti_pembayaran");
    if (order === "locked") return res.status(409).json({ error: "Pesanan selesai harus dibuka kembali sebelum membuat tagihan." });
    const payment = await startPayment({
      amount,
      orderId: req.params.orderId,
      description: req.body?.description || `${label} pesanan ${req.params.orderId}`,
      customer,
      paymentType,
      totalAmount,
    });
    const notified = await notifyCustomerPaymentRequest(payment, customer);
    return res.status(201).json({ payment: { ...payment, qrisImageUrl: `/api/payments/${payment.id}/qris` }, notified });
  } catch (error) { return next(error); }
});

app.patch("/api/admin/orders/:orderId/status", requireAdmin, express.json({ limit: "5kb" }), (req, res) => {
  const order = updateOrderStatus(req.params.orderId, req.body?.status);
  if (order === "invalid-status") return res.status(400).json({ error: "Status pesanan tidak valid." });
  if (order === "locked") return res.status(409).json({ error: "Pesanan selesai dikunci. Gunakan Buka kembali jika pekerjaan perlu dilanjutkan." });
  if (order === "unpaid") return res.status(409).json({ error: "Pesanan belum lunas. Buat tagihan pelunasan dan setujui buktinya sebelum menandai selesai." });
  if (order === "dp-required") return res.status(409).json({ error: "Tagihan DP/pembayaran awal belum disetujui, pesanan belum dapat dikerjakan." });
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan." });
  notifyCustomerOrderStatus(order).catch((error) => console.error("Notifikasi status pelanggan gagal:", error.message));
  return res.json({ order });
});

app.post("/api/admin/orders/:orderId/reopen", requireAdmin, (req, res) => {
  const order = reopenOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan." });
  notifyCustomerOrderStatus(order).catch((error) => console.error("Notifikasi status pelanggan gagal:", error.message));
  return res.json({ order });
});

app.post("/api/admin/orders/:orderId/payment-proof", requireAdmin, (req, res, next) => {
  uploadPaymentProof(req, res, (error) => {
    if (error) return next(error);
    if (!req.file) return res.status(400).json({ error: "Unggah JPG, PNG, WEBP, atau PDF dengan ukuran maksimal 5 MB." });
    const proof = addPaymentProof(req.params.orderId, req.body.paymentId, req.file);
    if (!proof || typeof proof === "string") {
      fs.unlink(req.file.path, () => {});
      if (!proof) return res.status(404).json({ error: "Pesanan tidak ditemukan." });
      if (proof === "invalid-file") return res.status(400).json({ error: "Isi berkas tidak sesuai format JPG, PNG, WEBP, atau PDF." });
      return res.status(400).json({ error: "Pembayaran tidak terkait dengan pesanan ini." });
    }
    if (proof.orderStatus) notifyCustomerOrderStatus({ id: req.params.orderId, status: proof.orderStatus }).catch((error) => console.error("Notifikasi status pelanggan gagal:", error.message));
    return res.status(201).json({ proof });
  });
});


app.post("/api/admin/payment-proofs/:proofId/review", requireAdmin, express.json({ limit: "5kb" }), (req, res) => {
  const proof = reviewPaymentProof(req.params.proofId, req.body?.approved === true, req.body?.note);
  if (!proof) return res.status(404).json({ error: "Bukti pembayaran tidak ditemukan." });
  if (proof.orderStatus) notifyCustomerOrderStatus({ id: proof.orderId, status: proof.orderStatus }).catch((error) => console.error("Notifikasi status pelanggan gagal:", error.message));
  return res.json({ proof });
});

app.get("/api/admin/payment-proofs/:proofId/file", requireAdmin, (req, res) => {
  const proof = getProofFile(req.params.proofId);
  if (!proof || !fs.existsSync(proof.path)) return res.status(404).json({ error: "Berkas bukti tidak ditemukan." });
  return res.type(proof.type).download(proof.path, proof.name);
});

app.post("/api/payments", requireAdmin, express.json({ limit: "20kb" }), async (req, res, next) => {
  try {
    const payment = await startPayment(req.body || {});
    res.status(201).json({ payment: { ...payment, qrisImageUrl: `/api/payments/${payment.id}/qris` } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/payments/:id", (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ error: "Pembayaran tidak ditemukan." });
  const { id, orderId, amount, currency, description, status, createdAt } = payment;
  return res.json({ payment: { id, orderId, amount, currency, description, status, createdAt, qrisImageUrl: `/api/payments/${payment.id}/qris` } });
});

// QRIS statis milik merchant. Nominal dibaca customer dari detail tagihan;
// status baru berubah setelah bukti pembayaran diperiksa admin.
app.get("/api/payments/:id/qris", (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ error: "Pembayaran tidak ditemukan." });
  if (!fs.existsSync(qrisFile)) return res.status(503).json({ error: "Aset QRIS belum tersedia." });
  return res.type("image/png").sendFile(qrisFile);
});

// Keep raw bytes for signature verification. Map the exact DANA webhook fields
// in this handler once the merchant receives its official webhook specification.
app.post("/api/webhooks/dana", express.raw({ type: "application/json", limit: "50kb" }), async (req, res) => {
  if (!verifyDanaWebhook(req.body, req.get("X-Signature"))) return res.status(401).json({ error: "Signature webhook tidak valid." });
  const body = JSON.parse(req.body.toString("utf8"));
  const payment = markPaymentFromWebhook({
    paymentId: body.paymentId,
    externalId: body.externalId,
    status: body.status,
    providerReference: body.providerReference,
  });
  if (!payment) return res.status(404).json({ error: "Pembayaran tidak ditemukan atau status tidak valid." });
  if (payment.status === "PAID") {
    notifyAdmin(`*PEMBAYARAN DITERIMA*\n\nID: ${payment.id}\nPesanan: ${payment.orderId || "-"}\nNominal: Rp${payment.amount.toLocaleString("id-ID")}\nStatus: PAID`);
  }
  return res.json({ ok: true, payment });
});

app.use((error, _req, res, _next) => {
  const status = error instanceof PaymentProviderNotConfiguredError ? 503 : error.statusCode || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: error.message || "Terjadi kesalahan pada server pembayaran." });
});

// Notifikasi WA bersifat best effort: data sudah tersimpan, jadi kegagalan kirim
// tidak boleh membuat request gagal (customer akan mengirim ulang dan pesanan ganda).
function notifyAdmin(text) {
  if (!config.whatsappBotEnabled) return;
  import("../bot/adapters/whatsapp.js")
    .then(({ sendAdminMessage }) => sendAdminMessage(text))
    .catch((error) => console.error("Notifikasi admin gagal:", error.message));
}

async function notifyCustomerOrderStatus(order) {
  if (!config.whatsappBotEnabled) return;
  const customer = getOrderCustomer(order.id);
  if (!customer?.phone) return;
  const { sendCustomerMessage } = await import("../bot/adapters/whatsapp.js");
  await sendCustomerMessage(customer.phone, `Halo ${customer.name || ""},\n\nStatus pesanan *${order.id}* telah diperbarui menjadi: *${order.status.replaceAll("_", " ")}*.\n\nKetik *status* di chat ini untuk melihat pesanan Anda.`);
}

async function notifyCustomerPaymentRequest(payment, customer) {
  if (!config.whatsappBotEnabled || !customer?.phone) return false;
  try {
    const { sendCustomerQris } = await import("../bot/adapters/whatsapp.js");
    const title = { DP: "TAGIHAN DP (UANG MUKA)", FINAL: "TAGIHAN PELUNASAN", FULL: "TAGIHAN PEMBAYARAN" }[payment.paymentType] || "TAGIHAN PEMBAYARAN";
    const total = payment.paymentType === "FULL" ? "" : `\nTotal project: Rp${payment.totalAmount.toLocaleString("id-ID")}`;
    const note = payment.paymentType === "DP" ? "\n\nProject mulai dikerjakan setelah DP diverifikasi. Sisa pembayaran ditagih sebelum project diserahkan." : "";
    const message = `*${title} SYNAPSE CORE*\n\nPesanan: *${payment.orderId}*${total}\nNominal dibayar sekarang: *Rp${payment.amount.toLocaleString("id-ID")}*\nKeterangan: ${payment.description}\nID tagihan: ${payment.id}${note}\n\nSilakan scan QRIS pada gambar yang dikirim bersama pesan ini dan bayar sesuai nominal. Setelah membayar, kirim *foto/PDF bukti pembayaran* di chat ini agar dapat diverifikasi.`;
    return await sendCustomerQris(customer.phone, message, getCustomerChatId(customer.phone));
  } catch (error) {
    console.error("Notifikasi tagihan customer gagal:", error.message);
    return false;
  }
}

app.listen(config.port, async () => {
  console.log(`Payment API aktif di http://localhost:${config.port}`);
  if (config.whatsappBotEnabled) {
    const { startWhatsAppBot } = await import("../bot/adapters/whatsapp.js");
    startWhatsAppBot();
  }
});
