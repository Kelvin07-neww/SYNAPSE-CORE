import { motion } from "framer-motion";
import { fadeUp, reveal } from "../lib/animations.js";

export default function SectionHeading({ eyebrow, title, description, align = "center" }) {
  const alignment = align === "center" ? "mx-auto text-center items-center" : "items-start text-left";
  return (
    <motion.div {...reveal(fadeUp)} className={`mb-12 flex max-w-3xl flex-col gap-3 ${alignment}`}>
      {eyebrow && (
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {description && <p className="max-w-2xl text-base text-slate-400">{description}</p>}
    </motion.div>
  );
}
