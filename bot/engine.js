// Inti chatbot, tidak bergantung pada platform WhatsApp tertentu.
// handleMessage({ from, text }) -> Promise<{ replies: string[], notifyAdmin?: string }>
import { calculateEstimate, complexities, features, platforms } from "../src/data/estimator.js";
import { faqs } from "../src/data/faq.js";
import { siteConfig } from "../src/config/site.js";
import { getOrder, listCustomerOrders, listOrders, normalizePhone, saveOrder } from "./orders.js";
import { parseWebMessage } from "./parsers.js";
import { findConversationReply } from "./conversation.js";
import { askAI } from "./ai.js";
import { findKnowledge, recommendPlan } from "./knowledge.js";
import { rememberCustomer } from "./memory.js";
import * as msg from "./messages.js";
import { findCustomerPayment, savePaymentProofBuffer } from "../server/admin.js";

const SESSION_TTL = 60 * 60 * 1000;
const sessions = new Map();

const freshSession = () => ({ state: "idle", data: {}, paused: false, touched: Date.now() });

function pruneSessions(now) {
  for (const [id, session] of sessions) if (now - session.touched > SESSION_TTL) sessions.delete(id);
}

function getSession(id) {
  if (sessions.size > 500) pruneSessions(Date.now());
  const s = sessions.get(id);
  if (!s || Date.now() - s.touched > SESSION_TTL) {
    const created = freshSession();
    sessions.set(id, created);
    return created;
  }
  s.touched = Date.now();
  return s;
}

const reset = (s) => { s.state = "idle"; s.data = {}; s.paused = false; };
const toIndex = (text, max) => {
  const n = Number(text.trim());
  return Number.isInteger(n) && n >= 1 && n <= max ? n - 1 : -1;
};
const reply = (...replies) => ({ replies });

function startBrief(s, prefix = []) {
  s.state = "brief";
  s.data = { step: 0, brief: {} };
  const first = msg.briefSteps[0];
  return reply(...prefix, "Baik, kita isi project brief singkat.", typeof first.ask === "function" ? first.ask() : first.ask);
}

function handleBrief(s, text, customer) {
  const step = msg.briefSteps[s.data.step];
  let value = text.trim();
  if (step.options) {
    const i = toIndex(value, step.options.length);
    if (i < 0) return reply(msg.invalidChoiceText(step.options.length));
    value = step.options[i];
  }
  s.data.brief[step.key] = value;
  s.data.step += 1;

  if (s.data.step < msg.briefSteps.length) {
    const next = msg.briefSteps[s.data.step];
    return reply(typeof next.ask === "function" ? next.ask() : next.ask);
  }
  const brief = s.data.brief;
  reset(s);
  const order = saveOrder({ type: "brief", source: "whatsapp-bot", customer, brief });
  return { replies: [msg.briefDoneText(brief, order.id)], notifyAdmin: msg.orderAdminText(order), order };
}

function handleEstimator(s, text) {
  const { state, data } = s;
  if (state === "est_platform") {
    const i = toIndex(text, platforms.length);
    if (i < 0) return reply(msg.invalidChoiceText(platforms.length));
    data.platformId = platforms[i].id;
    s.state = "est_complexity";
    return reply(msg.estimatorComplexityText());
  }
  if (state === "est_complexity") {
    const i = toIndex(text, complexities.length);
    if (i < 0) return reply(msg.invalidChoiceText(complexities.length));
    data.complexityId = complexities[i].id;
    s.state = "est_features";
    return reply(msg.estimatorFeaturesText());
  }
  const picks = text.match(/\d+/g)?.map(Number) ?? [];
  const wantsNone = picks.length === 1 && picks[0] === 0;
  const valid = picks.length > 0 && picks.every((n) => n >= 0 && n <= features.length);
  if (!valid) return reply(msg.invalidChoiceText(features.length));
  const featureIds = wantsNone ? [] : [...new Set(picks)].filter((n) => n > 0).map((n) => features[n - 1].id);
  const { min, max } = calculateEstimate({ platformId: data.platformId, complexityId: data.complexityId, featureIds });
  const result = msg.estimatorResultText({
    platform: platforms.find((p) => p.id === data.platformId).label,
    complexity: complexities.find((c) => c.id === data.complexityId).label,
    featureLabels: features.filter((f) => featureIds.includes(f.id)).map((f) => f.label),
    min,
    max,
  });
  reset(s);
  return reply(result);
}

