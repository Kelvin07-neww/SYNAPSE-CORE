// Knowledge base lokal: dipakai sebagai retrieval ringan sebelum memanggil AI.
import { faqs } from "../src/data/faq.js";
import { plans } from "../src/data/pricing.js";
import { services } from "../src/data/services.js";

const entries = [
  ...plans.map((plan) => ({
    title: `Paket ${plan.name}`,
    text: `${plan.description}. Harga ${[plan.prefix, plan.price].filter(Boolean).join(" ")}. Termasuk: ${plan.features.join(", ")}.`,
  })),
  ...services.map((service) => ({ title: service.title, text: `${service.description} Teknologi: ${service.technologies.join(", ")}.` })),
  ...faqs.map((faq) => ({ title: faq.q, text: faq.a })),
];

const words = (text) => new Set(String(text).toLowerCase().match(/[a-z0-9]+/g) || []);

export function findKnowledge(query, limit = 4) {
  const queryWords = words(query);
  return entries
    .map((entry) => ({ ...entry, score: [...queryWords].filter((word) => words(`${entry.title} ${entry.text}`).has(word)).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ title, text }) => ({ title, text }));
}

const recommendationRules = [
  { plan: "Enterprise", weight: 4, words: ["enterprise", "erp", "skala besar", "banyak cabang", "ribuan", "ai", "machine learning", "cloud"] },
  { plan: "Business", weight: 2.5, words: ["payment", "pembayaran", "multi role", "multi-role", "laporan", "report", "integrasi", "cabang"] },
  { plan: "Professional", weight: 1, words: ["dashboard", "api", "login", "authentication", "ecommerce", "toko online", "aplikasi", "mobile"] },
  { plan: "Starter", weight: 1, words: ["landing page", "company profile", "portofolio", "portfolio", "sederhana", "katalog"] },
];

export function recommendPlan(needs, memory = {}) {
  const source = `${needs} ${(memory.needs || []).join(" ")}`.toLowerCase();
  const scored = recommendationRules.map((rule) => ({ ...rule, score: rule.words.filter((word) => source.includes(word)).length * rule.weight }));
  const best = scored.sort((a, b) => b.score - a.score)[0];
  if (!best?.score) return null;
  const plan = plans.find((item) => item.name === best.plan);
  return { name: plan.name, reason: plan.description, features: plan.features.slice(0, 4) };
}
