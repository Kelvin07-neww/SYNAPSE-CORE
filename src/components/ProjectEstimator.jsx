import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import GlassCard from "./GlassCard.jsx";
import Button from "./Button.jsx";
import { platforms, complexities, features, calculateEstimate } from "../data/estimator.js";
import { rupiah } from "../lib/format.js";
import { buildWhatsAppUrl } from "../lib/whatsapp.js";

const optionClass = (active) =>
  `rounded-lg border px-3 py-2 text-sm transition ${active ? "border-cyan-400/60 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25"}`;

export default function ProjectEstimator() {
  const [platformId, setPlatformId] = useState("website");
  const [complexityId, setComplexityId] = useState("basic");
  const [featureIds, setFeatureIds] = useState([]);

  const estimate = useMemo(() => calculateEstimate({ platformId, complexityId, featureIds }), [platformId, complexityId, featureIds]);

  const toggleFeature = (id) => setFeatureIds((cur) => (cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id]));

  const range = `${rupiah(estimate.min)} – ${rupiah(estimate.max)}`;
  const message = [
    "Halo, saya sudah mencoba Project Estimator.",
    "",
    `Platform: ${platforms.find((p) => p.id === platformId).label}`,
    `Kompleksitas: ${complexities.find((c) => c.id === complexityId).label}`,
    `Fitur: ${features.filter((f) => featureIds.includes(f.id)).map((f) => f.label).join(", ") || "-"}`,
    `Estimasi: ${range}`,
    "",
    "Saya ingin berkonsultasi lebih lanjut.",
  ].join("\n");

  return (
    <GlassCard className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <fieldset>
          <legend className="mb-3 font-display font-semibold text-white">Platform</legend>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <label key={p.id} className={`${optionClass(platformId === p.id)} cursor-pointer focus-within:ring-2 focus-within:ring-cyan-400/80`}>
                <input type="radio" name="platform" className="sr-only" checked={platformId === p.id} onChange={() => setPlatformId(p.id)} />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-display font-semibold text-white">Complexity</legend>
          <div className="flex flex-wrap gap-2">
            {complexities.map((c) => (
              <label key={c.id} className={`${optionClass(complexityId === c.id)} cursor-pointer focus-within:ring-2 focus-within:ring-cyan-400/80`}>
                <input type="radio" name="complexity" className="sr-only" checked={complexityId === c.id} onChange={() => setComplexityId(c.id)} />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-display font-semibold text-white">Features</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {features.map((f) => (
              <label key={f.id} className={`${optionClass(featureIds.includes(f.id))} flex cursor-pointer items-center gap-2 focus-within:ring-2 focus-within:ring-cyan-400/80`}>
                <input type="checkbox" className="h-4 w-4 accent-cyan-400" checked={featureIds.includes(f.id)} onChange={() => toggleFeature(f.id)} />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-xl border border-white/10 bg-ink-950/60 p-6">
        <div aria-live="polite">
          <p className="text-sm text-slate-400">Estimated Project Cost</p>
          <p className="mt-2 font-display text-2xl font-bold text-gradient sm:text-3xl">{range}</p>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Ini hanya perkiraan awal, bukan harga final. Harga akhir ditentukan setelah kebutuhan dianalisis.
          </p>
        </div>
        <Button href={buildWhatsAppUrl(message)} className="w-full">
          <MessageCircle size={18} aria-hidden="true" /> Konsultasikan Project
        </Button>
      </div>
    </GlassCard>
  );
}
