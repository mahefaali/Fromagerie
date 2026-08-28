import type { OrigineLait } from "../types/fabrication.types";

export const ORIGINE_LAIT_LABELS: Record<OrigineLait, string> = {
  TRAITE_MATIN: "Traite du matin",
  TRAITE_SOIR: "Traite du soir",
  MELANGE: "Mélange",
};

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDateTime(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours} h` : `${hours} h ${remainingMinutes} min`;
}
