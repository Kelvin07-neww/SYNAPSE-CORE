// Workaround whatsapp-web.js media regression (upstream issue #201922).
// Reapply after npm installs until the fix is shipped in a stable release.
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "node_modules", "whatsapp-web.js", "src", "util", "Injected", "Utils.js");
const marker = "delete message.__x_id;";
if (!fs.existsSync(file)) {
  console.warn("Patch media WhatsApp dilewati: whatsapp-web.js belum terinstal.");
  process.exit(0);
}
const source = fs.readFileSync(file, "utf8");
if (source.includes(marker)) {
  console.log("Patch media WhatsApp sudah aktif.");
  process.exit(0);
}
const target = "        };\n\n        // Bot's won't reply if canonicalUrl is set (linking)";
if (!source.includes(target)) {
  console.warn("Patch media WhatsApp tidak dapat diterapkan: struktur library berubah.");
  process.exit(0);
}
fs.writeFileSync(file, source.replace(target, `        };\n        // Hindari collision MediaData internal ID dengan ID pesan keluar.\n        ${marker}\n\n        // Bot's won't reply if canonicalUrl is set (linking)`));
console.log("Patch media WhatsApp berhasil diterapkan.");
