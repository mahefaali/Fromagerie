import type { ReactNode } from "react";

export type FilterCardTone = "amber" | "sky" | "green" | "red";

const TONES: Record<FilterCardTone, { idle: string; active: string; iconIdle: string; iconActive: string }> = {
  amber: {
    idle: "border-amber-200/80 bg-amber-50/70 text-amber-950 hover:border-amber-400 hover:bg-amber-100/70",
    active: "border-amber-500 bg-amber-100 text-amber-950 ring-1 ring-amber-400/40",
    iconIdle: "bg-amber-200/70 text-amber-800",
    iconActive: "bg-amber-600 text-white",
  },
  sky: {
    idle: "border-sky-200/80 bg-sky-50/70 text-sky-950 hover:border-sky-400 hover:bg-sky-100/70",
    active: "border-sky-500 bg-sky-100 text-sky-950 ring-1 ring-sky-400/40",
    iconIdle: "bg-sky-200/70 text-sky-800",
    iconActive: "bg-sky-700 text-white",
  },
  green: {
    idle: "border-emerald-200/80 bg-emerald-50/70 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-100/70",
    active: "border-emerald-500 bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400/40",
    iconIdle: "bg-emerald-200/70 text-emerald-800",
    iconActive: "bg-emerald-700 text-white",
  },
  red: {
    idle: "border-red-200/80 bg-red-50/70 text-red-950 hover:border-red-400 hover:bg-red-100/70",
    active: "border-red-500 bg-red-100 text-red-950 ring-1 ring-red-400/40",
    iconIdle: "bg-red-200/70 text-red-800",
    iconActive: "bg-red-700 text-white",
  },
};

export function CompactFilterCard({ icon, label, value, tone, active, onClick }: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: FilterCardTone;
  active: boolean;
  onClick: () => void;
}) {
  const colors = TONES[tone];
  return <button type="button" aria-pressed={active} onClick={onClick} className={`flex min-h-12 min-w-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${active ? colors.active : colors.idle}`}>
    <span className={`grid size-7 shrink-0 place-items-center rounded-full [&_svg]:size-3.5 ${active ? colors.iconActive : colors.iconIdle}`}>{icon}</span>
    <span className="truncate text-xs font-semibold sm:text-sm">{label}</span>
    <span className="ml-auto text-base font-semibold">{value}</span>
  </button>;
}
