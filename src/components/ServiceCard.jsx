import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard.jsx";
import TechnologyBadge from "./TechnologyBadge.jsx";
import { fadeUp } from "../lib/animations.js";

export default function ServiceCard({ service }) {
  const Icon = service.icon;
  return (
    <motion.div variants={fadeUp} className="h-full">
      <GlassCard hover className="group flex h-full flex-col justify-between p-6">
        <div className="flex flex-col gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/30 to-cyan-500/20 text-cyan-300 transition duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon size={24} aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">{service.title}</h3>
          <p className="text-sm leading-relaxed text-slate-400">{service.description}</p>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {service.technologies.map((t) => <TechnologyBadge key={t} name={t} />)}
          </div>
          <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1" aria-label={`Konsultasi ${service.title}`}>
            Konsultasi <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
