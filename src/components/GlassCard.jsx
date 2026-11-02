export default function GlassCard({ as: Tag = "div", hover = false, className = "", children, ...props }) {
  const hoverClasses = hover
    ? "transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_rgba(34,211,238,0.12)]"
    : "";
  return (
    <Tag className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl ${hoverClasses} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
