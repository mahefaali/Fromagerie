import { Plus, RefreshCw, X } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { NumericTextInput } from "../../../../components/ui/numeric-input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Separator } from "../../../../components/ui/separator";
import { Textarea } from "../../../../components/ui/textarea";
import type { RecipeFormDialogProps } from "./RecipeFormDialog";
import { IngredientEditor } from "./IngredientEditor";
import type { RecipeFormModel } from "./form/useRecipeForm";

export function RecipeFormContent({ props, form }: { props: RecipeFormDialogProps; form: RecipeFormModel }) {
  const {
    name, setName, turningFrequency, setTurningFrequency, milkReferenceQuantity,
    setMilkReferenceQuantity, cheeseId, setCheeseId, ingredients, setIngredients,
    formError, showCheeseForm, setShowCheeseForm, newCheeseName, setNewCheeseName,
    newCheeseDescription, setNewCheeseDescription, cheeseError, setCheeseError,
    isCreatingCheese, isSubmitting, submitCheese,
  } = form;

  return (
  <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
    {props.mode === "version" && (
      <div className="grid gap-2 rounded-2xl border border-[#D8C3A5]/70 bg-[#F7F3EC]/70 p-4">
        <Label htmlFor="recipe-edit-target">Recette à modifier</Label>
        <select
          id="recipe-edit-target"
          aria-label="Recette à modifier"
          value={String(props.selectedRecipeId)}
          onChange={(event) => void props.onSelectRecipe(Number(event.target.value))}
          disabled={props.isLoadingRecipe || isSubmitting}
          className="h-11 w-full rounded-xl border border-[#D8C3A5] bg-white px-3 text-sm outline-none focus-visible:border-[#C96A4A] focus-visible:ring-2 focus-visible:ring-[#C96A4A]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {props.recipeOptions.map((recipe) => (
            <option key={recipe.id} value={String(recipe.id)}>
              {recipe.nom} · {recipe.varianteKey.startsWith("legacy-") ? "Recette de base" : "Variante"}
            </option>
          ))}
        </select>
        {props.isLoadingRecipe && (
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            Chargement de la recette choisie...
          </p>
        )}
        {props.recipeLoadError && (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{props.recipeLoadError}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void props.onRetryRecipe()}>
              <RefreshCw className="size-4" /> Réessayer
            </Button>
          </div>
        )}
      </div>
    )}
    <div
      className={`space-y-5 ${props.mode === "version" && props.isLoadingRecipe ? "pointer-events-none opacity-50" : ""}`}
      aria-busy={props.mode === "version" && props.isLoadingRecipe}
    >
      {formError && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">{formError}</p>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="recipe-name">Nom de la recette</Label>
        <Input
          id="recipe-name"
          value={name}
          maxLength={150}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex. Classique ou Aux herbes"
          className="h-11 rounded-xl border-[#D8C3A5] bg-white"
        />
      </div>
      {props.mode === "create" && (
        <div className="grid gap-2">
          <Label htmlFor="recipe-cheese">Fromage</Label>
          <Select value={cheeseId === null ? "" : String(cheeseId)} onValueChange={(value) => setCheeseId(Number(value))}>
            <SelectTrigger id="recipe-cheese" aria-label="Fromage" className="h-11 rounded-xl border-[#D8C3A5] bg-white">
              <SelectValue placeholder="Sélectionner un fromage" />
            </SelectTrigger>
            <SelectContent>
              {props.cheeses.map((cheese) => (
                <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!showCheeseForm ? (
            <Button type="button" variant="outline" size="sm" className="w-fit rounded-full border-[#D8C3A5]" onClick={() => setShowCheeseForm(true)}>
              <Plus className="size-4" /> Ajouter un nouveau type de fromage
            </Button>
          ) : (
            <div className="mt-1 grid gap-3 rounded-2xl border border-[#D8C3A5]/70 bg-[#F7F3EC]/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Nouveau type de fromage</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fermer l’ajout du fromage"
                  disabled={isCreatingCheese}
                  onClick={() => {
                    setShowCheeseForm(false);
                    setCheeseError(null);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
              {cheeseError && <p role="alert" className="text-sm text-destructive">{cheeseError}</p>}
              <div className="grid gap-1">
                <Label htmlFor="new-cheese-name" className="text-xs">Nom du fromage</Label>
                <Input
                  id="new-cheese-name"
                  value={newCheeseName}
                  minLength={2}
                  maxLength={100}
                  disabled={isCreatingCheese}
                  onChange={(event) => setNewCheeseName(event.target.value)}
                  placeholder="Ex. Tomme fermière"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="new-cheese-description" className="text-xs">Description</Label>
                <Textarea
                  id="new-cheese-description"
                  value={newCheeseDescription}
                  maxLength={500}
                  disabled={isCreatingCheese}
                  onChange={(event) => setNewCheeseDescription(event.target.value)}
                  placeholder="Décrivez brièvement ce type de fromage"
                />
              </div>
              <Button type="button" size="sm" className="w-fit" disabled={isCreatingCheese} onClick={() => void submitCheese()}>
                {isCreatingCheese ? "Ajout en cours..." : "Ajouter et sélectionner"}
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="recipe-milk-reference">Quantité de lait de référence (L)</Label>
        <NumericTextInput
          id="recipe-milk-reference"
          min={0.0001}
          value={milkReferenceQuantity}
          onValueChange={setMilkReferenceQuantity}
          aria-describedby="recipe-milk-reference-help"
          className="h-11 rounded-xl border-[#D8C3A5] bg-white"
        />
        <p id="recipe-milk-reference-help" className="text-xs text-muted-foreground">
          Les quantités d’ingrédients ci-dessous sont prévues pour ce volume de lait. La référence recommandée est 100 L.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="recipe-turning-frequency">Fréquence de retournement (jours)</Label>
        <NumericTextInput
          id="recipe-turning-frequency"
          min={1}
          max={365}
          integer
          value={turningFrequency}
          onValueChange={setTurningFrequency}
          placeholder="Ex. 3"
          aria-describedby="recipe-turning-frequency-help"
          className="h-11 rounded-xl border-[#D8C3A5] bg-white"
        />
        <p id="recipe-turning-frequency-help" className="text-xs text-muted-foreground">
          Laissez vide si aucun retournement périodique n’est requis. Cette fréquence alimentera les alertes d’affinage.
        </p>
      </div>
      <Separator className="bg-[#D8C3A5]/70" />
      <div className="rounded-2xl bg-[#F7F3EC]/70 px-4 py-3">
        <h4 className="text-sm font-semibold text-[#2F383C]">Ingrédients</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          L’unité est imposée par la matière première et le coût sera calculé par le serveur.
        </p>
      </div>
      <IngredientEditor
        ingredients={ingredients}
        materials={props.materials}
        onChange={setIngredients}
        onCreateMaterial={props.onCreateMaterial}
      />
    </div>
  </div>
  );
}
