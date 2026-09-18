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
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl border border-[#D8C3A5]/80 bg-[#FFFDF9] p-0 shadow-[0_24px_80px_rgba(63,74,79,0.24)]">
        <DialogHeader className="shrink-0 border-b border-[#D8C3A5]/60 bg-[#F7F3EC]/70 px-6 py-5 pr-14 sm:px-8 sm:py-6 sm:pr-16">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#C96A4A]/10 text-[#C96A4A] ring-1 ring-[#C96A4A]/15">
              {isCreateMode ? <FilePlus className="size-5" /> : <Plus className="size-5" />}
            </span>
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A45D3F]">
                {isCreateMode ? "Création" : "Nouvelle version"}
              </p>
              <DialogTitle className="text-xl font-semibold tracking-tight text-[#2F383C] sm:text-2xl">
                {isCreateMode ? "Nouvelle recette" : "Modifier la recette"}
              </DialogTitle>
              <DialogDescription className="max-w-xl leading-relaxed text-[#756B60]">
                {isCreateMode
                  ? "Définissez le fromage et les quantités exactes de ses ingrédients."
                  : "Les changements créeront une nouvelle version sans modifier l’historique."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <RecipeFormContent props={props} form={form} />
        <DialogFooter className="shrink-0 gap-2 border-t border-[#D8C3A5]/60 bg-[#F7F3EC]/70 px-6 py-4 sm:px-8">
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={isSubmitting || isCreatingCheese}
            className="min-h-11 rounded-full border-[#D8C3A5] bg-white px-5 text-[#4A443D] hover:bg-[#F7F3EC]"
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
            className="min-h-11 rounded-full bg-[#C96A4A] px-6 text-white shadow-sm hover:bg-[#B85E40]"
          >
            {isCreateMode ? <FilePlus className="size-4" /> : <Plus className="size-4" />}
            {isSubmitting ? "Enregistrement..." : isCreateMode ? "Créer la recette" : "Enregistrer la révision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
