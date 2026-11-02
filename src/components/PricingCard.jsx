import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "./Button.jsx";
import { fadeUp } from "../lib/animations.js";
import { buildWhatsAppUrl } from "../lib/whatsapp.js";

export default function PricingCard({ plan }) {
  const message = `Halo, saya tertarik dengan paket ${plan.name} (${plan.prefix} ${plan.price}). Bisa dibantu konsultasi?`.replace("  ", " ");
  return (
    <motion.div variants={fadeUp} className="h-full">
      <div className={`h-full rounded-2xl p-px ${plan.popular ? "bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_48px_rgba(99,102,241,0.25)]" : "bg-white/10"}`}>
        <div className="relative flex h-full flex-col gap-6 rounded-2xl bg-ink-900/95 p-6 backdrop-blur-xl">
          {plan.popular && (
            <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 px-3 py-1 text-[11px] font-bold text-white">
              MOST POPULAR
            </span>
          )}
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
          </div>
          <div>
            {plan.prefix && <span className="text-xs text-slate-500">{plan.prefix}</span>}
            <div className="font-display text-3xl font-bold text-white">{plan.price}</div>
          </div>
          <ul className="flex flex-1 flex-col gap-2.5 text-sm text-slate-300">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
          <Button href={buildWhatsAppUrl(message)} variant={plan.popular ? "primary" : "ghost"} className="w-full">
            Pilih Paket
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
