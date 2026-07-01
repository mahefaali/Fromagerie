"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer le modal"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
          <div>
            {title ? <h2 className="text-xl font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border/70 bg-background p-2 text-muted-foreground transition hover:bg-accent"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer ? <div className="border-t border-border/70 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
