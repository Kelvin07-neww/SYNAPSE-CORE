// Semua teks bot dibuat dari data yang sama dengan website (src/data, src/config).
import { siteConfig } from "../src/config/site.js";
import { services } from "../src/data/services.js";
import { plans, pricingDisclaimer } from "../src/data/pricing.js";
import { projects } from "../src/data/portfolio.js";
import { processSteps } from "../src/data/process.js";
import { technologyGroups } from "../src/data/technologies.js";
import { faqs } from "../src/data/faq.js";
import { platforms, complexities, features } from "../src/data/estimator.js";
import { budgets, platformOptions, projectTypes } from "../src/data/contact.js";
import { rupiah } from "../src/lib/format.js";

export const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");
const footer = "\n\nKetik *menu* untuk kembali ke menu utama.";

export const menuItems = [
  "Layanan",
  "Paket & harga",
  "Estimasi biaya project",
  "Portfolio",
  "Alur pengerjaan",
  "Teknologi",
  "FAQ",
  "Kirim project brief",
  "Bicara dengan admin",
];

export const greeting = () =>
  `Halo, selamat datang di *${siteConfig.name}* — ${siteConfig.tagline}.\n\nKami membuat website, mobile app, desktop app, sistem informasi, dan custom software untuk mahasiswa, UMKM, startup, dan perusahaan.\n\nBalas dengan angka untuk memilih:\n${numbered(menuItems)}`;

export const servicesText = () =>
  `*Layanan ${siteConfig.name}*\n\n${services.map((s) => `• *${s.title}* — ${s.description}`).join("\n\n")}${footer}`;

export const pricingText = () =>
  `*Paket & harga*\n\n${plans
    .map((p) => `• *${p.name}* — ${p.prefix ? `${p.prefix} ` : ""}${p.price}${p.popular ? " (paling populer)" : ""}\n  ${p.features.join(", ")}`)
    .join("\n\n")}\n\n_${pricingDisclaimer}_\n\nIngin perkiraan yang lebih tepat? Ketik *3* untuk Project Estimator.${footer}`;

export const planText = (name) => {
  const plan = plans.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!plan) return null;
  return `Terima kasih sudah tertarik dengan paket *${plan.name}* (${plan.prefix ? `${plan.prefix} ` : ""}${plan.price}).\n\nIsinya: ${plan.features.join(", ")}.\n\n_${pricingDisclaimer}_\n\nCeritakan singkat project Anda, atau ketik *8* untuk mengisi project brief. Ketik *9* jika ingin bicara langsung dengan admin.`;
};

export const portfolioText = () =>
  `*Contoh project kami*\n\n${projects.map((p) => `• *${p.title}* (${p.status}) — ${p.technologies.join(", ")}`).join("\n")}\n\nLihat tampilan lengkapnya di website kami.${footer}`;

export const processText = () =>
  `*Alur pengerjaan*\n\n${numbered(processSteps.map((s) => `*${s.title}* — ${s.description}`))}${footer}`;

export const technologiesText = () =>
  `*Teknologi yang kami gunakan*\n\n${Object.entries(technologyGroups).map(([group, items]) => `• *${group}:* ${items.join(", ")}`).join("\n")}${footer}`;

export const faqListText = () =>
  `*Pertanyaan yang sering diajukan*\n\n${numbered(faqs.map((f) => f.q))}\n\nBalas dengan nomor untuk melihat jawabannya.`;
export const faqAnswerText = (f) => `*${f.q}*\n\n${f.a}\n\nBalas nomor lain untuk pertanyaan berikutnya, atau ketik *menu*.`;

// ---- Estimator ----
export const estimatorPlatformText = () =>
  `*Project Estimator*\n\nPilih platform:\n${numbered(platforms.map((p) => p.label))}`;
export const estimatorComplexityText = () =>
  `Pilih tingkat kompleksitas:\n${numbered(complexities.map((c) => c.label))}`;
