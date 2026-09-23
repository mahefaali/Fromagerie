import { RecipeManagerDialogs } from "./recipes/RecipeManagerDialogs";
import { RecipeManagerView } from "./recipes/RecipeManagerView";
import { useRecipeManager } from "./recipes/useRecipeManager";

export function RecipeManager() {
  const manager = useRecipeManager();

  return <div className="mx-auto min-h-[calc(100vh-7.5rem)] w-full max-w-[1440px] space-y-5 py-3 sm:py-5">
    <RecipeManagerView manager={manager} />
    <RecipeManagerDialogs manager={manager} />
  </div>;
}

export default RecipeManager;
