import { Calculator } from "lucide-react";

import type { RecetteDetail } from "../../types/recipe.types";
import { formatCurrency, formatNumber } from "./recipe.utils";

export function RecipeDetails({ recipe }: { recipe: RecetteDetail }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card/40 p-4">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Base de la formule</p>
          <p className="text-xs text-muted-foreground">Toutes les quantités d’ingrédients sont définies pour ce volume.</p>
        </div>
        <span className="text-sm font-semibold">{formatNumber(recipe.quantiteLaitReference)} L de lait</span>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Fréquence de retournement</p>
          <p className="text-xs text-muted-foreground">Utilisée pour planifier les actions d’affinage.</p>
        </div>
        <span className="text-sm font-semibold">
          {recipe.frequenceRetournementJours == null
            ? "Non définie"
            : `Tous les ${recipe.frequenceRetournementJours} jours`}
        </span>
      </div>
      <IngredientTable ingredients={recipe.ingredients} />
      <CostFooter amount={recipe.coutMatiereEstime} milkReferenceQuantity={recipe.quantiteLaitReference} />
    </div>
  );
}

export function IngredientTable({ ingredients }: { ingredients: RecetteDetail["ingredients"] }) {
  if (ingredients.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun ingrédient disponible.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[620px] text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr>
          <th className="px-4 py-2">Ingrédient</th><th className="px-4 py-2">Quantité</th><th className="px-4 py-2">Coût unitaire de référence</th><th className="px-4 py-2 text-right">Coût estimé</th>
        </tr></thead>
        <tbody>{ingredients.map((ingredient) => (
          <tr key={ingredient.id} className="border-t">
            <td className="px-4 py-2 font-medium">{ingredient.matierePremiereNom}</td>
            <td className="px-4 py-2">{formatNumber(ingredient.quantite)} {ingredient.unite}</td>
            <td className="px-4 py-2 text-muted-foreground">{formatCurrency(ingredient.coutUnitaireReference, 0, 4)} / {ingredient.unite}</td>
            <td className="px-4 py-2 text-right">{formatCurrency(ingredient.coutEstime)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function CostFooter({ amount, milkReferenceQuantity }: { amount: number; milkReferenceQuantity: number }) {
  return <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3"><div className="flex items-center gap-2 text-sm font-medium"><Calculator className="size-4 text-primary" />Coût estimé pour {formatNumber(milkReferenceQuantity)} L de lait</div><span className="text-lg font-semibold">{formatCurrency(amount)}</span></div>;
}
