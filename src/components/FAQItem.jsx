import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import GlassCard from "./GlassCard.jsx";

export default function FAQItem({ id, question, answer, open, onToggle }) {
  return (
    <GlassCard>
      <h3>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`faq-${id}`}
          className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left font-display font-semibold text-white">
          {question}
          <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-cyan-300">
            <Plus size={20} aria-hidden="true" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`faq-${id}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
