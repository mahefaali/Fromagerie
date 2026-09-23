import type { LucideIcon } from "lucide-react";

export interface FloatingSubnavigationItem<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface FloatingSubnavigationProps<T extends string> {
  value: T;
  items: readonly FloatingSubnavigationItem<T>[];
  onValueChange: (value: T) => void;
  ariaLabel?: string;
}

export function FloatingSubnavigation<T extends string>({
  value,
  items,
  onValueChange,
  ariaLabel = "Sous-navigation",
}: FloatingSubnavigationProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex h-auto w-max min-w-full items-center justify-start gap-0.5 bg-transparent p-0 sm:min-w-0 sm:gap-1"
    >
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={`flex h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-0 px-3 text-xs font-semibold shadow-none transition-colors sm:h-10 sm:px-4 ${active
              ? "bg-[#355B12] text-white shadow-sm"
              : "text-[#302B24] hover:bg-[#F2EBDD] hover:text-[#355B12]"}`}
          >
            {Icon && <Icon className="size-3.5" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
