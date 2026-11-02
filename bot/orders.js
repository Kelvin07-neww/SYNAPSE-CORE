// Menyimpan pesanan ke bot/data/orders.json (data utama) dan orders.csv (bisa dibuka di Excel).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const jsonFile = path.join(dir, "orders.json");
const csvFile = path.join(dir, "orders.csv");
const csvColumns = ["id", "createdAt", "status", "type", "source", "phone", "name", "project", "platform", "budget", "deadline", "description", "estimate"];

const readAll = () => {
  try { return JSON.parse(fs.readFileSync(jsonFile, "utf8")); } catch { return []; }
};
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

function appendCsv(order) {
  if (!fs.existsSync(csvFile)) fs.writeFileSync(csvFile, `${csvColumns.join(",")}\n`);
  const row = {
    ...order,
    ...order.brief,
    name: order.brief?.name || order.customer?.name,
    phone: order.customer?.phone,
    estimate: order.estimate ? `${order.estimate.platform} / ${order.estimate.complexity} / ${order.estimate.features} / ${order.estimate.range}` : "",
  };
  fs.appendFileSync(csvFile, `${csvColumns.map((c) => csvCell(row[c])).join(",")}\n`);
}

export function saveOrder(partial) {
  fs.mkdirSync(dir, { recursive: true });
  const orders = readAll();
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replace(/-/g, "");
  const count = orders.filter((o) => o.id.includes(day)).length + 1;
  const order = { id: `ORD-${day}-${String(count).padStart(3, "0")}`, status: "baru", createdAt: now.toISOString(), ...partial };
  fs.writeFileSync(jsonFile, JSON.stringify([...orders, order], null, 2));
  appendCsv(order);
  return order;
}

export const listOrders = (limit = 5) => readAll().slice(-limit).reverse();
export const getOrder = (id) => readAll().find((o) => o.id.toLowerCase() === id.toLowerCase());
