import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard.jsx";
import TechnologyBadge from "./TechnologyBadge.jsx";

export default function PortfolioCard({ project }) {
  const Icon = project.icon;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
      <GlassCard hover className="flex h-full flex-col overflow-hidden">
        <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${project.gradient}`} role="img" aria-label={`Ilustrasi ${project.title}`}>
          <div className="absolute inset-0 bg-grid opacity-60" />
          <Icon size={44} className="relative text-white/90" aria-hidden="true" />
          <span className="absolute right-3 top-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-medium text-cyan-300 backdrop-blur">{project.status}</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <span className="text-xs text-slate-500">{project.categories.join(" · ")}</span>
          <h3 className="font-display text-lg font-semibold text-white">{project.title}</h3>
          <p className="flex-1 text-sm text-slate-400">{project.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((t) => <TechnologyBadge key={t} name={t} />)}
          </div>
          <Link to="/contact" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:underline">
            View Project <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
