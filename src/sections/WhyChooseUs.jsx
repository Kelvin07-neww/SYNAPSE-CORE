import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { reasons } from "../data/whyChooseUs.js";
import { fadeUp, stagger } from "../lib/animations.js";

export default function WhyChooseUs() {
  return (
    <section id="why" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Why Choose Us" title="Kenapa Memilih Kami" />
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} variants={fadeUp}>
                <GlassCard hover className="h-full p-6">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-500/20 text-cyan-300">
                    <Icon size={24} aria-hidden="true" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold text-white">{r.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{r.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
