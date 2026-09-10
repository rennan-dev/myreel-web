import { cn } from "../../lib/utils";
import { IconGhost } from "./icons";

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center",
        className
      )}
    >
      <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl text-purple-300 shadow-glow">
        {icon || <IconGhost className="h-8 w-8" />}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}