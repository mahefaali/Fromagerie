import { HistoryDialog } from "./HistoryDialog";
import { RecipeFormDialog } from "./RecipeFormDialog";
import { VariantDetailsDialog } from "./VariantDetailsDialog";
import type { RecipeManagerState } from "./useRecipeManager";

export function RecipeManagerDialogs({ manager }: { manager: RecipeManagerState }) {
  const retryEditTarget = () => {
    if (manager.editTargetId !== null) void manager.selectEditTarget(manager.editTargetId);
  };
  const variantId = manager.variantId;
  const retryVariant = variantId === null ? undefined : () => manager.fetchVariantDetail(variantId);

  return <>
    {manager.editOpen && manager.editTarget && manager.editTargetId !== null && <RecipeFormDialog
      mode="version" open={manager.editOpen} onOpenChange={manager.setEditOpen} materials={manager.materials}
      initialRecipe={manager.editTarget} recipeOptions={manager.editableRecipes} selectedRecipeId={manager.editTargetId}
      isLoadingRecipe={manager.isLoadingEditTarget} recipeLoadError={manager.editTargetError} onSelectRecipe={manager.selectEditTarget}
      onRetryRecipe={retryEditTarget} onCreateVersion={manager.handleVersion} onCreateMaterial={manager.createMaterial}
    />}
    {manager.selectedRecipe && <HistoryDialog open={manager.historyOpen} onOpenChange={manager.setHistoryOpen} recipeId={manager.selectedRecipe.id} loadHistory={manager.loadHistory} />}
    {manager.createOpen && <RecipeFormDialog key={`create-${manager.createForCheeseId ?? "new"}`} mode="create" open={manager.createOpen}
      onOpenChange={manager.setCreateOpen} materials={manager.materials} cheeses={manager.cheeses} initialCheeseId={manager.createForCheeseId}
      recetteDeBase={manager.createAsBase} onCreate={manager.handleCreate} onCreateCheese={manager.createCheese} onCreateMaterial={manager.createMaterial} />}
    <VariantDetailsDialog open={manager.variantOpen} onOpenChange={manager.setVariantOpen} recipe={manager.variantDetail} isLoading={manager.isLoadingVariant}
      error={manager.variantError} onRetry={retryVariant} />
  </>;
}
