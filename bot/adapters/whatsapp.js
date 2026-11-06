// Adapter whatsapp-web.js. Untuk platform lain (WhatsApp Cloud API, Fonnte, dll.),
// cukup panggil handleMessage() dari webhook dan kirim ulang hasil `replies`.
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../../src/config/site.js";
import { handleMessage, handlePaymentProofMessage } from "../engine.js";

const { Client, LocalAuth, MessageMedia } = pkg;
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const qrisFile = path.join(rootDir, "src", "images", "qris.png");
// Path absolut agar sesi tidak bergantung pada folder tempat perintah dijalankan.
const authDir = process.env.WWEBJS_AUTH_PATH || path.join(rootDir, ".wwebjs_auth");
const chromiumPath = process.env.CHROMIUM_PATH || (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
let client;
let status = "stopped";
let reconnectTimer;
const RECONNECT_DELAY_MS = 10_000;

function toWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  // Form website sering memasukkan 08xxxxxxxxxx, sementara WhatsApp Web
  // membutuhkan nomor Indonesia format internasional 628xxxxxxxxxx.
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function isSendablePhone(phone) {
  // Nomor Indonesia internasional umumnya 11–14 digit dan diawali 62.
  return /^62\d{9,12}$/.test(phone);
}

export const getWhatsAppBotStatus = () => status;

export async function sendAdminMessage(text) {
  if (status !== "ready" || siteConfig.whatsapp.includes("x")) return false;
  await client.sendMessage(`${siteConfig.whatsapp}@c.us`, text);
  return true;
}

export async function sendCustomerMessage(phone, text) {
  const destination = toWhatsAppPhone(phone);
  if (status !== "ready" || !isSendablePhone(destination)) return false;
  await client.sendMessage(`${destination}@c.us`, text);
  return true;
}

export async function sendCustomerQris(phone, text, chatId = "") {
  const destination = toWhatsAppPhone(phone);
  const savedChatId = /^[\d-]+@(?:c|lid)\.us$/.test(chatId) ? chatId : "";
  if (status !== "ready" || (!savedChatId && !isSendablePhone(destination)) || !fs.existsSync(qrisFile)) {
    if (destination && !isSendablePhone(destination)) console.warn("QRIS tidak dikirim: nomor customer bukan nomor WhatsApp internasional yang valid.");
    return false;
  }
  try {
    // Jalur media standar whatsapp-web.js: PNG tampil sebagai image preview.
    const media = MessageMedia.fromFilePath(qrisFile);
    const targetChatId = savedChatId || `${destination}@c.us`;
    await client.sendMessage(targetChatId, media);
    await client.sendMessage(targetChatId, text);
    return true;
  } catch (error) {
    console.error("Gagal mengirim QRIS ke customer:", error.message);
    // Tagihan tetap valid dan pesan teks mungkin sudah terkirim sebelum media gagal.
    return false;
  }
}

async function resolveCustomerPhone(message, contact) {
  try {
    // WhatsApp kini dapat mengirim chat dengan @lid. Nilai contact.number pada
    // chat tersebut bukan nomor telepon dan tidak dapat digunakan pada wa.me.
    const [{ pn }] = await client.getContactLidAndPhone([message.from]);
    if (pn) return pn.replace(/@.*/, "");
  } catch (error) {
    console.warn("Nomor telepon pelanggan tidak dapat di-resolve dari LID:", error.message);
  }
  return String(contact.number || message.from).replace(/@.*/, "");
}

const MAX_PROOF_BYTES = 5 * 1024 * 1024;

async function receivePaymentProof(message, phone) {
  const media = await message.downloadMedia();
  if (!media?.data) return null;
  const buffer = Buffer.from(media.data, "base64");
  if (buffer.length > MAX_PROOF_BYTES) return { replies: ["Maaf, ukuran bukti pembayaran maksimal 5 MB."] };
  const mimetype = String(media.mimetype || "").split(";")[0];
  return handlePaymentProofMessage({ from: message.from, phone, buffer, mimetype, filename: media.filename });
}

function reconnectAfterFailure(error) {
  status = "reconnecting";
  console.error(`Koneksi WhatsApp gagal (${error.message}). Mencoba lagi dalam ${RECONNECT_DELAY_MS / 1000} detik...`);
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(async () => {
    try {
      await client?.destroy();
    } catch {
      // Client dapat gagal dibuat sepenuhnya saat jaringan berubah.
    }
    client = undefined;
    startWhatsAppBot();
  }, RECONNECT_DELAY_MS);
}

export function startWhatsAppBot() {
  if (client) return client;
  if (siteConfig.whatsapp.includes("x")) console.warn("Nomor WhatsApp di src/config/site.js masih placeholder; notifikasi admin tidak akan terkirim.");

  status = "starting";
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: authDir }),
    puppeteer: { executablePath: chromiumPath, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  });

  client.on("qr", (qr) => {
    status = "awaiting_qr";
    console.log("Scan QR berikut dengan WhatsApp untuk mengaktifkan bot:");
    qrcode.generate(qr, { small: true });
  });
  client.on("ready", () => {
    clearTimeout(reconnectTimer);
    status = "ready";
    console.log(`${siteConfig.name} bot aktif.`);
  });
  client.on("auth_failure", (message) => { status = "auth_failed"; console.error("Autentikasi WhatsApp gagal:", message); });
  client.on("disconnected", (reason) => reconnectAfterFailure(new Error(`Bot WhatsApp terputus: ${reason}`)));

  client.on("message", async (message) => {
    if (message.fromMe || message.from.endsWith("@g.us") || message.from === "status@broadcast") return;
    try {
      const contact = await message.getContact();
      const phone = await resolveCustomerPhone(message, contact);
      const proofResult = message.hasMedia ? await receivePaymentProof(message, phone) : null;
      const { replies, notifyAdmin } = proofResult || await handleMessage({
        from: message.from,
        text: message.body,
        phone,
        name: contact.pushname || contact.name || "",
      });
      for (const text of replies) await client.sendMessage(message.from, text);
      if (notifyAdmin) await sendAdminMessage(notifyAdmin);
    } catch (error) {
      console.error("Gagal memproses pesan:", error);
    }
  });

  // whatsapp-web.js melempar promise rejection saat jaringan berubah ketika
  // Chromium membuka web.whatsapp.com. Tangani agar backend tidak ikut mati.
  Promise.resolve().then(() => client.initialize()).catch(reconnectAfterFailure);
  return client;
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) startWhatsAppBot();
