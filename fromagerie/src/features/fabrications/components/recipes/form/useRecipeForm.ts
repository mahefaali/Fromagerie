import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { RecetteIngredientRequest } from "../../../types/recipe.types";
import type { RecipeFormDialogProps } from "../RecipeFormDialog";
import { newIngredientDraft, requestErrorMessage, type IngredientDraft } from "../recipe.utils";

export function useRecipeForm(props: RecipeFormDialogProps) {
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


  return {
    name, setName, turningFrequency, setTurningFrequency, milkReferenceQuantity,
    setMilkReferenceQuantity, cheeseId, setCheeseId, ingredients, setIngredients,
    formError, isSubmitting, showCheeseForm, setShowCheeseForm, newCheeseName,
    setNewCheeseName, newCheeseDescription, setNewCheeseDescription, cheeseError,
    setCheeseError, isCreatingCheese, submitCheese, submit,
  };
}

export type RecipeFormModel = ReturnType<typeof useRecipeForm>;
