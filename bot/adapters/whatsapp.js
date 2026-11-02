// Adapter whatsapp-web.js. Untuk platform lain (WhatsApp Cloud API, Fonnte, dll.),
// cukup panggil handleMessage() dari webhook dan kirim ulang hasil `replies`.
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { siteConfig } from "../../src/config/site.js";
import { handleMessage } from "../engine.js";

const { Client, LocalAuth } = pkg;
const adminId = `${siteConfig.whatsapp}@c.us`;

if (siteConfig.whatsapp.includes("x")) {
  console.warn("Nomor WhatsApp di src/config/site.js masih placeholder; notifikasi admin tidak akan terkirim.");
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log(`${siteConfig.name} bot aktif.`));

client.on("message", async (message) => {
  if (message.fromMe || message.from.endsWith("@g.us") || message.from === "status@broadcast") return;
  try {
    // Ambil nomor asli dan nama pelanggan (id chat bisa berupa @lid, bukan nomor telepon)
    const contact = await message.getContact();
    const { replies, notifyAdmin } = handleMessage({
      from: message.from,
      text: message.body,
      phone: contact.number || message.from.replace(/@.*/, ""),
      name: contact.pushname || contact.name || "",
    });
    for (const text of replies) await client.sendMessage(message.from, text);
    if (notifyAdmin && !siteConfig.whatsapp.includes("x")) {
      await client.sendMessage(adminId, notifyAdmin);
    }
  } catch (error) {
    console.error("Gagal memproses pesan:", error);
  }
});

client.initialize();
