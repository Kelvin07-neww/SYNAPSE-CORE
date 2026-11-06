// Memori ringkas customer disimpan di SQLite agar konsultasi tidak dimulai ulang.
import { db, parseJson } from "../server/database.js";

const selectProfile = db.prepare("SELECT name, memory_json FROM chat_profiles WHERE phone = ?");
const upsertProfile = db.prepare(`INSERT INTO chat_profiles (phone, name, memory_json, updated_at) VALUES (?, ?, ?, ?)
  ON CONFLICT(phone) DO UPDATE SET name = excluded.name, memory_json = excluded.memory_json, updated_at = excluded.updated_at`);

const compact = (text) => String(text).replace(/\s+/g, " ").trim().slice(0, 500);

export function getCustomerMemory(phone) {
  if (!phone) return {};
  const row = selectProfile.get(phone);
  return parseJson(row?.memory_json) || {};
}

export function getCustomerChatId(phone) {
  return getCustomerMemory(phone).chatId || "";
}

export function rememberCustomer({ phone, name }, input, { selectedPlan, chatId } = {}) {
  if (!phone) return {};
  const previous = getCustomerMemory(phone);
  const needs = [...(previous.needs || []), compact(input)].filter(Boolean).slice(-6);
  const memory = { ...previous, needs, selectedPlan: selectedPlan || previous.selectedPlan || "", chatId: chatId || previous.chatId || "", lastUpdatedAt: new Date().toISOString() };
  upsertProfile.run(phone, name || "", JSON.stringify(memory), memory.lastUpdatedAt);
  return memory;
}
