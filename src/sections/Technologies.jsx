import SectionHeading from "../components/SectionHeading.jsx";
import TechnologyBadge from "../components/TechnologyBadge.jsx";
import { marqueeRows } from "../data/technologies.js";

function Row({ items, reverse }) {
  // Daftar digandakan agar loop -50% terlihat mulus
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <ul className={`flex w-max gap-3 hover:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {loop.map((t, i) => (
          <li key={`${t.name}-${i}`} aria-hidden={i >= items.length}>
            <TechnologyBadge name={t.name} size="lg" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Technologies() {
  return (
    <section id="technologies" className="scroll-mt-24 py-20">
      <div className="px-6">
        <SectionHeading eyebrow="Technologies" title="Teknologi yang Kami Gunakan" description="Stack modern dengan standar industri, dipilih sesuai kebutuhan project Anda." />
      </div>
      <div className="flex flex-col gap-3">
        <Row items={marqueeRows[0]} />
        <Row items={marqueeRows[1]} reverse />
      </div>
    </section>
  );
}
