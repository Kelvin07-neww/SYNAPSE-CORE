import { motion } from "framer-motion";
import { Database, Globe, Monitor, Network, Smartphone } from "lucide-react";
import Button from "../components/Button.jsx";
import { fadeUp, slideLeft, stagger } from "../lib/animations.js";

const stats = [
  { value: "50+", label: "Projects" },
  { value: "10+", label: "Technologies" },
  { value: "Custom", label: "Development" },
  { value: "Fast", label: "Response" },
];

// x, y = posisi pusat node dalam persen
const nodes = [
  { label: "API", icon: Network, x: 12, y: 14, delay: 0 },
  { label: "Database", icon: Database, x: 88, y: 12, delay: 0.6 },
  { label: "Mobile App", icon: Smartphone, x: 8, y: 86, delay: 1.2 },
  { label: "Web Dashboard", icon: Globe, x: 90, y: 62, delay: 1.8 },
  { label: "Desktop App", icon: Monitor, x: 56, y: 96, delay: 2.4 },
];

function Visual() {
  return (
    <motion.div variants={slideLeft} className="relative mx-auto h-80 w-full max-w-lg md:h-[26rem]" aria-hidden="true">
      <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {nodes.map((n) => (
          <line key={n.label} x1="50" y1="50" x2={n.x} y2={n.y} stroke="url(#line)" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-ink-900/90 p-4 shadow-[0_20px_60px_rgba(59,130,246,0.2)] backdrop-blur-xl md:w-[62%]">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pink-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-[11px] text-slate-500">app.service.js</span>
        </div>
        <pre className="overflow-hidden font-mono text-[11px] leading-relaxed text-slate-300 sm:text-xs">
{`const app = createApp({
  api: "REST",
  db: "PostgreSQL",
  auth: true,
});

app.deploy(); // ✓ live`}
        </pre>
      </motion.div>

      {nodes.map((n) => {
        const Icon = n.icon;
        return (
          <motion.div key={n.label} animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, delay: n.delay, ease: "easeInOut" }}
            className="absolute hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/10 bg-ink-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-xl md:flex"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}>
            <Icon size={14} className="text-cyan-300" /> {n.label}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="scroll-mt-24 px-4 pb-16 pt-28 sm:px-6 sm:pt-40 lg:pb-28">
      <motion.div variants={stagger(0.1)} initial="hidden" animate="show" className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <motion.span variants={fadeUp} className="w-fit rounded-full border border-cyan-400/20 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wider text-cyan-300 backdrop-blur">
            WEB • MOBILE • DESKTOP • CUSTOM SOFTWARE
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Bangun Aplikasi Digital yang <span className="text-gradient">Sesuai dengan Kebutuhan</span> Anda
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Jasa pembuatan website, mobile app, desktop application, sistem informasi, dan custom software untuk kebutuhan kuliah maupun bisnis.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
            <Button to="/contact" className="w-full sm:w-auto">Mulai Konsultasi</Button>
            <Button to="/portfolio" variant="ghost" className="w-full sm:w-auto">Lihat Portfolio</Button>
          </motion.div>
          <motion.dl variants={fadeUp} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-xl font-bold text-white">{s.value}</dd>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </motion.dl>
        </div>
        <div className="lg:col-span-5"><Visual /></div>
      </motion.div>
    </section>
  );
}
