import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Button from "../components/Button.jsx";
import GlassCard from "../components/GlassCard.jsx";
import TechnologyBadge from "../components/TechnologyBadge.jsx";
import { fadeUp, reveal } from "../lib/animations.js";

const topics = ["Web", "Mobile", "Desktop", "Database", "API", "Sistem Informasi", "Project Programming"];

export default function StudentSection() {
  return (
    <section id="student" className="scroll-mt-24 px-6 py-20">
      <motion.div {...reveal(fadeUp)} className="mx-auto max-w-7xl">
        <GlassCard className="flex flex-col items-start gap-6 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-500/20 text-cyan-300">
              <GraduationCap size={24} aria-hidden="true" />
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Butuh Bantuan Project Kuliah?</h2>
            <p className="text-slate-400">
              Kami membantu mahasiswa memahami, mengembangkan, dan membuat prototype aplikasi. Anda mendapat bimbingan teknis, source code yang terdokumentasi, dan penjelasan alur sistem agar bisa mempelajari dan mempresentasikannya sendiri.
            </p>
            <div className="flex flex-wrap gap-2">{topics.map((t) => <TechnologyBadge key={t} name={t} />)}</div>
          </div>
          <Button to="/contact" className="w-full md:w-auto">Konsultasikan Project</Button>
        </GlassCard>
      </motion.div>
    </section>
  );
}
