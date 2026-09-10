import { useCallback } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { cn } from "../../lib/utils";
import { IconX } from "./icons";

const SIZES = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, size = "md", className, children }) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleOpenChange = useCallback((next) => {
    if (!next) {
      onClose?.();}
  }, [onClose]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[3px] transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed inset-0 z-50 m-auto flex h-max max-h-[85vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d15] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85),0_0_64px_-24px_rgba(139,92,246,0.35)] transition-all duration-200 ease-out focus:outline-none",
            "data-[starting-style]:translate-y-3 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
            "data-[ending-style]:translate-y-3 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0",
            SIZES[size],
            className
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent"
          />
          {(title || description) && (
            <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <Dialog.Title className="truncate text-lg font-bold tracking-tight text-foreground">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                onClick={handleClose}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
              >
                <IconX className="h-4 w-4" />
              </Dialog.Close>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}