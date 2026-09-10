import { cn } from "../../lib/utils";

export function Card({ className, interactive = false, spotlight = false, children, ...props }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-card transition-all duration-300 ease-out",
        "shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]",
        interactive &&
          "hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_16px_48px_-16px_rgba(139,92,246,0.4),0_4px_24px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    >
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "radial-gradient(420px circle at 20% 0%, rgba(139,92,246,0.14), transparent 45%)",
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}