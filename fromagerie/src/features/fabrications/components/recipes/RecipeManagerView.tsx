import { Beaker, FilePlus, History, Pencil, RefreshCw } from "lucide-react";

import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { RecipeDetails } from "./RecipeDetails";
import { RecipeVariants } from "./RecipeVariants";
import type { RecipeManagerState } from "./useRecipeManager";

export function RecipeManagerView({ manager }: { manager: RecipeManagerState }) {
  return <>
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-semibold tracking-tight">Gestion des recettes</h1><p className="text-sm text-muted-foreground">Recettes des fromages, variantes, historique et coûts matière première.</p></div>
      <div className="flex flex-wrap items-end gap-2"><div className="w-60 max-w-full">
        <Label htmlFor="cheese-select" className="text-xs text-muted-foreground">Type de fromage</Label>
        <Select value={manager.selectedCheeseId === null ? "" : String(manager.selectedCheeseId)} onValueChange={(value) => manager.selectCheese(Number(value))} disabled={manager.cheeseOptions.length === 0}>
          <SelectTrigger id="cheese-select" aria-label="Type de fromage"><SelectValue placeholder="Sélectionner un type de fromage" /></SelectTrigger>
          <SelectContent>{manager.cheeseOptions.map((cheese) => <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.nom}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {manager.isOwner && <Button className="rounded-full" disabled={manager.catalogUnavailable} onClick={() => manager.openCreateDialog()}><FilePlus className="mr-1 size-4" /> Nouvelle recette</Button>}
      </div>
    </header>

    {manager.isOwner && manager.catalogError && <CatalogWarning manager={manager} />}
    <RecipeContent manager={manager} />
  </>;
}

function RecipeContent({ manager }: { manager: RecipeManagerState }) {
  if (manager.isLoading) return <StatusPanel message="Chargement des recettes..." />;
  if (manager.error) return <ErrorPanel title="Impossible de charger les recettes." message={manager.error} onRetry={manager.loadCatalog} />;
  if (manager.recipes.length === 0) return <EmptyRecipes manager={manager} />;
  if (manager.isLoadingDetail) return <StatusPanel message="Chargement du détail de la recette..." />;
  if (manager.detailError) return <ErrorPanel title="Impossible de charger le détail de la recette." message={manager.detailError} onRetry={manager.reloadSelectedRecipe} />;
  if (!manager.selectedRecipe) return <MissingBaseRecipe manager={manager} />;

  const recipe = manager.selectedRecipe;
  return <Card><CardHeader className="flex flex-row items-start justify-between gap-4">
    <div><CardTitle className="flex items-center gap-2"><Beaker className="size-5 text-primary" />{recipe.nom}</CardTitle>
      <CardDescription>{recipe.fromageNom} · version {recipe.version}{recipe.active ? " · version courante" : " · version historique"}</CardDescription></div>
    <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" className="rounded-full" onClick={() => manager.setHistoryOpen(true)}><History className="mr-1 size-4" /> Historique</Button>
      {manager.isOwner && recipe.active && <Button size="sm" className="rounded-full" onClick={manager.openEditDialog}><Pencil className="mr-1 size-4" /> Modifier</Button>}</div>
  </CardHeader><CardContent><Tabs defaultValue="base"><TabsList>
    <TabsTrigger value="base">Recette de base</TabsTrigger><TabsTrigger value="variants">Variantes <Badge variant="secondary" className="ml-2">{manager.variants.length}</Badge></TabsTrigger>
  </TabsList><TabsContent value="base" className="mt-4 min-h-[360px]"><RecipeDetails recipe={recipe} /></TabsContent>
  <TabsContent value="variants" className="mt-4 min-h-[360px]"><RecipeVariants variants={manager.variants} resetKey={manager.selectedId} isOwner={manager.isOwner} catalogUnavailable={manager.catalogUnavailable} onAdd={() => manager.openCreateDialog(recipe.fromageId)} onView={manager.openVariant} /></TabsContent>
  </Tabs></CardContent></Card>;
}

function CatalogWarning({ manager }: { manager: RecipeManagerState }) {
  return <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><p className="font-medium">Les recettes restent consultables, mais le formulaire est indisponible.</p>
    <p className="mt-1 text-sm text-muted-foreground">{manager.catalogError}</p><Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => void manager.loadReferenceData()}><RefreshCw className="size-4" /> Recharger les référentiels</Button></div>;
}

function EmptyRecipes({ manager }: { manager: RecipeManagerState }) {
  return <EmptyPanel message="Aucune recette disponible.">{manager.isOwner && <Button className="mt-4 rounded-full" disabled={manager.catalogUnavailable} onClick={() => manager.openCreateDialog()}><FilePlus className="size-4" /> Créer la première recette</Button>}</EmptyPanel>;
}

function MissingBaseRecipe({ manager }: { manager: RecipeManagerState }) {
  return <EmptyPanel message="Aucune recette de base disponible."><p className="mt-1 text-sm text-muted-foreground">Les variantes ne peuvent pas remplacer la recette de base.</p>{manager.isOwner && <Button className="mt-4 rounded-full" disabled={manager.catalogUnavailable} onClick={() => manager.openCreateDialog()}><FilePlus className="size-4" /> Créer une recette de base</Button>}</EmptyPanel>;
}

function EmptyPanel({ message, children }: { message: string; children?: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed p-10 text-center"><Beaker className="mx-auto size-9 text-primary" /><p className="mt-4 font-medium">{message}</p>{children}</div>;
}

function StatusPanel({ message }: { message: string }) {
  return <div role="status" aria-live="polite" className="rounded-xl border p-10 text-center text-sm text-muted-foreground">{message}</div>;
}

function ErrorPanel({ title, message, onRetry }: { title: string; message: string; onRetry: () => void | Promise<void> }) {
  return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{message}</p>
    <Button variant="outline" className="mt-4 rounded-full" onClick={() => void onRetry()}><RefreshCw className="size-4" /> Réessayer</Button></div>;
}
