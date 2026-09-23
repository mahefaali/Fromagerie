import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function PaginationControls({ page, pageCount, onPageChange, label = "Pagination", className }: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  return <nav aria-label={label} className={`flex w-fit items-center justify-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm [&_button]:size-8 [&_button]:rounded-lg [&_span]:px-1 [&_span]:text-xs [&_span]:font-medium ${className ?? ""}`}>
    <Button type="button" variant="outline" size="icon" aria-label="Page précédente" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="size-4" /></Button>
    <span className="text-sm font-medium">Page {page} sur {pageCount}</span>
    <Button type="button" variant="outline" size="icon" aria-label="Page suivante" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}><ChevronRight className="size-4" /></Button>
  </nav>;
}
