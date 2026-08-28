import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import type { CreateMatierePremiereRequest, MatierePremiere, UniteMesure } from "../../types/recipe.types";
import { newIngredientDraft, requestErrorMessage, type IngredientDraft } from "./recipe.utils";

const unitOptions: { value: UniteMesure; label: string }[] = [
  { value: "L", label: "Litre (L)" },
  { value: "ML", label: "Millilitre (ml)" },
  { value: "KG", label: "Kilogramme (kg)" },
  { value: "G", label: "Gramme (g)" },
  { value: "UNITE", label: "Unité" },
];

interface IngredientEditorProps {
  ingredients: IngredientDraft[];
  materials: MatierePremiere[];
  onChange: (ingredients: IngredientDraft[]) => void;
  onCreateMaterial: (request: CreateMatierePremiereRequest) => Promise<MatierePremiere>;
}

export function IngredientEditor({ ingredients, materials, onChange, onCreateMaterial }: IngredientEditorProps) {
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [materialUnit, setMaterialUnit] = useState<UniteMesure | "">("");
  const [unitCost, setUnitCost] = useState("");
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);
  const update = (localId: number, patch: Partial<IngredientDraft>) => onChange(ingredients.map((ingredient) => ingredient.localId === localId ? { ...ingredient, ...patch } : ingredient));

  const submitMaterial = async (): Promise<void> => {
    const trimmedName = materialName.trim();
    const parsedCost = Number(unitCost);
    setMaterialError(null);
    if (!trimmedName || trimmedName.length > 120) {
      setMaterialError("Le nom de la matière est obligatoire et limité à 120 caractères.");
      return;
    }
    if (!materialUnit) {
      setMaterialError("L’unité de référence est obligatoire.");
      return;
    }
    if (unitCost.trim() === "" || !Number.isFinite(parsedCost) || parsedCost < 0) {
      setMaterialError("Le coût unitaire doit être un nombre positif ou nul.");
      return;
    }

    setIsCreatingMaterial(true);
    try {
      const created = await onCreateMaterial({
        nom: trimmedName,
        uniteReference: materialUnit,
        coutUnitaire: parsedCost,
        actif: true,
      });
      const emptyDraft = ingredients.find((ingredient) => ingredient.matierePremiereId === null && !ingredient.quantite);
      onChange(emptyDraft
        ? ingredients.map((ingredient) => ingredient.localId === emptyDraft.localId ? { ...ingredient, matierePremiereId: created.id } : ingredient)
        : [...ingredients, newIngredientDraft(created.id)]);
      setShowMaterialForm(false);
      setMaterialName("");
      setMaterialUnit("");
      setUnitCost("");
      toast.success(`Ingrédient ${created.nom} ajouté.`);
    } catch (error: unknown) {
      setMaterialError(requestErrorMessage(error));
    } finally {
      setIsCreatingMaterial(false);
    }
  };

  return (
    <div className="space-y-3">
      {materials.length === 0 && <p className="text-sm text-muted-foreground">Aucune matière première disponible. Ajoutez le premier ingrédient ci-dessous.</p>}
      {ingredients.map((ingredient) => {
        const material = materials.find((item) => item.id === ingredient.matierePremiereId);
        return (
          <div key={ingredient.localId} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_120px_70px_40px] sm:items-end">
            <div className="grid gap-1"><Label htmlFor={`material-${ingredient.localId}`} className="text-xs">Matière première</Label><Select value={ingredient.matierePremiereId === null ? "" : String(ingredient.matierePremiereId)} onValueChange={(value) => update(ingredient.localId, { matierePremiereId: Number(value) })}><SelectTrigger id={`material-${ingredient.localId}`} aria-label="Matière première"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{materials.map((item) => <SelectItem key={item.id} value={String(item.id)} disabled={!item.actif}>{item.nom}{item.actif ? "" : " (inactive)"}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-1"><Label htmlFor={`quantity-${ingredient.localId}`} className="text-xs">Quantité</Label><Input id={`quantity-${ingredient.localId}`} type="number" min="0" step="0.0001" value={ingredient.quantite} onChange={(event) => update(ingredient.localId, { quantite: event.target.value })} /></div>
            <div className="pb-2 text-xs text-muted-foreground">{material?.uniteReference ?? "Unité"}</div>
            <Button type="button" variant="ghost" size="icon" aria-label="Retirer l’ingrédient" onClick={() => onChange(ingredients.filter((item) => item.localId !== ingredient.localId))}><Trash2 className="size-4" /></Button>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        {materials.length > 0 && <Button type="button" variant="outline" size="sm" onClick={() => onChange([...ingredients, newIngredientDraft()])}><Plus className="size-4" /> Ajouter un ingrédient existant</Button>}
        {!showMaterialForm && <Button type="button" variant="outline" size="sm" onClick={() => setShowMaterialForm(true)}><Plus className="size-4" /> Créer un nouvel ingrédient</Button>}
      </div>
      {showMaterialForm && (
        <div className="grid gap-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Nouvelle matière première</p>
            <Button type="button" variant="ghost" size="icon" aria-label="Fermer l’ajout de l’ingrédient" disabled={isCreatingMaterial} onClick={() => { setShowMaterialForm(false); setMaterialError(null); }}><X className="size-4" /></Button>
          </div>
          {materialError && <p role="alert" className="text-sm text-destructive">{materialError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1"><Label htmlFor="new-material-name" className="text-xs">Nom de l’ingrédient</Label><Input id="new-material-name" value={materialName} maxLength={120} disabled={isCreatingMaterial} onChange={(event) => setMaterialName(event.target.value)} placeholder="Ex. Ferments lactiques" /></div>
            <div className="grid gap-1">
              <Label htmlFor="new-material-unit" className="text-xs">Unité de référence</Label>
              <select
                id="new-material-unit"
                value={materialUnit}
                disabled={isCreatingMaterial}
                onChange={(event) => setMaterialUnit(event.target.value as UniteMesure | "")}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sélectionner une unité</option>
                {unitOptions.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid max-w-xs gap-1"><Label htmlFor="new-material-cost" className="text-xs">Coût unitaire de référence (€)</Label><Input id="new-material-cost" type="number" min="0" step="0.0001" value={unitCost} disabled={isCreatingMaterial} onChange={(event) => setUnitCost(event.target.value)} placeholder="0,00" /></div>
          <p className="text-xs text-muted-foreground">Cette valeur servira au serveur pour calculer le coût estimé de la recette.</p>
          <Button type="button" size="sm" className="w-fit" disabled={isCreatingMaterial} onClick={() => void submitMaterial()}>{isCreatingMaterial ? "Ajout en cours..." : "Ajouter à la recette"}</Button>
        </div>
      )}
    </div>
  );
}
