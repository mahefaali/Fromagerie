import { useEffect, useState } from "react";
import { FilePlus, Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Separator } from "../../../../components/ui/separator";
import { Textarea } from "../../../../components/ui/textarea";
import type {
  CreateFromageRequest,
  CreateMatierePremiereRequest,
  CreateRecetteRequest,
  CreateRecetteVersionRequest,
  FromageOption,
  MatierePremiere,
  RecetteDetail,
  RecetteIngredientRequest,
  RecetteListItem,
} from "../../types/recipe.types";
import { IngredientEditor } from "./IngredientEditor";
import { newIngredientDraft, requestErrorMessage, type IngredientDraft } from "./recipe.utils";

type RecipeFormDialogProps = {
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
  const initialRecipe = props.mode === "version" ? props.initialRecipe : null;
  const [name, setName] = useState(initialRecipe?.nom ?? "");
  const [turningFrequency, setTurningFrequency] = useState(
    initialRecipe?.frequenceRetournementJours == null ? "" : String(initialRecipe.frequenceRetournementJours),
  );
  const [milkReferenceQuantity, setMilkReferenceQuantity] = useState(
    String(initialRecipe?.quantiteLaitReference ?? 100),
  );
  const [cheeseId, setCheeseId] = useState<number | null>(
    props.mode === "create" ? props.initialCheeseId ?? null : initialRecipe?.fromageId ?? null,
  );
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() => initialRecipe
    ? initialRecipe.ingredients.map((ingredient) =>
        newIngredientDraft(ingredient.matierePremiereId, String(ingredient.quantite)))
    : [newIngredientDraft(props.materials.find((material) => material.actif)?.id ?? null)]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheeseForm, setShowCheeseForm] = useState(false);
  const [newCheeseName, setNewCheeseName] = useState("");
  const [newCheeseDescription, setNewCheeseDescription] = useState("");
  const [cheeseError, setCheeseError] = useState<string | null>(null);
  const [isCreatingCheese, setIsCreatingCheese] = useState(false);

  useEffect(() => {
    if (!initialRecipe) return;
    setName(initialRecipe.nom);
    setTurningFrequency(initialRecipe.frequenceRetournementJours == null ? "" : String(initialRecipe.frequenceRetournementJours));
    setMilkReferenceQuantity(String(initialRecipe.quantiteLaitReference));
    setCheeseId(initialRecipe.fromageId);
    setIngredients(initialRecipe.ingredients.map((ingredient) =>
      newIngredientDraft(ingredient.matierePremiereId, String(ingredient.quantite))));
    setFormError(null);
  }, [initialRecipe]);

  const submitCheese = async (): Promise<void> => {
    if (props.mode !== "create") return;
    const trimmedName = newCheeseName.trim();
    const trimmedDescription = newCheeseDescription.trim();
    setCheeseError(null);
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setCheeseError("Le nom du fromage doit contenir entre 2 et 100 caractères.");
      return;
    }
    if (!trimmedDescription) {
      setCheeseError("La description du fromage est obligatoire.");
      return;
    }
    if (trimmedDescription.length > 500) {
      setCheeseError("La description ne peut pas dépasser 500 caractères.");
      return;
    }

    setIsCreatingCheese(true);
    try {
      const created = await props.onCreateCheese({ nom: trimmedName, description: trimmedDescription });
      setCheeseId(created.id);
      setShowCheeseForm(false);
      setNewCheeseName("");
      setNewCheeseDescription("");
      toast.success(`Type de fromage ${created.nom} ajouté.`);
    } catch (error: unknown) {
      setCheeseError(requestErrorMessage(error));
    } finally {
      setIsCreatingCheese(false);
    }
  };

  const buildIngredients = (): RecetteIngredientRequest[] | null => {
    if (ingredients.length === 0) {
      setFormError("Ajoutez au moins un ingrédient.");
      return null;
    }
    const selectedIds = new Set<number>();
    const requestIngredients: RecetteIngredientRequest[] = [];
    for (const ingredient of ingredients) {
      const material = props.materials.find((item) => item.id === ingredient.matierePremiereId);
      const quantity = Number(ingredient.quantite);
      if (!material) {
        setFormError("Sélectionnez une matière première pour chaque ingrédient.");
        return null;
      }
      if (!material.actif) {
        setFormError(`La matière première ${material.nom} est inactive.`);
        return null;
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setFormError("Chaque quantité doit être strictement positive.");
        return null;
      }
      if (selectedIds.has(material.id)) {
        setFormError("Une matière première ne peut apparaître qu’une fois dans la recette.");
        return null;
      }
      selectedIds.add(material.id);
      requestIngredients.push({
        matierePremiereId: material.id,
        quantite: quantity,
        unite: material.uniteReference,
      });
    }
    return requestIngredients;
  };

  const submit = async (): Promise<void> => {
    setFormError(null);
    if (!name.trim()) {
      setFormError("Le nom de la recette est obligatoire.");
      return;
    }
    if (name.trim().length > 150) {
      setFormError("Le nom ne peut pas dépasser 150 caractères.");
      return;
    }
    if (props.mode === "create" && cheeseId === null) {
      setFormError("Le fromage est obligatoire.");
      return;
    }
    const parsedMilkReferenceQuantity = Number(milkReferenceQuantity);
    if (!Number.isFinite(parsedMilkReferenceQuantity) || parsedMilkReferenceQuantity <= 0) {
      setFormError("La quantité de lait de référence doit être strictement positive.");
      return;
    }
    const parsedTurningFrequency = turningFrequency.trim() === "" ? null : Number(turningFrequency);
    if (parsedTurningFrequency !== null && (!Number.isInteger(parsedTurningFrequency) || parsedTurningFrequency < 1 || parsedTurningFrequency > 365)) {
      setFormError("La fréquence de retournement doit être un nombre entier compris entre 1 et 365 jours.");
      return;
    }
    const requestIngredients = buildIngredients();
    if (!requestIngredients) return;
    const turningFrequencyPayload = parsedTurningFrequency === null
      ? {}
      : { frequenceRetournementJours: parsedTurningFrequency };
    setIsSubmitting(true);
    try {
      if (props.mode === "create") {
        await props.onCreate({
          nom: name.trim(),
          fromageId: cheeseId!,
          recetteDeBase: props.recetteDeBase,
          quantiteLaitReference: parsedMilkReferenceQuantity,
          ...turningFrequencyPayload,
          ingredients: requestIngredients,
        });
      } else {
        await props.onCreateVersion({
          nom: name.trim(),
          quantiteLaitReference: parsedMilkReferenceQuantity,
          ...turningFrequencyPayload,
          ingredients: requestIngredients,
        });
      }
    } catch (error: unknown) {
      setFormError(requestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>{props.mode === "create" ? "Nouvelle recette" : "Modifier la recette"}</DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Définissez le fromage et les quantités exactes de ses ingrédients."
              : "Les changements créeront une nouvelle version sans modifier l’historique."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-4">
          {props.mode === "version" && (
            <div className="grid gap-2 rounded-lg border bg-muted/20 p-3">
              <Label htmlFor="recipe-edit-target">Recette à modifier</Label>
              <select
                id="recipe-edit-target"
                aria-label="Recette à modifier"
                value={String(props.selectedRecipeId)}
                onChange={(event) => void props.onSelectRecipe(Number(event.target.value))}
                disabled={props.isLoadingRecipe || isSubmitting}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
            className={props.mode === "version" && props.isLoadingRecipe ? "pointer-events-none opacity-50" : "contents"}
            aria-busy={props.mode === "version" && props.isLoadingRecipe}
          >
            {formError && (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                {formError}
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
              />
            </div>
            {props.mode === "create" && (
              <div className="grid gap-2">
                <Label htmlFor="recipe-cheese">Fromage</Label>
                <Select value={cheeseId === null ? "" : String(cheeseId)} onValueChange={(value) => setCheeseId(Number(value))}>
                  <SelectTrigger id="recipe-cheese" aria-label="Fromage">
                    <SelectValue placeholder="Sélectionner un fromage" />
                  </SelectTrigger>
                  <SelectContent>
                    {props.cheeses.map((cheese) => (
                      <SelectItem key={cheese.id} value={String(cheese.id)}>{cheese.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!showCheeseForm ? (
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setShowCheeseForm(true)}>
                    <Plus className="size-4" /> Ajouter un nouveau type de fromage
                  </Button>
                ) : (
                  <div className="mt-1 grid gap-3 rounded-xl border bg-muted/30 p-4">
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
              <Input
                id="recipe-milk-reference"
                type="number"
                min={0.0001}
                step="any"
                value={milkReferenceQuantity}
                onChange={(event) => setMilkReferenceQuantity(event.target.value)}
                aria-describedby="recipe-milk-reference-help"
              />
              <p id="recipe-milk-reference-help" className="text-xs text-muted-foreground">
                Les quantités d’ingrédients ci-dessous sont prévues pour ce volume de lait. La référence recommandée est 100 L.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipe-turning-frequency">Fréquence de retournement (jours)</Label>
              <Input
                id="recipe-turning-frequency"
                type="number"
                min={1}
                max={365}
                step={1}
                value={turningFrequency}
                onChange={(event) => setTurningFrequency(event.target.value)}
                placeholder="Ex. 3"
                aria-describedby="recipe-turning-frequency-help"
              />
              <p id="recipe-turning-frequency-help" className="text-xs text-muted-foreground">
                Laissez vide si aucun retournement périodique n’est requis. Cette fréquence alimentera les alertes d’affinage.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium">Ingrédients</h4>
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
        <DialogFooter className="shrink-0">
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={isSubmitting || isCreatingCheese}
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
          >
            {props.mode === "create" ? <FilePlus className="size-4" /> : <Plus className="size-4" />}
            {isSubmitting ? "Enregistrement..." : props.mode === "create" ? "Créer la recette" : "Enregistrer la révision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