async function handlePlanConsultation(s, text, customer) {
  if (/^(admin|9|cs|operator)$/i.test(text.trim())) {
    reset(s);
    return handleMenuChoice(s, "9", customer);
  }
  if (/^(brief|8|pesan project|order)$/i.test(text.trim())) return startBrief(s);
  const planName = s.data.planName;
  const memory = rememberCustomer(customer, text, { selectedPlan: planName });
  const knowledge = findKnowledge(text);
  const aiReply = await askAI({ message: text.trim(), selectedPlan: planName, memory, knowledge });
  const recommendation = recommendPlan(text, memory);
  reset(s);
  return reply(aiReply || (recommendation ? msg.recommendationText(recommendation) : msg.planConsultationText(planName, text.trim())));
}

const keywordRoutes = [
  [/layanan|service|jasa apa/i, "1"],
  [/harga|paket|biaya|tarif|pricing/i, "2"],
  [/estimasi|estimator|hitung/i, "3"],
  [/portfolio|portofolio|contoh/i, "4"],
  [/proses|alur|tahap|berapa lama/i, "5"],
  [/teknologi|stack|bahasa pemrograman/i, "6"],
  [/faq|tanya/i, "7"],
  [/brief|pesan project|order|pesan/i, "8"],
  [/^(?:admin|cs|manusia|operator)$/i, "9"],
  [/(?:hubungi|bicara|chat|sambungkan|kontak).{0,30}\b(?:admin|cs|manusia|operator)\b/i, "9"],
  [/status pesanan|cek status|status order/i, "10"],
];

function handleMenuChoice(s, choice, customer) {
  switch (choice) {
    case "1": return reply(msg.servicesText());
    case "2": return reply(msg.pricingText());
    case "3": s.state = "est_platform"; s.data = {}; return reply(msg.estimatorPlatformText());
    case "4": return reply(msg.portfolioText());
    case "5": return reply(msg.processText());
    case "6": return reply(msg.technologiesText());
    case "7": s.state = "faq"; return reply(msg.faqListText());
    case "8": return startBrief(s);
    case "9": s.paused = true; return { replies: [msg.handoffText()], notifyAdmin: `Pelanggan meminta bicara dengan admin.\nKontak: wa.me/${customer.phone}` };
    case "10": return reply(msg.customerOrderStatusText(listCustomerOrders(customer.phone)));
    default: return null;
  }
}

const toPhone = (id) => String(id).replace(/@.*/, "");
const isProjectNeed = (text) => text.length >= 40 && /\b(website|web|aplikasi|mobile|android|ios|dashboard|api|payment|pembayaran|fitur|sistem|kasir|toko|laporan|database|ai)\b/i.test(text);

