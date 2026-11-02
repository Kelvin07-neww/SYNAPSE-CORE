import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "../components/Button.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { slideLeft, slideRight, reveal } from "../lib/animations.js";

const systems = ["Inventory", "POS", "CRM", "ERP", "E-Commerce", "HR System", "Booking System", "Dashboard", "Custom Business System"];
const bars = [40, 65, 50, 80, 62, 92, 75];
const kpis = [["Penjualan", "Rp48,2jt"], ["Order", "312"], ["Stok kritis", "7"]];

function DashboardMockup() {
  return (
    <GlassCard className="p-5" aria-hidden="true">
      <div className="mb-4 grid grid-cols-3 gap-3">
        {kpis.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white/5 p-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className="font-display text-sm font-bold text-white sm:text-base">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex h-36 items-end gap-2 rounded-lg bg-white/5 p-3">
        {bars.map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.07 }}
            className="flex-1 rounded-t bg-gradient-to-t from-purple-600 to-cyan-400" />
        ))}
      </div>
    </GlassCard>
  );
}

export default function BusinessSection() {
  return (
    <section id="business" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div {...reveal(slideRight)} className="flex flex-col gap-5">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Bangun Sistem Digital untuk Bisnis Anda</h2>
          <p className="text-slate-400">Dari kasir sampai ERP, sistem dibuat mengikuti cara kerja bisnis Anda.</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {systems.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-slate-300">
                <Check size={16} className="text-cyan-300" aria-hidden="true" /> {s}
              </li>
            ))}
          </ul>
          <Button to="/contact" className="w-full sm:w-fit">Diskusikan Kebutuhan Bisnis</Button>
        </motion.div>
        <motion.div {...reveal(slideLeft)}><DashboardMockup /></motion.div>
      </div>
    </section>
  );
}
