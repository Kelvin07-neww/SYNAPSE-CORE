# SYNAPSE CORE — Software Development & Digital Solution

    npm install
    npm run dev

Ganti nomor WhatsApp, email, dan sosial media di `src/config/site.js`.
Data portfolio dan testimoni di `src/data/` adalah contoh; ganti dengan data asli.

## Chatbot WhatsApp (`bot/`)

Bot memakai data yang sama dengan website (`src/data`, `src/config/site.js`).

    npm run bot:cli       # coba di terminal tanpa WhatsApp
    npm run bot:install   # sekali saja, memasang whatsapp-web.js
    npm run bot           # jalankan bot, scan QR dengan WhatsApp

Inti bot ada di `bot/engine.js` dan tidak bergantung pada platform: untuk WhatsApp Cloud API atau Fonnte, panggil `handleMessage({ from, text })` dari webhook.
# SYNAPSE-CORE
