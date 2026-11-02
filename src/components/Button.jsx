import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition duration-200 active:scale-95";
const variants = {
  primary:
    "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-[0_0_28px_rgba(59,130,246,0.35)] hover:shadow-[0_0_40px_rgba(59,130,246,0.55)] hover:brightness-110",
  ghost: "border border-white/10 bg-white/5 text-slate-100 backdrop-blur hover:border-white/25 hover:bg-white/10",
};

export default function Button({ variant = "primary", to, href, className = "", children, ...props }) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>;
  if (href) return <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  return <button type="button" className={classes} {...props}>{children}</button>;
}
