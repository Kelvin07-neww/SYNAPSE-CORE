import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Button from "./Button.jsx";
import { navLinks, siteConfig } from "../config/site.js";
import useSectionNav from "../lib/useSectionNav.js";
import logo from "../images/logo.png";

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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <Link to="/" className="min-w-0 flex items-center gap-2 sm:gap-2.5" aria-label={`${siteConfig.name} — beranda`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black sm:h-10 sm:w-10">
            <img src={logo} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-sm font-bold text-white sm:text-base">{siteConfig.name}</span>
            <span className="hidden text-[11px] text-slate-400 sm:block">Next-Gen Systems</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 lg:flex xl:gap-6" aria-label="Navigasi utama">
          {navLinks.map((l) => (
            <a key={l.id} href={`/#${l.id}`} onClick={(e) => handleClick(e, l.id)} className="text-xs text-slate-400 transition hover:text-white xl:text-sm">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button to="/contact" className="hidden px-4 py-2 text-xs md:inline-flex xl:px-5 xl:py-2.5 xl:text-sm">Konsultasi Gratis</Button>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-ink-950/95 lg:hidden" aria-label="Navigasi mobile">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
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
