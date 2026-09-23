import type { ReactNode } from "react";

import { cn } from "../../utils/utils";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

interface AppDialogContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AppDialogContent({ title, description, children, footer, className }: AppDialogContentProps) {
  return (
    <DialogContent
      overlayClassName="bg-black/50 backdrop-blur-xs"
      className={cn("flex max-h-[85vh] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border border-[#e2dacb] bg-[#fcfbfa] p-0 text-[#2c2825] shadow-2xl sm:rounded-2xl", className)}
    >
      <DialogHeader className="shrink-0 border-b border-[#e2dacb]/40 p-5 pr-14 text-left sm:p-6 sm:pr-14">
        <DialogTitle className="text-lg font-extrabold leading-tight text-[#2c2825]">{title}</DialogTitle>
        {description && <DialogDescription className="text-xs text-gray-500">{description}</DialogDescription>}
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      {footer && <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#e2dacb]/60 bg-[#f5f2eb]/40 p-4 sm:p-5">{footer}</div>}
    </DialogContent>
  );
}
