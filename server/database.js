import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.DATABASE_PATH || path.join(serverDir, "data", "synapse.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    phone TEXT,
    name TEXT,
    brief_json TEXT,
    estimate_json TEXT
    ,total_amount INTEGER
  );
  CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    external_id TEXT UNIQUE NOT NULL,
    order_id TEXT,
    amount INTEGER NOT NULL CHECK(amount > 0),
    currency TEXT NOT NULL,
    description TEXT NOT NULL,
    customer_json TEXT,
    provider TEXT NOT NULL,
    provider_reference TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT
    ,payment_type TEXT NOT NULL DEFAULT 'FULL'
    ,total_amount INTEGER
  );
  CREATE INDEX IF NOT EXISTS payments_external_id_idx ON payments(external_id);
  CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
  CREATE TABLE IF NOT EXISTS payment_proofs (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    payment_id TEXT REFERENCES payments(id),
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    review_note TEXT,
    uploaded_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS payment_proofs_order_id_idx ON payment_proofs(order_id, uploaded_at DESC);
  CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    previous_status TEXT NOT NULL,
    next_status TEXT NOT NULL,
    actor TEXT NOT NULL,
    changed_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON order_status_history(order_id, changed_at DESC);
  CREATE TABLE IF NOT EXISTS chat_profiles (
    phone TEXT PRIMARY KEY,
    name TEXT,
    memory_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  );
`);

// Database yang sudah dibuat sebelum kolom email ditambahkan tetap dapat dipakai.
const orderColumns = db.prepare("PRAGMA table_info(orders)").all().map((column) => column.name);
if (!orderColumns.includes("email")) db.exec("ALTER TABLE orders ADD COLUMN email TEXT");
if (!orderColumns.includes("total_amount")) db.exec("ALTER TABLE orders ADD COLUMN total_amount INTEGER");
const paymentColumns = db.prepare("PRAGMA table_info(payments)").all().map((column) => column.name);
if (!paymentColumns.includes("payment_type")) db.exec("ALTER TABLE payments ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'FULL'");
if (!paymentColumns.includes("total_amount")) db.exec("ALTER TABLE payments ADD COLUMN total_amount INTEGER");

const getMetadata = db.prepare("SELECT value FROM metadata WHERE key = ?");
const setMetadata = db.prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)");

function migrateLegacyOrders() {
  if (getMetadata.get("legacy_orders_migrated")) return;
  const legacyFile = path.join(serverDir, "..", "bot", "data", "orders.json");
  try {
    const orders = JSON.parse(fs.readFileSync(legacyFile, "utf8"));
    const insert = db.prepare(`INSERT OR IGNORE INTO orders
      (id, created_at, status, type, source, phone, name, brief_json, estimate_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const order of (Array.isArray(orders) ? orders : [])) {
      insert.run(
        order.id,
        order.createdAt,
        order.status || "baru",
        order.type || "brief",
        order.source || "legacy",
        order.customer?.phone || "",
        order.customer?.name || order.brief?.name || "",
        order.brief ? JSON.stringify(order.brief) : null,
        order.estimate ? JSON.stringify(order.estimate) : null,
      );
    }
  } catch (error) {
    if (error.code !== "ENOENT") console.warn("Migrasi pesanan lama dilewati:", error.message);
  }
  setMetadata.run("legacy_orders_migrated", new Date().toISOString());
}

migrateLegacyOrders();

if (!getMetadata.get("order_phones_normalized")) {
  db.exec("UPDATE orders SET phone = '62' || substr(phone, 2) WHERE phone GLOB '0[0-9]*'");
  setMetadata.run("order_phones_normalized", new Date().toISOString());
}

// Sebelum fitur DP, persetujuan bukti tidak mengubah status tagihan.
if (!getMetadata.get("accepted_proofs_marked_paid")) {
  db.exec("UPDATE payments SET status = 'PAID' WHERE status = 'PENDING' AND id IN (SELECT payment_id FROM payment_proofs WHERE status = 'ACCEPTED')");
  setMetadata.run("accepted_proofs_marked_paid", new Date().toISOString());
}

export const parseJson = (value) => {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
};
