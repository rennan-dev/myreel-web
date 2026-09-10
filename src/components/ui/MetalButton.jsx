import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { MetalFx } from "metal-fx";

import { cn } from "../../lib/utils";
import { Button } from "./button";

const metalSurfaceVariants = cva("transition-[filter,transform] duration-200", {
  variants: {
    variant: {
      default:
        "bg-gradient-to-br! from-violet-500! via-purple-600! to-purple-800! text-white! hover:brightness-110! active:scale-[0.98]!",

      outline:
        "bg-white/[0.04]! text-foreground! hover:bg-purple-500/15! hover:text-white!",

      secondary:
        "bg-white/[0.04]! text-secondary-foreground! hover:bg-purple-500/15! hover:text-white!",

      ghost:
        "bg-transparent! text-muted-foreground! hover:bg-white/5! hover:text-foreground!",

      destructive:
        "bg-red-500/10! text-red-300! hover:bg-red-500/20! hover:text-red-200!",

      link: "bg-transparent! text-purple-300!",
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

const metalHostChromeReset =
  "border-0! bg-transparent! shadow-none! hover:bg-transparent! aria-expanded:bg-transparent! active:scale-100!";

const metalStableEdge =
  "relative isolate before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:ring-1 before:ring-white/10 before:ring-inset";

export const MetalButton = forwardRef(function MetalButton(
  {
    metalVariant = "button",
    metalFxClassName,
    metalFxStyle,

    preset = "chromatic",
    theme = "auto",
    strength = 0.9,

    paused,
    borderRadius,
    disableGlow,
    reflectionTargets,
    shaderScale,
    ringCssPx,
    scale,

    normalizeHostStyles = true,

    variant = "default",
    className,

    ...buttonProps
  },
  ref
) {
  return (
    <MetalFx
      borderRadius={borderRadius}
      className={cn(
        "overflow-visible! inline-flex w-fit min-w-0 flex-col items-stretch leading-none",
        metalStableEdge,
        normalizeHostStyles &&
          metalSurfaceVariants({
            variant,
          }),
        metalFxClassName
      )}
      disableGlow={disableGlow}
      normalizeHostStyles={normalizeHostStyles}
      paused={paused}
      preset={preset}
      ref={ref}
      reflectionTargets={reflectionTargets}
      ringCssPx={ringCssPx}
      scale={scale}
      shaderScale={shaderScale}
      strength={strength}
      style={metalFxStyle}
      theme={theme}
      variant={metalVariant}
    >
      <Button
        className={cn(
          normalizeHostStyles && metalHostChromeReset,
          className
        )}
        variant={variant}
        {...buttonProps}
      />
    </MetalFx>
  );
});

MetalButton.displayName = "MetalButton";

export const MetalIconButton = forwardRef(function MetalIconButton(
  {
    size = "icon-sm",
    metalVariant = "circle",
    className,
    ...props
  },
  ref
) {
  return (
    <MetalButton
      className={cn(
        "leading-none! [&_svg]:block [&_svg]:shrink-0",
        className
      )}
      metalVariant={metalVariant}
      ref={ref}
      size={size}
      {...props}
    />
  );
});

MetalIconButton.displayName = "MetalIconButton";