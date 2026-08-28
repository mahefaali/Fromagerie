import { useMemo, useState } from "react";
import { Beaker, FilePlus, History, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useAuth } from "../../authentication/hooks/useAuth";
import { useRecipes } from "../hooks/useRecipes";
import type { CreateRecetteRequest, CreateRecetteVersionRequest, RecetteDetail } from "../types/recipe.types";
import { HistoryDialog } from "./recipes/HistoryDialog";
import { RecipeDetails } from "./recipes/RecipeDetails";
import { RecipeFormDialog } from "./recipes/RecipeFormDialog";
import { RecipeVariants } from "./recipes/RecipeVariants";
import { VariantDetailsDialog } from "./recipes/VariantDetailsDialog";
import { requestErrorMessage } from "./recipes/recipe.utils";

export function RecipeManager() {
  const { user } = useAuth();
  const isOwner = user?.role === "PROPRIETAIRE";
  const {
    recipes, materials, cheeses, selectedId, selectedRecipe, isLoading, isLoadingDetail,
    error, detailError, isLoadingCatalog, catalogError, selectCheese, reloadSelectedRecipe,
    loadCatalog, loadReferenceData, createRecipe, createCheese, createMaterial, createVersion,
    loadHistory, loadRecipeDetail,
  } = useRecipes(isOwner);
  const [editOpen, setEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<RecetteDetail | null>(null);
  const [isLoadingEditTarget, setIsLoadingEditTarget] = useState(false);
  const [editTargetError, setEditTargetError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForCheeseId, setCreateForCheeseId] = useState<number | undefined>();
  const [createAsBase, setCreateAsBase] = useState(true);
  const [variantOpen, setVariantOpen] = useState(false);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [variantDetail, setVariantDetail] = useState<RecetteDetail | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [isLoadingVariant, setIsLoadingVariant] = useState(false);
  const catalogUnavailable = isLoadingCatalog || catalogError !== null;

  const cheeseOptions = useMemo(() => {
    const uniqueCheeses = new Map<number, string>();
    for (const recipe of recipes) {
      if (recipe.active && recipe.varianteKey.startsWith("legacy-") && !uniqueCheeses.has(recipe.fromageId)) {
        uniqueCheeses.set(recipe.fromageId, recipe.fromageNom);
      }
    }
    return Array.from(uniqueCheeses, ([id, nom]) => ({ id, nom }))
      .sort((first, second) => first.nom.localeCompare(second.nom, "fr"));
  }, [recipes]);
  const selectedListRecipe = recipes.find((recipe) => recipe.id === selectedId);
  const selectedCheeseId = selectedListRecipe?.fromageId ?? selectedRecipe?.fromageId ?? null;
  const variants = useMemo(
    () => recipes.filter((recipe) =>
      recipe.active && recipe.fromageId === selectedCheeseId && !recipe.varianteKey.startsWith("legacy-")),
    [recipes, selectedCheeseId],
  );
  const editableRecipes = useMemo(
    () => recipes
      .filter((recipe) => recipe.active && recipe.fromageId === selectedCheeseId)
      .sort((first, second) => {
        const firstIsBase = first.varianteKey.startsWith("legacy-");
        const secondIsBase = second.varianteKey.startsWith("legacy-");
        if (firstIsBase !== secondIsBase) return firstIsBase ? -1 : 1;
        return first.nom.localeCompare(second.nom, "fr");
      }),
    [recipes, selectedCheeseId],
  );

  const fetchVariantDetail = async (id: number): Promise<void> => {
    setIsLoadingVariant(true);
    setVariantError(null);
    try {
      setVariantDetail(await loadRecipeDetail(id));
    } catch (requestError: unknown) {
      setVariantDetail(null);
      setVariantError(requestErrorMessage(requestError));
    } finally {
      setIsLoadingVariant(false);
    }
  };

  const openVariant = (id: number): void => {
    setVariantId(id);
    setVariantDetail(null);
    setVariantOpen(true);
    void fetchVariantDetail(id);
  };

  const openCreateDialog = (fromageId?: number, recetteDeBase = fromageId === undefined): void => {
    setCreateForCheeseId(fromageId);
    setCreateAsBase(recetteDeBase);
    setCreateOpen(true);
  };

  const openEditDialog = (): void => {
    if (!selectedRecipe) return;
    setEditTarget(selectedRecipe);
    setEditTargetId(selectedRecipe.id);
    setEditTargetError(null);
    setEditOpen(true);
  };

  const selectEditTarget = async (id: number): Promise<void> => {
    setEditTargetId(id);
    setIsLoadingEditTarget(true);
    setEditTargetError(null);
    try {
      setEditTarget(await loadRecipeDetail(id));
    } catch (requestError: unknown) {
      setEditTargetError(requestErrorMessage(requestError));
    } finally {
      setIsLoadingEditTarget(false);
    }
  };

  const handleCreate = async (request: CreateRecetteRequest): Promise<void> => {
    const created = await createRecipe(request);
    setCreateOpen(false);
    toast.success(`Recette ${created.nom} créée en version 1.`);
  };

  const handleVersion = async (request: CreateRecetteVersionRequest): Promise<void> => {
    if (!editTarget) return;
    const created = await createVersion(editTarget.id, request);
    setEditOpen(false);
    toast.success(`Version ${created.version} de ${created.nom} créée.`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestion des recettes</h1>
          <p className="text-sm text-muted-foreground">Recettes des fromages, variantes, historique et coûts matière première.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-60 max-w-full">
            <Label htmlFor="cheese-select" className="text-xs text-muted-foreground">Type de fromage</Label>
            <Select
              value={selectedCheeseId === null ? "" : String(selectedCheeseId)}
              onValueChange={(value) => selectCheese(Number(value))}
              disabled={cheeseOptions.length === 0}
            >
              <SelectTrigger id="cheese-select" aria-label="Type de fromage"><SelectValue placeholder="Sélectionner un type de fromage" /></SelectTrigger>
              <SelectContent>
                {cheeseOptions.map((cheese) => <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.nom}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isOwner && <Button disabled={catalogUnavailable} onClick={() => openCreateDialog()}><FilePlus className="mr-1 size-4" /> Nouvelle recette</Button>}
        </div>
      </header>

      {isOwner && catalogError && (
        <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="font-medium">Les recettes restent consultables, mais le formulaire est indisponible.</p>
          <p className="mt-1 text-sm text-muted-foreground">{catalogError}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void loadReferenceData()}>
            <RefreshCw className="size-4" /> Recharger les référentiels
          </Button>
        </div>
      )}

      {isLoading ? (
        <StatusPanel message="Chargement des recettes..." />
      ) : error ? (
        <ErrorPanel title="Impossible de charger les recettes." message={error} onRetry={loadCatalog} />
      ) : recipes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Beaker className="mx-auto size-9 text-primary" />
          <p className="mt-4 font-medium">Aucune recette disponible.</p>
          {isOwner && <Button className="mt-4" disabled={catalogUnavailable} onClick={() => openCreateDialog()}><FilePlus className="size-4" /> Créer la première recette</Button>}
        </div>
      ) : isLoadingDetail ? (
        <StatusPanel message="Chargement du détail de la recette..." />
      ) : detailError ? (
        <ErrorPanel title="Impossible de charger le détail de la recette." message={detailError} onRetry={reloadSelectedRecipe} />
      ) : selectedRecipe ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Beaker className="size-5 text-primary" />{selectedRecipe.nom}</CardTitle>
              <CardDescription>
                {selectedRecipe.fromageNom} · version {selectedRecipe.version}
                {selectedRecipe.active ? " · version courante" : " · version historique"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}><History className="mr-1 size-4" /> Historique</Button>
              {isOwner && selectedRecipe.active && <Button size="sm" onClick={openEditDialog}><Pencil className="mr-1 size-4" /> Modifier</Button>}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="base">
              <TabsList>
                <TabsTrigger value="base">Recette de base</TabsTrigger>
                <TabsTrigger value="variants">Variantes <Badge variant="secondary" className="ml-2">{variants.length}</Badge></TabsTrigger>
              </TabsList>
              <TabsContent value="base" className="mt-4 min-h-[360px]">
                <RecipeDetails recipe={selectedRecipe} />
              </TabsContent>
              <TabsContent value="variants" className="mt-4 min-h-[360px]">
                <RecipeVariants
                  variants={variants}
                  resetKey={selectedId}
                  isOwner={isOwner}
                  catalogUnavailable={catalogUnavailable}
                  onAdd={() => openCreateDialog(selectedRecipe.fromageId)}
                  onView={openVariant}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Beaker className="mx-auto size-9 text-primary" />
          <p className="mt-4 font-medium">Aucune recette de base disponible.</p>
          <p className="mt-1 text-sm text-muted-foreground">Les variantes ne peuvent pas remplacer la recette de base.</p>
          {isOwner && <Button className="mt-4" disabled={catalogUnavailable} onClick={() => openCreateDialog()}><FilePlus className="size-4" /> Créer une recette de base</Button>}
        </div>
      )}

      {editOpen && editTarget && editTargetId !== null && (
        <RecipeFormDialog
          mode="version"
          open={editOpen}
          onOpenChange={setEditOpen}
          materials={materials}
          initialRecipe={editTarget}
          recipeOptions={editableRecipes}
          selectedRecipeId={editTargetId}
          isLoadingRecipe={isLoadingEditTarget}
          recipeLoadError={editTargetError}
          onSelectRecipe={selectEditTarget}
          onRetryRecipe={() => selectEditTarget(editTargetId)}
          onCreateVersion={handleVersion}
          onCreateMaterial={createMaterial}
        />
      )}
      {selectedRecipe && <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} recipeId={selectedRecipe.id} loadHistory={loadHistory} />}
      {createOpen && (
        <RecipeFormDialog
          key={`create-${createForCheeseId ?? "new"}`}
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          materials={materials}
          cheeses={cheeses}
          initialCheeseId={createForCheeseId}
          recetteDeBase={createAsBase}
          onCreate={handleCreate}
          onCreateCheese={createCheese}
          onCreateMaterial={createMaterial}
        />
      )}
      <VariantDetailsDialog
        open={variantOpen}
        onOpenChange={setVariantOpen}
        recipe={variantDetail}
        isLoading={isLoadingVariant}
        error={variantError}
        onRetry={variantId === null ? undefined : () => fetchVariantDetail(variantId)}
      />
    </div>
  );
}

function StatusPanel({ message }: { message: string }) {
  return <div role="status" aria-live="polite" className="rounded-xl border p-10 text-center text-sm text-muted-foreground">{message}</div>;
}

function ErrorPanel({ title, message, onRetry }: { title: string; message: string; onRetry: () => void | Promise<void> }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-4" onClick={() => void onRetry()}><RefreshCw className="size-4" /> Réessayer</Button>
    </div>
  );
}

export default RecipeManager;
