import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RecetteDetail, RecetteListItem } from "../types/recipe.types";
import { useRecipes } from "./useRecipes";

const apiMocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  findMaterials: vi.fn(),
  findCheeses: vi.fn(),
  createCheese: vi.fn(),
  createMaterial: vi.fn(),
  create: vi.fn(),
  createVersion: vi.fn(),
  findHistory: vi.fn(),
}));

vi.mock("../api/recipeApi", () => ({ recipeApi: apiMocks }));

const recipe: RecetteListItem = {
  id: 10,
  nom: "Classique",
  varianteKey: "legacy-2",
  fromageId: 2,
  fromageNom: "Fromage des Hauts",
  version: 1,
  active: true,
  coutMatiereEstime: 73,
};

const detail: RecetteDetail = {
  ...recipe,
  dateCreation: "2026-08-25T10:00:00",
  ingredients: [],
};

beforeEach(() => {
  apiMocks.findAll.mockResolvedValue([recipe]);
  apiMocks.findById.mockResolvedValue(detail);
  apiMocks.findMaterials.mockResolvedValue([]);
  apiMocks.findCheeses.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useRecipes", () => {
  it("sélectionne la recette classique active plutôt qu’une variante ou une version historique", async () => {
    const historical = { ...recipe, id: 9, version: 1, active: false };
    const variant = {
      ...recipe,
      id: 11,
      nom: "Aux herbes",
      varianteKey: "5b4be7b6-4b8e-4f80-980f-f12ddc9e276c",
    };
    apiMocks.findAll.mockResolvedValue([historical, variant, recipe]);
    const { result } = renderHook(() => useRecipes(false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.selectedId).toBe(recipe.id));

    expect(apiMocks.findById).toHaveBeenCalledWith(recipe.id);
  });

  it("ne charge pas les référentiels d’édition pour le rôle FABRICATION", async () => {
    const { result } = renderHook(() => useRecipes(false));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.selectedRecipe).toEqual(detail));

    expect(apiMocks.findAll).toHaveBeenCalledOnce();
    expect(apiMocks.findMaterials).not.toHaveBeenCalled();
    expect(apiMocks.findCheeses).not.toHaveBeenCalled();
  });

  it("conserve les recettes si un référentiel propriétaire est refusé", async () => {
    apiMocks.findMaterials.mockRejectedValue(new Error("Accès refusé"));
    const { result } = renderHook(() => useRecipes(true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.isLoadingCatalog).toBe(false));

    expect(result.current.recipes).toEqual([recipe]);
    expect(result.current.error).toBeNull();
    expect(result.current.catalogError).toContain("Matières premières : Accès refusé");
  });

  it("ajoute le fromage créé au catalogue local", async () => {
    const createdCheese = { id: 8, nom: "Tomme fermière", description: "Pâte pressée" };
    apiMocks.findCheeses.mockResolvedValue([{ id: 2, nom: "Fromage des Hauts", description: null }]);
    apiMocks.createCheese.mockResolvedValue(createdCheese);
    const { result } = renderHook(() => useRecipes(true));

    await waitFor(() => expect(result.current.isLoadingCatalog).toBe(false));
    await result.current.createCheese({ nom: createdCheese.nom, description: createdCheese.description });

    await waitFor(() => expect(result.current.cheeses).toContainEqual(createdCheese));
    expect(apiMocks.createCheese).toHaveBeenCalledWith({
      nom: "Tomme fermière",
      description: "Pâte pressée",
    });
  });

  it("ajoute la matière première créée au catalogue local", async () => {
    const createdMaterial = {
      id: 9,
      nom: "Ferments lactiques",
      uniteReference: "G" as const,
      coutUnitaire: 4.5,
      actif: true,
    };
    apiMocks.createMaterial.mockResolvedValue(createdMaterial);
    const { result } = renderHook(() => useRecipes(true));

    await waitFor(() => expect(result.current.isLoadingCatalog).toBe(false));
    await result.current.createMaterial({
      nom: createdMaterial.nom,
      uniteReference: createdMaterial.uniteReference,
      coutUnitaire: createdMaterial.coutUnitaire,
      actif: true,
    });

    await waitFor(() => expect(result.current.materials).toContainEqual(createdMaterial));
  });
});
