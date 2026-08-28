import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import type { RecetteListItem } from "../../types/recipe.types";
import { formatCurrency } from "./recipe.utils";

interface RecipeVariantsProps {
  variants: RecetteListItem[];
  resetKey: number | null;
  isOwner: boolean;
  catalogUnavailable: boolean;
  onAdd: () => void;
  onView: (id: number) => void;
}

const variantsPerPage = 2;

export function RecipeVariants({
  variants,
  resetKey,
  isOwner,
  catalogUnavailable,
  onAdd,
  onView,
}: RecipeVariantsProps) {
  const [activeVariantPage, setActiveVariantPage] = useState(0);
  const totalVariantPages = Math.max(1, Math.ceil(variants.length / variantsPerPage));
  const visibleVariants = variants.slice(
    activeVariantPage * variantsPerPage,
    (activeVariantPage + 1) * variantsPerPage,
  );

  useEffect(() => setActiveVariantPage(0), [resetKey]);

  return (
    <div className="min-h-[320px] rounded-xl border bg-card/40 p-4">
      {variants.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground">Aucune variante.</p>
          {isOwner && <AddVariantButton disabled={catalogUnavailable} onClick={onAdd} />}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleVariants.map((variant) => (
            <VariantCard key={variant.id} variant={variant} onView={() => onView(variant.id)} />
          ))}
          {isOwner && <AddVariantButton disabled={catalogUnavailable} onClick={onAdd} />}
        </div>
      )}
      {variants.length > variantsPerPage && (
        <div className="mt-4 flex justify-end gap-1">
          {Array.from({ length: totalVariantPages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveVariantPage(index)}
              className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${index === activeVariantPage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              aria-label={`Afficher la page de variantes ${index + 1}`}
            >{index + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddVariantButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return <Button variant="outline" size="sm" className="mt-4" disabled={disabled} onClick={onClick}><Plus className="size-4" /> Ajouter une variante</Button>;
}

function VariantCard({ variant, onView }: { variant: RecetteListItem; onView: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-medium">{variant.nom}</h4><p className="text-sm text-muted-foreground">Version {variant.version}</p></div><Badge variant="outline">Coût {formatCurrency(variant.coutMatiereEstime)}</Badge></div>
      <Separator className="my-3" /><Button variant="outline" size="sm" onClick={onView}>Voir la variante</Button>
    </div>
  );
}
