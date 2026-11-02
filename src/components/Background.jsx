const particles = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: `${(i % 6) * 0.8}s`,
}));

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] animate-drift rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[28rem] w-[28rem] animate-drift rounded-full bg-blue-600/20 blur-[130px] [animation-delay:-5s]" />
      <div className="absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] animate-drift rounded-full bg-cyan-500/10 blur-[150px] [animation-delay:-9s]" />
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_60%,transparent_100%)]" />
      {particles.map((p, i) => (
        <span key={i} className="absolute h-1 w-1 animate-twinkle rounded-full bg-cyan-200" style={{ left: p.left, top: p.top, animationDelay: p.delay }} />
      ))}
    </div>
  );
}
