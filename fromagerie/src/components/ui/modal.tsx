import { useEffect, type ReactNode } from "react";
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
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <button type="button" className="absolute inset-0 z-0 cursor-default" aria-label="Fermer la fenêtre" onClick={() => onOpenChange(false)} />
      <div role="dialog" aria-modal="true" aria-label={title || "Fenêtre"} className="relative z-[10001] flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#e2dacb] bg-[#fcfbfa] text-[#2c2825] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e2dacb]/40 bg-[#f5f2eb]/40 px-6 py-5">
          <div>
            {title && <h2 className="text-lg font-extrabold text-[#2c2825]">{title}</h2>}
            {description && <p className="mt-1 text-xs text-[#756b60]">{description}</p>}
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-[#f5f2eb] hover:text-[#2c2825]" aria-label="Fermer"><X className="size-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">{children}</div>
        {footer && <div className="shrink-0 border-t border-[#e2dacb]/60 bg-[#f5f2eb]/40 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
