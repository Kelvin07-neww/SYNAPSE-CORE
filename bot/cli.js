// Simulator di terminal untuk mencoba bot tanpa WhatsApp: npm run bot:cli
import readline from "node:readline";
import { handleMessage } from "./engine.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "kamu> " });
console.log("Simulator bot. Ketik pesan, atau Ctrl+C untuk keluar.\n");
rl.prompt();

rl.on("line", async (line) => {
  const { replies, notifyAdmin } = await handleMessage({ from: "cli-user", text: line });
  replies.forEach((r) => console.log(`\nbot> ${r}\n`));
  if (notifyAdmin) console.log(`[ke admin]\n${notifyAdmin}\n`);
  rl.prompt();
});
