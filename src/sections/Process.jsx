import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import { processSteps } from "../data/process.js";
import { fadeUp, reveal } from "../lib/animations.js";

export default function Process() {
  return (
    <section id="process" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Process" title="Alur Pengerjaan yang Jelas" description="Tujuh tahap dari konsultasi sampai maintenance." />
        <ol className="relative">
          <span className="absolute bottom-4 left-6 top-4 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-400" aria-hidden="true" />
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li key={step.title} {...reveal(fadeUp)} className="relative flex gap-6 pb-10 last:pb-0">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-ink-900 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="pt-1.5">
                  <p className="text-xs text-slate-500">Tahap {i + 1}</p>
                  <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
