import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { testimonials } from "../data/testimonials.js";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;
  const go = (step) => setIndex((i) => (i + step + total) % total);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 6000);
    return () => clearInterval(timer);
  }, [paused, total]);

  const t = testimonials[index];

  return (
    <section id="testimonials" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-3xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <SectionHeading eyebrow="Testimonials" title="Kata Mereka" />
        <GlassCard className="relative min-h-[17rem] overflow-hidden p-8 sm:p-10" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.figure key={index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }} className="flex flex-col gap-5">
              <div className="flex gap-1" role="img" aria-label={`Rating ${t.rating} dari 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={18} className={i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-slate-200">“{t.message}”</blockquote>
              <figcaption>
                <p className="font-display font-semibold text-white">{t.name}</p>
                <p className="text-sm text-slate-400">{t.role} · {t.project}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </GlassCard>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Testimoni sebelumnya" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10"><ChevronLeft size={18} /></button>
          <div className="flex gap-2">
            {testimonials.map((item, i) => (
              <button key={item.name} type="button" onClick={() => setIndex(i)} aria-label={`Testimoni ${i + 1}`} aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-cyan-400" : "w-2 bg-white/20"}`} />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Testimoni berikutnya" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10"><ChevronRight size={18} /></button>
        </div>
      </div>
    </section>
  );
}
