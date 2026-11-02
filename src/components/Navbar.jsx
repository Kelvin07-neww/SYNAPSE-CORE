import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Cpu } from "lucide-react";
import Button from "./Button.jsx";
import { navLinks, siteConfig } from "../config/site.js";
import useSectionNav from "../lib/useSectionNav.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const goTo = useSectionNav();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();
    setOpen(false);
    goTo(id);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-xl transition duration-300 ${scrolled ? "bg-ink-950/80 shadow-[0_8px_32px_rgba(34,211,238,0.08)]" : "bg-black/40"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name} — beranda`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
            <Cpu size={20} className="text-white" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-white">{siteConfig.name}</span>
            <span className="text-[11px] text-slate-400">Next-Gen Systems</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Navigasi utama">
          {navLinks.map((l) => (
            <a key={l.id} href={`/#${l.id}`} onClick={(e) => handleClick(e, l.id)} className="text-sm text-slate-400 transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button to="/contact" className="hidden px-5 py-2.5 md:inline-flex">Konsultasi Gratis</Button>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white xl:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-ink-950/95 xl:hidden" aria-label="Navigasi mobile">
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((l) => (
                <a key={l.id} href={`/#${l.id}`} onClick={(e) => handleClick(e, l.id)} className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white">
                  {l.label}
                </a>
              ))}
              <Button to="/contact" onClick={() => setOpen(false)} className="mt-2 w-full">Konsultasi Gratis</Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
