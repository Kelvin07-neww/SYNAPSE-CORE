// Respons percakapan umum. Variasi kata dinormalisasi agar bot tetap mudah
// dipakai dengan bahasa Indonesia sehari-hari, campuran Inggris, dan singkatan chat.
const normalize = (text) => text
  .toLowerCase()
  .replace(/[!?.,]/g, " ")
  .replace(/\b(gk|ga|gak|nggak|engga|enggak)\b/g, "tidak")
  .replace(/\bmakasih\b/g, "terima kasih")
  .replace(/\bpls\b/g, "tolong")
  .replace(/\s+/g, " ")
  .trim();

const intents = [
  { patterns: [/^(apa kabar|how are you|gimana kabarnya)/], reply: "Baik, terima kasih. Ada yang bisa saya bantu tentang pembuatan website atau aplikasi?" },
  { patterns: [/^(terima kasih|thanks|thank you|thx|makasi)/], reply: "Sama-sama. Senang bisa membantu. Ketik *menu* jika ingin melihat pilihan layanan." },
  { patterns: [/^(selamat (pagi|siang|sore|malam)|good (morning|afternoon|evening|night))/], reply: "Halo! Ada yang bisa saya bantu hari ini? Ketik *menu* untuk melihat layanan kami." },
  { patterns: [/(siapa (kamu|anda)|kamu siapa|who are you|ini bot apa)/], reply: "Saya asisten WhatsApp SYNAPSE CORE. Saya dapat membantu informasi layanan, paket, estimasi, portfolio, FAQ, dan project brief." },
  { patterns: [/(bisa bantu|bisa apa|bantu saya|what can you do|bantuan|help)/], reply: "Tentu. Saya bisa membantu memilih layanan atau paket, menghitung estimasi awal, menjawab FAQ, serta mencatat project brief. Ketik *menu* untuk semua pilihan." },
  { patterns: [/(jam (operasional|kerja)|buka jam|working hours|kapan bisa dihubungi)/], reply: "Anda boleh mengirim kebutuhan kapan saja. Untuk respons dan konsultasi langsung dengan admin, ketik *admin* atau pilih menu *9*." },
  { patterns: [/(alamat|lokasi|kantor dimana|where are you)/], reply: "Untuk informasi lokasi atau pertemuan, silakan ketik *admin* agar tim kami dapat mengatur konsultasi yang sesuai." },
  { patterns: [/(nomor (admin|wa|whatsapp)|kontak|hubungi admin|contact)/], reply: "Ketik *admin* atau pilih *9* untuk diteruskan ke admin. Anda juga dapat mengirimkan project brief terlebih dahulu agar kebutuhan Anda tercatat." },
  { patterns: [/(cara (pesan|order)|mau buat|ingin buat|pengen buat|mau bikin|buat (website|aplikasi|sistem))/], reply: "Siap. Ketik *brief* atau pilih *8*, lalu saya akan menanyakan kebutuhan project Anda satu per satu." },
  { patterns: [/(berapa lama|durasi|timeline|selesai kapan|pengerjaan)/], reply: "Durasi bergantung pada fitur, tingkat kompleksitas, dan revisi. Ketik *proses* untuk alurnya, atau kirim *brief* agar admin dapat memberi timeline yang lebih akurat." },
  { patterns: [/(revisi|ubah desain|perbaikan)/], reply: "Kebutuhan revisi dapat dibahas saat konsultasi karena jumlah dan cakupannya menyesuaikan paket serta project. Ketik *admin* untuk membicarakannya langsung." },
  { patterns: [/(pembayaran|bayar|dp |cicil|metode bayar|qris)/], reply: "Detail pembayaran dan termin akan disesuaikan dengan project setelah kebutuhan dianalisis. Ketik *admin* untuk konsultasi pembayaran." },
  { patterns: [/(garansi|maintenance|pemeliharaan|support)/], reply: "Kebutuhan maintenance dan dukungan dapat disesuaikan dengan project Anda. Sampaikan kebutuhan melalui *brief* atau ketik *admin* untuk opsi yang tepat." },
  { patterns: [/(website|web app|landing page|aplikasi mobile|android|ios|desktop|sistem informasi)/], reply: "Kami melayani pengembangan website, web app, aplikasi mobile, desktop, dan sistem informasi. Ketik *layanan* untuk detailnya atau *estimasi* untuk perkiraan biaya." },
  { patterns: [/(boleh|bisa|ok|oke|iya|ya|siap)/], reply: "Baik. Ketik *menu* untuk memilih layanan, atau *brief* jika Anda siap menjelaskan project yang ingin dibuat." },
  { patterns: [/(tidak|belum|nanti saja|gajadi|batal)/], reply: "Tidak masalah. Jika sudah siap, ketik *menu* kapan saja dan saya akan membantu." },
];

export function findConversationReply(text) {
  const input = normalize(text);
  if (!input || input.length > 180) return null;
  return intents.find(({ patterns }) => patterns.some((pattern) => pattern.test(input)))?.reply || null;
}
