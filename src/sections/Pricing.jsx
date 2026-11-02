import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import PricingCard from "../components/PricingCard.jsx";
import ProjectEstimator from "../components/ProjectEstimator.jsx";
import { plans, pricingDisclaimer } from "../data/pricing.js";
import { fadeUp, reveal, stagger } from "../lib/animations.js";

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Pricing" title="Paket yang Bisa Disesuaikan" description="Pilih titik awal, lalu kami sesuaikan dengan kebutuhan project Anda." />
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => <PricingCard key={p.name} plan={p} />)}
        </motion.div>
        <p className="mx-auto mt-8 max-w-3xl border-l-2 border-cyan-400/40 pl-4 text-sm text-slate-400">{pricingDisclaimer}</p>

        <motion.div {...reveal(fadeUp)} className="mt-20">
          <SectionHeading title="Project Estimator" description="Pilih platform, kompleksitas, dan fitur untuk melihat perkiraan biaya." />
          <ProjectEstimator />
        </motion.div>
      </div>
    </section>
  );
}
