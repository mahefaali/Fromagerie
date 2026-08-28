import { useEffect, useEffectEvent, useState } from "react";

import { recipeApi } from "../api/recipeApi";
import type {
  CreateFromageRequest,
  CreateMatierePremiereRequest,
  CreateRecetteRequest,
  CreateRecetteVersionRequest,
  FromageOption,
  MatierePremiere,
  RecetteDetail,
  RecetteHistoryItem,
  RecetteListItem,
} from "../types/recipe.types";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function findBaseRecipe(
  recipes: RecetteListItem[],
  fromageId?: number,
): RecetteListItem | null {
  const activeRecipes = recipes.filter((recipe) =>
    recipe.active
    && recipe.varianteKey.startsWith("legacy-")
    && (fromageId === undefined || recipe.fromageId === fromageId));

  return activeRecipes[0] ?? null;
}

export function useRecipes(loadFormCatalog: boolean) {
  const [recipes, setRecipes] = useState<RecetteListItem[]>([]);
  const [materials, setMaterials] = useState<MatierePremiere[]>([]);
  const [cheeses, setCheeses] = useState<FromageOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecetteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailReloadKey, setDetailReloadKey] = useState(0);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const loadReferenceData = async (): Promise<void> => {
    if (!loadFormCatalog) {
      setMaterials([]);
      setCheeses([]);
      setCatalogError(null);
      return;
    }

    setIsLoadingCatalog(true);
    setCatalogError(null);
    const [materialsResult, cheesesResult] = await Promise.allSettled([
      recipeApi.findMaterials(),
      recipeApi.findCheeses(),
    ]);
    const errors: string[] = [];

    if (materialsResult.status === "fulfilled") {
      setMaterials(materialsResult.value);
    } else {
      setMaterials([]);
      errors.push(`Matières premières : ${errorMessage(materialsResult.reason, "chargement impossible")}`);
    }

    if (cheesesResult.status === "fulfilled") {
      setCheeses(cheesesResult.value);
    } else {
      setCheeses([]);
      errors.push(`Fromages : ${errorMessage(cheesesResult.reason, "chargement impossible")}`);
    }

    setCatalogError(errors.length > 0 ? errors.join(" ") : null);
    setIsLoadingCatalog(false);
  };

  const loadCatalog = async (preferredId?: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedRecipes = await recipeApi.findAll();
      setRecipes(loadedRecipes);
      setSelectedId((currentId) => {
        const candidate = preferredId ?? currentId;
        const candidateRecipe = loadedRecipes.find((recipe) =>
          recipe.id === candidate && recipe.active);

        return findBaseRecipe(loadedRecipes, candidateRecipe?.fromageId)?.id ?? null;
      });
    } catch (requestError: unknown) {
      setError(errorMessage(requestError, "Chargement des recettes impossible."));
    } finally {
      setIsLoading(false);
    }
  };

  const initialize = useEffectEvent(() => {
    void loadCatalog();
    void loadReferenceData();
  });

  useEffect(() => {
    initialize();
  }, [loadFormCatalog]);

  useEffect(() => {
    if (selectedId === null) {
      setSelectedRecipe(null);
      setDetailError(null);
      return;
    }

    let active = true;
    setIsLoadingDetail(true);
    setDetailError(null);
    void recipeApi.findById(selectedId)
      .then((detail) => {
        if (active) setSelectedRecipe(detail);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setSelectedRecipe(null);
          setDetailError(errorMessage(requestError, "Chargement du détail impossible."));
        }
      })
      .finally(() => {
        if (active) setIsLoadingDetail(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId, detailReloadKey]);

  const createRecipe = async (request: CreateRecetteRequest): Promise<RecetteDetail> => {
    const created = await recipeApi.create(request);
    setSelectedRecipe(created);
    await loadCatalog(created.id);
    return created;
  };

  const createCheese = async (request: CreateFromageRequest): Promise<FromageOption> => {
    const created = await recipeApi.createCheese(request);
    setCheeses((currentCheeses) => [...currentCheeses, created].sort((first, second) =>
      first.nom.localeCompare(second.nom, "fr")));
    return created;
  };

  const createMaterial = async (request: CreateMatierePremiereRequest): Promise<MatierePremiere> => {
    const created = await recipeApi.createMaterial(request);
    setMaterials((currentMaterials) => [...currentMaterials, created].sort((first, second) =>
      first.nom.localeCompare(second.nom, "fr")));
    return created;
  };

  const createVersion = async (
    id: number,
    request: CreateRecetteVersionRequest,
  ): Promise<RecetteDetail> => {
    const created = await recipeApi.createVersion(id, request);
    setSelectedRecipe(created);
    await loadCatalog(created.id);
    return created;
  };

  const loadHistory = (id: number): Promise<RecetteHistoryItem[]> =>
    recipeApi.findHistory(id);

  const loadRecipeDetail = (id: number): Promise<RecetteDetail> =>
    recipeApi.findById(id);

  const selectCheese = (fromageId: number): void => {
    setSelectedId(findBaseRecipe(recipes, fromageId)?.id ?? null);
  };

  return {
    recipes,
    materials,
    cheeses,
    selectedId,
    selectedRecipe,
    isLoading,
    isLoadingDetail,
    error,
    detailError,
    isLoadingCatalog,
    catalogError,
    selectCheese,
    reloadSelectedRecipe: () => setDetailReloadKey((key) => key + 1),
    loadCatalog,
    loadReferenceData,
    createRecipe,
    createCheese,
    createMaterial,
    createVersion,
    loadHistory,
    loadRecipeDetail,
  };
}
