import { RefreshCw } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import type { RecetteDetail } from "../../types/recipe.types";
import { RecipeDetails } from "./RecipeDetails";

interface VariantDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: RecetteDetail | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void | Promise<void>;
}

export function VariantDetailsDialog({
  open,
  onOpenChange,
  recipe,
  isLoading,
  error,
  onRetry,
}: VariantDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{recipe?.nom ?? "Détail de la variante"}</DialogTitle>
          <DialogDescription>
            {recipe
              ? `${recipe.fromageNom} · version ${recipe.version}`
              : "Consultation des ingrédients et du coût de la variante."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          {isLoading ? (
            <p role="status" aria-live="polite" className="py-8 text-center text-sm text-muted-foreground">Chargement de la variante...</p>
          ) : error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
              {onRetry && <Button variant="outline" size="sm" className="mt-3" onClick={() => void onRetry()}><RefreshCw className="size-4" /> Réessayer</Button>}
            </div>
          ) : recipe ? (
            <RecipeDetails recipe={recipe} />
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
