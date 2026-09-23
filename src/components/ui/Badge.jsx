import { cn } from "../../lib/utils";

const badgeVariants = {
  violet: "border-purple-500/35 bg-purple-500/15 text-purple-200",
  blue: "border-sky-500/35 bg-sky-500/15 text-sky-200",
  emerald: "border-emerald-500/35 bg-emerald-500/15 text-emerald-200",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  rose: "border-rose-500/35 bg-rose-500/15 text-rose-200",
  neutral: "border-white/15 bg-white/5 text-muted-foreground",
  watched: "border-purple-400/40 bg-purple-500/20 text-purple-200 shadow-glow",
};

export function Badge({ variant = "neutral", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide backdrop-blur-sm",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}