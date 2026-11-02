import { siteConfig } from "../config/site.js";

export const buildWhatsAppUrl = (message) =>
  `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;

export const buildBriefMessage = ({ name = "", project = "", platform = "", budget = "", deadline = "", description = "" }) =>
  [
    "Halo, saya tertarik menggunakan jasa software development.",
    "",
    `Nama: ${name}`,
    `Project: ${project}`,
    `Platform: ${platform}`,
    `Budget: ${budget}`,
    `Deadline: ${deadline}`,
    `Deskripsi: ${description}`,
  ].join("\n");