export async function handleMessage({ from, text, phone, name }) {
  const input = (text || "").trim();
  if (!input) return { replies: [] };
  const s = getSession(from);
  const lower = input.toLowerCase();
  const customer = { phone: phone || toPhone(from), name: name || "" };
  const memory = rememberCustomer(customer, input, { chatId: from });

  // Perintah khusus admin
  if (customer.phone === siteConfig.whatsapp) {
    const cmd = lower.match(/^pesanan(?:\s+(\S+))?$/);
    if (cmd) return reply(cmd[1] ? msg.orderDetailText(getOrder(cmd[1])) : msg.orderListText(listOrders(5)));
  }

  // Pelanggan hanya boleh melihat pesanan yang dibuat dari nomor WhatsApp-nya sendiri.
  const statusCommand = input.match(/^status(?:\s+(ORD-[\w-]+))?$/i);
  if (statusCommand) {
    if (!statusCommand[1]) return reply(msg.customerOrderStatusText(listCustomerOrders(customer.phone)));
    const order = getOrder(statusCommand[1]);
    if (!order || normalizePhone(order.customer?.phone) !== normalizePhone(customer.phone)) return reply("Pesanan tidak ditemukan untuk nomor WhatsApp ini.");
    return reply(msg.customerOrderDetailStatusText(order));
  }

  // 1) Pesan otomatis dari tombol WhatsApp di website
  const web = parseWebMessage(input);
  if (web) {
    reset(s);
    if (web.type === "plan") {
      const text = msg.planText(web.name);
      if (text) {
        s.state = "plan_consultation";
        s.data = { planName: web.name };
        rememberCustomer(customer, input, { selectedPlan: web.name });
        // Klik paket hanya memulai konsultasi dengan bot. Tidak ada order atau notifyAdmin.
        return reply(text);
      }
    }
    if (web.type === "estimator") {
      s.paused = true;
      const order = saveOrder({ type: "estimator-lead", source: "website", customer, estimate: { platform: web.platform, complexity: web.complexity, features: web.features, range: web.estimate } });
      return {
        order,
        replies: [`Halo, terima kasih sudah mencoba Project Estimator kami.\n\nPlatform: ${web.platform}\nKompleksitas: ${web.complexity}\nFitur: ${web.features}\nEstimasi: ${web.estimate}\n\n_Angka ini perkiraan awal. Admin akan membahas detail dan harga finalnya bersama Anda._\n\nKetik *menu* jika ingin memakai bot.`],
        notifyAdmin: msg.orderAdminText(order),
      };
    }
    if (web.type === "brief") {
      s.paused = true;
      const order = saveOrder({ type: "brief", source: "website", customer, brief: web.brief });
      return { replies: [msg.briefDoneText(web.brief, order.id)], notifyAdmin: msg.orderAdminText(order), order };
    }
  }

  // 2) Perintah global
  if (/^(menu|0|mulai|start|hi|halo|hai|hello|assalamualaikum|p)$/i.test(lower)) {
    reset(s);
    return reply(msg.greeting());
  }
  if (s.paused) return { replies: [] }; // admin sedang menangani

  // 3) Percakapan bertahap
  if (s.state === "plan_consultation") return handlePlanConsultation(s, input, customer);
  if (s.state === "brief") return handleBrief(s, input, customer);
  if (s.state.startsWith("est_")) return handleEstimator(s, input);
  if (s.state === "faq") {
    const i = toIndex(input, faqs.length);
    if (i >= 0) return reply(msg.faqAnswerText(faqs[i]));
    reset(s);
  }

  // 4) Menu utama: angka atau kata kunci
  if (/^(?:[1-9]|10)$/.test(lower)) return handleMenuChoice(s, lower, customer);
  // Pesan kebutuhan yang lengkap diprioritaskan untuk AI/rekomendasi, bukan
  // disalahartikan sebagai kata kunci tunggal seperti "pembayaran" atau "admin".
  if (isProjectNeed(input)) {
    const knowledge = findKnowledge(input);
    const recommendation = recommendPlan(input, memory);
    const aiReply = await askAI({ message: input, memory, knowledge });
    if (aiReply) return reply(aiReply);
    if (recommendation) return reply(msg.recommendationText(recommendation));
  }
  const route = keywordRoutes.find(([pattern]) => pattern.test(lower));
  if (route) return handleMenuChoice(s, route[1], customer);

  const conversationReply = findConversationReply(input);
  if (conversationReply) return reply(conversationReply);

  const knowledge = findKnowledge(input);
  const recommendation = recommendPlan(input, memory);
  const aiReply = await askAI({ message: input, memory, knowledge });
  if (aiReply) return reply(aiReply);
  if (recommendation) return reply(msg.recommendationText(recommendation));

  return reply(msg.fallbackText());
}

const paymentLabels = { DP: "DP", FINAL: "pelunasan", FULL: "pembayaran" };

// Foto/PDF dari customer yang memiliki tagihan aktif disimpan sebagai bukti
// menunggu verifikasi admin. Mengembalikan null bila tidak ada tagihan aktif.
export function handlePaymentProofMessage({ from, phone, buffer, mimetype, filename }) {
  const payment = findCustomerPayment(normalizePhone(phone || toPhone(from)));
  if (!payment) return null;
  const proof = savePaymentProofBuffer(payment.order_id, payment.id, { buffer, mimetype, originalname: filename || `bukti-whatsapp-${Date.now()}` });
  if (proof === "invalid-file") return reply("Maaf, bukti pembayaran harus berupa foto (JPG/PNG/WEBP) atau PDF maksimal 5 MB.");
  if (!proof || typeof proof === "string") return reply("Maaf, bukti pembayaran belum dapat disimpan. Silakan hubungi admin.");
  const label = paymentLabels[payment.payment_type] || "pembayaran";
  return {
    replies: [`Terima kasih, bukti ${label} untuk pesanan *${payment.order_id}* sudah kami terima dan sedang diverifikasi admin.\n\nKetik *status* untuk memantau pesanan Anda.`],
    notifyAdmin: `*BUKTI ${label.toUpperCase()} MASUK*\n\nPesanan: ${payment.order_id}\nTagihan: ${payment.id}\nNominal: Rp${payment.amount.toLocaleString("id-ID")}\n\nVerifikasi melalui dashboard /admin.`,
  };
}
