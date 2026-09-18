import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../../../authentication/hooks/useAuth";
import { useRecipes } from "../../hooks/useRecipes";
import type { CreateRecetteRequest, CreateRecetteVersionRequest, RecetteDetail } from "../../types/recipe.types";
import { requestErrorMessage } from "./recipe.utils";

export function useRecipeManager() {
  const { user } = useAuth();
  const isOwner = user?.role === "PROPRIETAIRE";
  const recipesState = useRecipes(isOwner);
  const { recipes, selectedId, selectedRecipe, loadRecipeDetail, createRecipe, createVersion } = recipesState;
  const [editOpen, setEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<RecetteDetail | null>(null);
  const [isLoadingEditTarget, setIsLoadingEditTarget] = useState(false);
  const [editTargetError, setEditTargetError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForCheeseId, setCreateForCheeseId] = useState<number>();
  const [createAsBase, setCreateAsBase] = useState(true);
  const [variantOpen, setVariantOpen] = useState(false);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [variantDetail, setVariantDetail] = useState<RecetteDetail | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [isLoadingVariant, setIsLoadingVariant] = useState(false);

  const cheeseOptions = useMemo(() => {
    const cheeses = new Map<number, string>();
    recipes.forEach((recipe) => {
      if (recipe.active && recipe.varianteKey.startsWith("legacy-") && !cheeses.has(recipe.fromageId)) cheeses.set(recipe.fromageId, recipe.fromageNom);
    });
    return Array.from(cheeses, ([id, nom]) => ({ id, nom })).sort((first, second) => first.nom.localeCompare(second.nom, "fr"));
  }, [recipes]);

  const selectedListRecipe = recipes.find((recipe) => recipe.id === selectedId);
  const selectedCheeseId = selectedListRecipe?.fromageId ?? selectedRecipe?.fromageId ?? null;
  const variants = useMemo(() => recipes.filter((recipe) => recipe.active && recipe.fromageId === selectedCheeseId && !recipe.varianteKey.startsWith("legacy-")), [recipes, selectedCheeseId]);
  const editableRecipes = useMemo(() => recipes.filter((recipe) => recipe.active && recipe.fromageId === selectedCheeseId).sort((first, second) => {
    const firstIsBase = first.varianteKey.startsWith("legacy-");
    const secondIsBase = second.varianteKey.startsWith("legacy-");
    return firstIsBase !== secondIsBase ? (firstIsBase ? -1 : 1) : first.nom.localeCompare(second.nom, "fr");
  }), [recipes, selectedCheeseId]);

  const fetchVariantDetail = async (id: number) => {
    setIsLoadingVariant(true);
    setVariantError(null);
    try { setVariantDetail(await loadRecipeDetail(id)); }
    catch (error: unknown) { setVariantDetail(null); setVariantError(requestErrorMessage(error)); }
    finally { setIsLoadingVariant(false); }
  };

  const openVariant = (id: number) => {
    setVariantId(id);
    setVariantDetail(null);
    setVariantOpen(true);
    void fetchVariantDetail(id);
  };

  const openCreateDialog = (fromageId?: number, recetteDeBase = fromageId === undefined) => {
    setCreateForCheeseId(fromageId);
    setCreateAsBase(recetteDeBase);
    setCreateOpen(true);
  };

  const openEditDialog = () => {
    if (!selectedRecipe) return;
    setEditTarget(selectedRecipe);
    setEditTargetId(selectedRecipe.id);
    setEditTargetError(null);
    setEditOpen(true);
  };

  const selectEditTarget = async (id: number) => {
    setEditTargetId(id);
    setIsLoadingEditTarget(true);
    setEditTargetError(null);
    try { setEditTarget(await loadRecipeDetail(id)); }
    catch (error: unknown) { setEditTargetError(requestErrorMessage(error)); }
    finally { setIsLoadingEditTarget(false); }
  };

  const handleCreate = async (request: CreateRecetteRequest) => {
    const created = await createRecipe(request);
    setCreateOpen(false);
    toast.success(`Recette ${created.nom} créée en version 1.`);
  };

  const handleVersion = async (request: CreateRecetteVersionRequest) => {
    if (!editTarget) return;
    const created = await createVersion(editTarget.id, request);
    setEditOpen(false);
    toast.success(`Version ${created.version} de ${created.nom} créée.`);
  };

  return {
    ...recipesState, isOwner, catalogUnavailable: recipesState.isLoadingCatalog || recipesState.catalogError !== null,
    cheeseOptions, selectedCheeseId, variants, editableRecipes,
    editOpen, setEditOpen, editTargetId, editTarget, isLoadingEditTarget, editTargetError,
    historyOpen, setHistoryOpen, createOpen, setCreateOpen, createForCheeseId, createAsBase,
    variantOpen, setVariantOpen, variantId, variantDetail, variantError, isLoadingVariant,
    openVariant, openCreateDialog, openEditDialog, selectEditTarget, fetchVariantDetail, handleCreate, handleVersion,
  };
}

export type RecipeManagerState = ReturnType<typeof useRecipeManager>;
