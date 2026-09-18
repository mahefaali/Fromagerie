import { RecipeManagerDialogs } from "./recipes/RecipeManagerDialogs";
import { RecipeManagerView } from "./recipes/RecipeManagerView";
import { useRecipeManager } from "./recipes/useRecipeManager";

export function RecipeManager() {
  const manager = useRecipeManager();

  return <div className="min-h-[calc(100vh-7.5rem)] w-full space-y-6 py-4 sm:py-6">
    <RecipeManagerView manager={manager} />
    <RecipeManagerDialogs manager={manager} />
  </div>;
}

export default RecipeManager;
