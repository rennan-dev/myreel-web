import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.55)] hover:from-violet-400 hover:via-purple-500 hover:to-purple-600 hover:shadow-[0_8px_32px_-8px_rgba(139,92,246,0.7)]",

        outline:
          "border border-white/10 bg-transparent text-foreground hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white",

        secondary:
          "border border-white/10 bg-white/[0.04] text-secondary-foreground hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white",

        ghost: "bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground",

        destructive:
          "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200",

        link: "text-purple-300 underline-offset-4 hover:underline",
      },

      size: {
        default: "h-10 px-4",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-[0.8rem]",
        lg: "h-11 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      {...props}
    />
  );
}

export { Button };