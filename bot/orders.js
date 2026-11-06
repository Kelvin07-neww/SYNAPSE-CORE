// Menyimpan pesanan ke SQLite dan mengekspor baris baru ke CSV (bisa dibuka di Excel).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, parseJson } from "../server/database.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const csvFile = path.join(dir, "orders.csv");
const csvColumns = ["id", "createdAt", "status", "type", "source", "phone", "email", "name", "project", "platform", "budget", "deadline", "description", "estimate"];

// Simpan nomor dalam format internasional (62…) agar pesanan dari website dan
// WhatsApp dapat dicocokkan. Awalan 8 hanya dianggap nomor lokal untuk input form,
// karena ID LID WhatsApp juga bisa diawali angka 8.
export function normalizePhone(phone, { local = false } = {}) {
  const raw = String(phone || "").trim();
  const digits = raw.replace(/[\s\-+().]/g, "");
  if (!/^\d+$/.test(digits)) return raw;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (local && digits.startsWith("8")) return `62${digits}`;
  return digits;
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

const mapOrder = (row) => row && ({
  id: row.id,
  createdAt: row.created_at,
  status: row.status,
  type: row.type,
  source: row.source,
  customer: { phone: row.phone || "", email: row.email || "", name: row.name || "" },
  brief: parseJson(row.brief_json),
  estimate: parseJson(row.estimate_json),
});

function appendCsv(order) {
  const header = csvColumns.join(",");
  if (fs.existsSync(csvFile) && fs.readFileSync(csvFile, "utf8").split("\n", 1)[0].trim() !== header) {
    // Kolom berubah: arsipkan file lama agar baris baru tidak bergeser.
    fs.renameSync(csvFile, path.join(dir, `orders.legacy-${Date.now()}.csv`));
  }
  if (!fs.existsSync(csvFile)) fs.writeFileSync(csvFile, `${header}\n`);
  const row = {
    ...order,
    ...order.brief,
    name: order.brief?.name || order.customer?.name,
    phone: order.customer?.phone,
    email: order.customer?.email,
    estimate: order.estimate ? `${order.estimate.platform} / ${order.estimate.complexity} / ${order.estimate.features} / ${order.estimate.range}` : "",
  };
  fs.appendFileSync(csvFile, `${csvColumns.map((c) => csvCell(row[c])).join(",")}\n`);
}

export function saveOrder(partial) {
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `ORD-${day}-`;
  const last = db.prepare("SELECT MAX(CAST(substr(id, ?) AS INTEGER)) AS last FROM orders WHERE id LIKE ?").get(prefix.length + 1, `${prefix}%`).last || 0;
  const order = { id: `${prefix}${String(last + 1).padStart(3, "0")}`, status: "baru", createdAt: now.toISOString(), ...partial };
  if (order.customer) order.customer = { ...order.customer, phone: normalizePhone(order.customer.phone) };
  db.prepare(`INSERT INTO orders (id, created_at, status, type, source, phone, email, name, brief_json, estimate_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(order.id, order.createdAt, order.status, order.type, order.source, order.customer?.phone || "", order.customer?.email || "", order.customer?.name || order.brief?.name || "", order.brief ? JSON.stringify(order.brief) : null, order.estimate ? JSON.stringify(order.estimate) : null);
  appendCsv(order);
  return order;
}

export const listOrders = (limit = 5) => db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?").all(limit).map(mapOrder);
export const getOrder = (id) => mapOrder(db.prepare("SELECT * FROM orders WHERE lower(id) = lower(?)").get(id));
export const listCustomerOrders = (phone, limit = 10) => {
  if (!phone) return [];
  return db.prepare("SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC LIMIT ?").all(normalizePhone(phone), limit).map(mapOrder);
};
