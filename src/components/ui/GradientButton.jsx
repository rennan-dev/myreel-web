import { forwardRef } from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

/**
 * Botão sólido com a mesma aparência do antigo MetalButton (gradiente
 * violeta/roxo + anel interno branco/10 como "borda", brilho no hover e
 * escala no clique), porém renderizado instantaneamente — sem canvas WebGL,
 * que às vezes demorava (ou falhava) a aparecer.
 */
export const GradientButton = forwardRef(function GradientButton(
  { className, variant = "default", ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      className={cn(
        "from-violet-500! via-purple-600! to-purple-800! hover:brightness-110! ring-1 ring-inset ring-white/10",
        className
      )}
      {...props}
    />
  );
});

GradientButton.displayName = "GradientButton";
