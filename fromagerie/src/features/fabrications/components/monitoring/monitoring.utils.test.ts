import { describe, expect, it } from "vitest";

import type { RecetteOption } from "../../types/fabrication.types";
import {
  baselineLabel,
  directionLabel,
  filterRecipesByCheese,
  parameterLabel,
  uniqueCheeses,
} from "./monitoring.utils";

const recipes: RecetteOption[] = [
  { id: 3, nom: "Bêta", varianteKey: "b", fromageId: 2, fromageNom: "Tomme", version: 1, active: true, coutMatiereEstime: 10 },
  { id: 1, nom: "Alpha", varianteKey: "a", fromageId: 1, fromageNom: "Brie", version: 1, active: true, coutMatiereEstime: 8 },
  { id: 2, nom: "Autre", varianteKey: "c", fromageId: 1, fromageNom: "Brie", version: 1, active: true, coutMatiereEstime: 9 },
];

describe("monitoring.utils", () => {
  it("déduplique et trie les fromages", () => {
    expect(uniqueCheeses(recipes)).toEqual([
      { id: 1, name: "Brie" },
      { id: 2, name: "Tomme" },
    ]);
  });

  it("filtre les recettes uniquement lorsqu'un fromage est sélectionné", () => {
    expect(filterRecipesByCheese(recipes)).toBe(recipes);
    expect(filterRecipesByCheese(recipes, 1).map((recipe) => recipe.id)).toEqual([1, 2]);
  });

  it("traduit les valeurs métier affichées", () => {
    expect(parameterLabel("RENDEMENT")).toBe("Rendement");
    expect(directionLabel("HAUTE")).toBe("haute");
    expect(baselineLabel("MEME_RECETTE")).toBe("Même recette");
    expect(baselineLabel("INCONNUE")).toBe("INCONNUE");
  });
});
