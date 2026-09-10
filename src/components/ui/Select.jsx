import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/[0.03] pl-3.5 pr-9 text-sm text-foreground transition-[border-color,box-shadow] duration-200",
          "hover:border-white/15",
          "focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/25 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});