import { HttpError } from "../../../../services/http/apiClient";

export interface IngredientDraft {
  localId: number;
  matierePremiereId: number | null;
  quantite: string;
}

let nextIngredientId = 1;

export function newIngredientDraft(
  matierePremiereId: number | null = null,
  quantite = "",
): IngredientDraft {
  return { localId: nextIngredientId++, matierePremiereId, quantite };
}

export function formatNumber(
  value: number,
  minimumFractionDigits = 0,
  maximumFractionDigits = 4,
): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function formatCurrency(
  value: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string {
  return `${formatNumber(value, minimumFractionDigits, maximumFractionDigits)} €`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function requestErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.validationErrors) {
    return Object.values(error.validationErrors).join(" ");
  }
  return error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
}