export const estimatorFeaturesText = () =>
  `Pilih fitur yang dibutuhkan. Kirim beberapa nomor sekaligus, misalnya *1, 3, 5*. Ketik *0* jika tidak ada.\n\n${numbered(features.map((f) => f.label))}`;
export const estimatorResultText = ({ platform, complexity, featureLabels, min, max }) =>
  `*Estimated Project Cost*\n\nPlatform: ${platform}\nKompleksitas: ${complexity}\nFitur: ${featureLabels.join(", ") || "-"}\n\n*${rupiah(min)} – ${rupiah(max)}*\n\n_Ini perkiraan awal, bukan harga final. Harga akhir ditentukan setelah kebutuhan dianalisis._\n\nKetik *8* untuk kirim project brief, atau *9* untuk bicara dengan admin.`;

// ---- Brief ----
export const briefSteps = [
  { key: "name", ask: "Siapa nama Anda?" },
  { key: "project", ask: () => `Jenis project apa?\n${numbered(projectTypes)}`, options: projectTypes },
  { key: "platform", ask: () => `Platform yang dibutuhkan?\n${numbered(platformOptions)}`, options: platformOptions },
  { key: "budget", ask: () => `Perkiraan budget?\n${numbered(budgets)}`, options: budgets },
  { key: "deadline", ask: "Kapan deadline-nya? (contoh: 30 hari lagi, atau ketik *fleksibel*)" },
  { key: "description", ask: "Terakhir, jelaskan singkat project dan fitur utamanya." },
];

export const briefSummary = (b) =>
  `Nama: ${b.name}\nProject: ${b.project}\nPlatform: ${b.platform}\nBudget: ${b.budget}\nDeadline: ${b.deadline}\nDeskripsi: ${b.description}`;

export const briefDoneText = (b, orderId) =>
  `Terima kasih, brief Anda sudah kami terima.\nNomor pesanan: *${orderId}*\n\n${briefSummary(b)}\n\nAdmin akan membalas dengan estimasi biaya, pilihan teknologi, dan timeline. Ketik *menu* untuk kembali.`;

export const handoffText = () =>
  "Baik, admin kami akan segera membalas pesan Anda. Selama menunggu, bot berhenti membalas. Ketik *menu* kapan saja untuk memakai bot lagi.";

export const fallbackText = () => "Maaf, saya belum paham pesan itu. Balas dengan angka dari menu, atau ketik *menu*.";
export const invalidChoiceText = (max) => `Pilihan tidak valid. Balas dengan angka 1–${max}.`;

// ---- Pesanan untuk admin ----
const wib = (iso) => new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }) + " WIB";
const sourceLabel = { "whatsapp-bot": "Chatbot WhatsApp", website: "Form/tombol website" };

export const orderDetailText = (o) => {
  if (!o) return "Pesanan tidak ditemukan.";
  const head = `*${o.type === "brief" ? "PESANAN BARU" : "LEAD ESTIMATOR"}* ${o.id}\nWaktu: ${wib(o.createdAt)}\nSumber: ${sourceLabel[o.source] || o.source}\nStatus: ${o.status}\n\nPelanggan: ${o.customer?.name || o.brief?.name || "-"}\nKontak: wa.me/${o.customer?.phone}`;
  if (o.type === "brief") return `${head}\n\n${briefSummary(o.brief)}`;
  const e = o.estimate;
  return `${head}\n\nPlatform: ${e.platform}\nKompleksitas: ${e.complexity}\nFitur: ${e.features}\nEstimasi: ${e.range}`;
};

export const orderAdminText = (o) => `${orderDetailText(o)}\n\n_Balas pelanggan lewat link kontak di atas._`;

export const orderListText = (orders) =>
  orders.length
    ? `*Pesanan terbaru*\n\n${orders.map((o) => `• ${o.id} — ${o.brief?.name || o.customer?.name || "-"} — ${o.brief?.project || "Lead estimator"} (${o.status})`).join("\n")}\n\nKetik *pesanan <nomor>* untuk melihat detail.`
    : "Belum ada pesanan.";
