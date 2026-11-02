import { Github, Instagram, Linkedin, MessageCircle, Mail, Cpu } from "lucide-react";
import { navLinks, siteConfig } from "../config/site.js";
import { buildWhatsAppUrl } from "../lib/whatsapp.js";
import useSectionNav from "../lib/useSectionNav.js";

const footerLinks = navLinks.filter((l) => ["services", "pricing", "portfolio", "technologies", "faq", "contact"].includes(l.id));

export default function Footer() {
  const goTo = useSectionNav();
  const socials = [
    { label: "GitHub", href: siteConfig.github, icon: Github },
    { label: "Instagram", href: siteConfig.instagram, icon: Instagram },
    { label: "LinkedIn", href: siteConfig.linkedin, icon: Linkedin },
    { label: "WhatsApp", href: buildWhatsAppUrl("Halo, saya ingin bertanya tentang jasa software development."), icon: MessageCircle },
    { label: "Email", href: `mailto:${siteConfig.email}`, icon: Mail },
  ];

  return (
    <footer className="border-t border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
                <Cpu size={20} className="text-white" aria-hidden="true" />
              </span>
              <span className="font-display font-bold text-white">{siteConfig.name}</span>
            </div>
            <p className="text-sm text-slate-400">Software development service untuk mahasiswa, UMKM, startup, dan perusahaan.</p>
          </div>

          <nav aria-label="Link footer">
            <h2 className="mb-4 font-display text-sm font-semibold text-white">Menu</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
              {footerLinks.map((l) => (
                <li key={l.id}>
                  <a href={`/#${l.id}`} onClick={(e) => { e.preventDefault(); goTo(l.id); }} className="hover:text-white">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 font-display text-sm font-semibold text-white">Terhubung</h2>
            <ul className="flex flex-wrap gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300">
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
