import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-foreground transition-[border-color,box-shadow,background-color] duration-200",
        "placeholder:text-muted-foreground/70",
        "hover:border-white/15",
        "focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/25 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});