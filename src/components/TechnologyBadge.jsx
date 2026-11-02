export default function TechnologyBadge({ name, size = "sm" }) {
  const sizes = size === "lg" ? "px-5 py-2.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex whitespace-nowrap rounded-lg border border-white/10 bg-white/5 font-medium text-slate-300 ${sizes}`}>
      {name}
    </span>
  );
}
