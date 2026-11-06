<div align="center">

# 🧠 SYNAPSE-CORE

> *The core engine and backbone of the Synapse ecosystem.*

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)]()

</div>

---

## 📖 About
**SYNAPSE-CORE** is a high-performance, modular core engine designed to handle robust backend operations, state management, and seamless data processing. Built with scalability and flexibility in mind, it serves as the foundational pillar for the entire Synapse project architecture.

---

## ✨ Features
- **Modular Architecture:** Easily extensible components for custom plugin integration.
- **High Performance:** Optimized execution engine ensuring low latency and high throughput.
- **Robust Security:** Built-in authentication, authorization, and secure data handling.
- **Scalable Design:** Designed to scale effortlessly from local environments to enterprise deployments.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite 5, React Router, Tailwind CSS, Framer Motion
- **Backend:** Node.js (ESM), Express 5, Multer
- **Database:** SQLite (`node:sqlite` bawaan Node.js)
- **Bot:** whatsapp-web.js (Chromium) + AI opsional (Groq / Gemini / OpenAI)

---

## 🚀 Getting Started

### Prerequisites
Pastikan Anda telah menginstal tools berikut di komputer Anda:
- Git
- Node.js **22.5 atau lebih baru** (dibutuhkan `node:sqlite`)
- Chromium (untuk bot WhatsApp; atur `CHROMIUM_PATH` bila bukan `/usr/bin/chromium`)

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/Kelvin07-neww/SYNAPSE-CORE.git
   cd SYNAPSE-CORE
   ```

2. **Configure environment variables:**
   Buat file `.env` di root directory berdasarkan file template (jika ada), lalu sesuaikan konfigurasinya.
   ```bash
   cp .env.example .env
   ```

3. **Run the application:**
    ```bash
    npm install
    npm run bot:install
    npm run all
    ```

    Perintah `npm run all` menjalankan backend API, bot WhatsApp, dan frontend Vite secara bersamaan.

### Payment API (QRIS DANA)

Fondasi backend pembayaran tersedia di folder `server/`. Jalankan terpisah dari Vite:

```bash
cp .env.example .env
npm run server
```

Endpoint yang tersedia: `GET /api/health`, `POST /api/payments` (khusus admin), `GET /api/payments/:id`, dan `POST /api/webhooks/dana`.

Pesanan bot dan transaksi pembayaran disimpan di SQLite (salinan pesanan juga diekspor ke `bot/data/orders.csv`), secara default di `server/data/synapse.db`. File ini dibuat otomatis serta tidak di-commit. Untuk server produksi, atur `DATABASE_PATH` ke volume/penyimpanan persisten. Pesanan lama pada `bot/data/orders.json` akan dimigrasikan otomatis sekali saat database pertama kali dijalankan.

Pembayaran memakai QRIS statis pada `src/images/qris.png`. Customer membayar sesuai nominal tagihan lalu bukti pembayaran diverifikasi manual melalui `/admin`. Endpoint `POST /api/payments` membuat tagihan berstatus `PENDING` tanpa memerlukan kredensial DANA. Rahasia seperti private key **tidak boleh** diletakkan pada `src/` atau variabel `VITE_*`.

### Bot WhatsApp backend

Backend dapat menjalankan bot WhatsApp Web bersamaan dengan API:

```bash
npm run server:bot
```

Untuk jawaban konsultasi yang lebih fleksibel dan rekomendasi paket berdasarkan kebutuhan customer, isi `GROQ_API_KEY` dan `AI_PROVIDER=groq` pada `.env` (lihat `.env.example`). Groq menyediakan free tier dengan batas kuota. Isi juga `GEMINI_API_KEY` dari Google AI Studio agar bot otomatis memakai Gemini ketika Groq limit atau tidak tersedia. Bot tetap memakai respons lokal bila kedua layanan AI gagal. API key hanya digunakan oleh backend/bot dan tidak pernah boleh memakai prefix `VITE_`.

Scan QR yang muncul di terminal dengan WhatsApp. Periksa statusnya melalui `GET /api/bot/status`. Saat webhook pembayaran nantinya mengubah transaksi menjadi `PAID`, bot mengirim notifikasi ke nomor `siteConfig.whatsapp`. Ganti placeholder nomor admin pada `src/config/site.js` terlebih dahulu.

### Rekap pesanan & bukti pembayaran

Buka `/admin`, masukkan nilai `ADMIN_API_KEY` dari `.env`, lalu muat rekap. Admin dapat mengunggah bukti JPG, PNG, WEBP, atau PDF (maksimal 5 MB) untuk setiap pesanan dan menyetujuinya. Pesanan yang disetujui otomatis berstatus `siap_dikerjakan`; berkas bukti disimpan privat di `server/uploads/` dan tidak dapat diakses tanpa API key.

Form **Kirim Project Brief** pada halaman kontak mengirim data ke database melalui `POST /api/orders`. Pesanan baru langsung terlihat pada dashboard admin dengan status `baru`.

Pesanan berstatus `selesai` dikunci dari perubahan status biasa. Admin dapat memakai tombol **Buka kembali** bila pekerjaan perlu dilanjutkan; setiap perubahan manual dicatat pada tabel `order_status_history`.

Saat bot aktif melalui `npm run server:bot`, setiap pembaruan status pekerjaan dari dashboard admin juga dikirim otomatis ke nomor WhatsApp pelanggan.

---

## 📂 Project Structure
```text
SYNAPSE-CORE/
├── src/            # Website React (pages, sections, components, data)
├── server/         # Express API, SQLite, admin & pembayaran
├── bot/            # Chatbot WhatsApp (engine, adapter, AI)
├── .env.example    # Template environment variables
└── README.md       # Dokumentasi Project
```

---

## 🤝 Contributing
Kontribusi, *issues*, dan *pull requests* sangat diterima! 
1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/NamaFitur`)
3. Commit perubahan Anda (`git commit -m 'Add some NamaFitur'`)
4. Push ke branch (`git push origin feature/NamaFitur`)
5. Buka Pull Request

---

<div align="center">
  <sub>Built with 🖤 by <a href="https://github.com/Kelvin07-neww">Kelvin07-neww</a></sub>
</div>
