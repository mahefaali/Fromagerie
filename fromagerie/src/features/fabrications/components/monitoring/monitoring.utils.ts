import type { AnomalyDirection, AnomalyParameter, RecetteOption } from "../../types/fabrication.types";

export interface CheeseOption {
  id: number;
  name: string;
}

export function uniqueCheeses(recipes: RecetteOption[]): CheeseOption[] {
  const cheeses = new Map<number, CheeseOption>();
  recipes.forEach((recipe) => cheeses.set(recipe.fromageId, { id: recipe.fromageId, name: recipe.fromageNom }));
  return [...cheeses.values()].sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

export function filterRecipesByCheese(recipes: RecetteOption[], fromageId?: number): RecetteOption[] {
  return fromageId === undefined ? recipes : recipes.filter((recipe) => recipe.fromageId === fromageId);
}

export function shortDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(value));
}

export function parameterLabel(parameter: AnomalyParameter): string {
  return parameter === "RENDEMENT" ? "Rendement" : "Température";
}

export function directionLabel(direction: AnomalyDirection): string {
  return direction === "BASSE" ? "basse" : "haute";
}

export function baselineLabel(value: string): string {
  const labels: Record<string, string> = {
    MEME_RECETTE_ET_SAISON: "Même recette et saison",
    MEME_RECETTE: "Même recette",
    MEME_FROMAGE_ET_SAISON: "Même fromage et saison",
    MEME_FROMAGE: "Même fromage",
  };
  return labels[value] ?? value;
}
