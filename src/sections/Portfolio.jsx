import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import PortfolioCard from "../components/PortfolioCard.jsx";
import { portfolioCategories, projects } from "../data/portfolio.js";

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const visible = activeCategory === "All" ? projects : projects.filter((p) => p.categories.includes(activeCategory));

  return (
    <section id="portfolio" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Portfolio" title="Project yang Pernah Kami Kerjakan" description="Contoh karya untuk berbagai kebutuhan, dari tugas kuliah sampai sistem bisnis." />
        <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori portfolio">
          {portfolioCategories.map((c) => (
            <button key={c} type="button" onClick={() => setActiveCategory(c)} aria-pressed={activeCategory === c}
              className={`rounded-full border px-4 py-2 text-sm transition ${activeCategory === c ? "border-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => <PortfolioCard key={p.id} project={p} />)}
          </AnimatePresence>
        </motion.div>
        {visible.length === 0 && <p className="mt-8 text-center text-slate-400">Belum ada project di kategori ini.</p>}
      </div>
    </section>
  );
}
