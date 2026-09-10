import { cn } from "../../lib/utils";
import { IconCheck } from "./icons";

export function Checkbox({ className, label, ...props }) {
  return (
    <label className={cn("inline-flex cursor-pointer select-none items-center gap-2.5", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-white/16 bg-white/[0.03] text-transparent transition-all duration-200",
          "peer-hover:border-purple-400/50",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500/40 peer-focus-visible:outline-none",
          "peer-checked:border-purple-500 peer-checked:bg-gradient-to-br peer-checked:from-purple-500 peer-checked:to-purple-700 peer-checked:text-white"
        )}
      >
        <IconCheck className="h-3 w-3" />
      </span>
      {label && <span className="text-sm text-secondary-foreground">{label}</span>}
    </label>
  );
}