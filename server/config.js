const requiredDANAKeys = ["DANA_API_URL", "DANA_PARTNER_ID", "DANA_MERCHANT_ID", "DANA_CLIENT_ID", "DANA_PRIVATE_KEY_PATH", "DANA_WEBHOOK_SECRET"];

export const config = {
  port: Number(process.env.PORT || 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  paymentProvider: process.env.PAYMENT_PROVIDER || "disabled",
  whatsappBotEnabled: process.env.WHATSAPP_BOT_ENABLED === "true",
  adminApiKey: process.env.ADMIN_API_KEY || "",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  publicAppUrl: (process.env.PUBLIC_APP_URL || process.env.FRONTEND_ORIGIN || "http://localhost:5173").replace(/\/$/, ""),
  dana: Object.fromEntries(requiredDANAKeys.map((key) => [key, process.env[key] || ""])),
};

export function missingDanaConfig() {
  return requiredDANAKeys.filter((key) => !config.dana[key]);
}
