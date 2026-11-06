// Membaca pesan otomatis yang dibuat tombol WhatsApp di website
// (lihat src/lib/whatsapp.js dan src/components/ProjectEstimator.jsx).
const readFields = (text) => {
  const fields = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^([^:]{2,20}):\s*(.*)$/);
    if (match) fields[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return fields;
};

export function parseWebMessage(text) {
  if (/project estimator/i.test(text)) {
    const f = readFields(text);
    if (f.estimasi) return { type: "estimator", platform: f.platform || "-", complexity: f.kompleksitas || "-", features: f.fitur || "-", estimate: f.estimasi };
  }
  if (/jasa software development/i.test(text) && /^nama:/im.test(text)) {
    const f = readFields(text);
    return { type: "brief", brief: { name: f.nama || "-", project: f.project || "-", platform: f.platform || "-", budget: f.budget || "-", deadline: f.deadline || "-", description: f.deskripsi || "-" } };
  }
  const plan = text.match(/^paket:\s*(.+)$/im) || text.match(/tertarik dengan paket\s+(\w+)/i);
  if (plan) return { type: "plan", name: plan[1].trim() };
  return null;
}
