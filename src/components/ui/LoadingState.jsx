import { cn } from "../../lib/utils";
import { IconReel } from "./icons";

export function LoadingState({ label = "Carregando...", fullscreen = false, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullscreen ? "min-h-[60vh]" : "py-16",
        className
      )}
    >
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-purple-600/25 blur-xl" aria-hidden />
        <div className="relative flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-purple-500/30 bg-gradient-to-br from-violet-600/40 to-purple-900/40 shadow-glow">
          <IconReel className="h-7 w-7 text-highlight" />
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" aria-hidden />
        {label}
      </div>
    </div>
  );
}