import { FilePlus, Plus } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import type {
  CreateFromageRequest,
  CreateMatierePremiereRequest,
  CreateRecetteRequest,
  CreateRecetteVersionRequest,
  FromageOption,
  MatierePremiere,
  RecetteDetail,
  RecetteListItem,
} from "../../types/recipe.types";
import { useRecipeForm } from "./form/useRecipeForm";
import { RecipeFormContent } from "./RecipeFormContent";

export type RecipeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: MatierePremiere[];
  onCreateMaterial: (request: CreateMatierePremiereRequest) => Promise<MatierePremiere>;
} & (
  | {
      mode: "create";
      cheeses: FromageOption[];
      initialCheeseId?: number;
      recetteDeBase: boolean;
      onCreate: (request: CreateRecetteRequest) => Promise<void>;
      onCreateCheese: (request: CreateFromageRequest) => Promise<FromageOption>;
    }
  | {
      mode: "version";
      initialRecipe: RecetteDetail;
      recipeOptions: RecetteListItem[];
      selectedRecipeId: number;
      isLoadingRecipe: boolean;
      recipeLoadError: string | null;
      onSelectRecipe: (id: number) => void | Promise<void>;
      onRetryRecipe: () => void | Promise<void>;
      onCreateVersion: (request: CreateRecetteVersionRequest) => Promise<void>;
    }
);

export function RecipeFormDialog(props: RecipeFormDialogProps) {
  const form = useRecipeForm(props);
  const { isSubmitting, isCreatingCheese, submit } = form;
  const isCreateMode = props.mode === "create";

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="flex max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-[#e2dacb]/60 bg-[#f5f2eb]/40 px-6 py-5 pr-14 sm:px-8 sm:py-6 sm:pr-16">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#2d4a27]/10 text-[#2d4a27] ring-1 ring-[#2d4a27]/15">
              {isCreateMode ? <FilePlus className="size-5" /> : <Plus className="size-5" />}
            </span>
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2d4a27]">
                {isCreateMode ? "Création" : "Nouvelle version"}
              </p>
              <DialogTitle className="text-xl font-semibold tracking-tight text-[#2c2825] sm:text-2xl">
                {isCreateMode ? "Nouvelle recette" : "Modifier la recette"}
              </DialogTitle>
              <DialogDescription className="max-w-xl leading-relaxed">
                {isCreateMode
                  ? "Définissez le fromage et les quantités exactes de ses ingrédients."
                  : "Les changements créeront une nouvelle version sans modifier l’historique."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <RecipeFormContent props={props} form={form} />
        <DialogFooter className="shrink-0 gap-2 border-t border-[#e2dacb]/60 bg-[#f5f2eb]/40 px-6 py-4 sm:px-8">
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={isSubmitting || isCreatingCheese}
            className="min-h-11 rounded-xl border-[#e2dacb] bg-white px-5 text-[#2c2825] hover:bg-[#f5f2eb]"
          >
            Annuler
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={
              isSubmitting ||
              isCreatingCheese ||
              props.materials.length === 0 ||
              (props.mode === "version" && (props.isLoadingRecipe || props.recipeLoadError !== null))
            }
            className="min-h-11 rounded-xl bg-[#2d4a27] px-6 text-white shadow-sm hover:bg-[#233a1e]"
          >
            {isCreateMode ? <FilePlus className="size-4" /> : <Plus className="size-4" />}
            {isSubmitting ? "Enregistrement..." : isCreateMode ? "Créer la recette" : "Enregistrer la révision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
