import { Controller, useWatch } from "react-hook-form";

import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { Field, NumberField } from "./FormFields";
import type { FormStepProps } from "./fabricationFormStep.types";
import {
  boundedPositiveIntegerValidation,
  boundedPositiveValidation,
  calculateCheeseYield,
  cheeseYieldZone,
  MAX_NOMBRE_FROMAGES,
  MAX_POIDS_FROMAGES,
  MAX_QUANTITE_INGREDIENT,
  MAX_TEMPERATURE_MISE_EN_MOULE,
  MIN_TEMPERATURE_MISE_EN_MOULE,
  moldingTemperatureValidation,
  maximumCheeseCount,
  isExceptionallyLowCheeseCount,
  referenceTextValidation,
  validateDrainageDuration,
  validatePositiveInteger,
  validatePositiveNumber,
} from "./fabricationCreateForm.utils";

export function MoldingStep({ control, register, errors, getValues, trigger, fermentRecommendation, availableFerments, onFermentTypeChange, onFermentManualChange }: FormStepProps) {
  const selectedFerment = useWatch({ control, name: "typeFerments" });
  const normalize = (value: string): string => value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
  const format = (value: number): string => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 4 }).format(value);
  const selectedMaterial = availableFerments.find((material) => normalize(material.nom) === normalize(selectedFerment));
  const differentFerment = Boolean(fermentRecommendation
    && normalize(selectedFerment) !== normalize(fermentRecommendation.type));
  const comparableFerment = Boolean(differentFerment
    && selectedMaterial?.uniteReference === fermentRecommendation?.unit);
  const unit = fermentRecommendation?.unit === "ML" ? "mL" : fermentRecommendation?.unit;
  return <div className="grid gap-5 md:grid-cols-2">
    <Field label="Type de ferments" error={errors.typeFerments?.message} required htmlFor="typeFerments">
      {fermentRecommendation
        ? <Controller control={control} name="typeFerments" rules={referenceTextValidation} render={({ field }) => <Select value={field.value} onValueChange={(value) => { field.onChange(value); onFermentTypeChange(); }}><SelectTrigger id="typeFerments" className="min-h-12" aria-invalid={Boolean(errors.typeFerments)}><SelectValue placeholder="Choisir un ferment" /></SelectTrigger><SelectContent>{[fermentRecommendation.type, ...availableFerments.map((item) => item.nom)].filter((value, index, values) => values.indexOf(value) === index).map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select>} />
        : <Input id="typeFerments" className="min-h-12" placeholder="Ex. Ferments thermophiles" aria-invalid={Boolean(errors.typeFerments)} maxLength={255} {...register("typeFerments", referenceTextValidation)} />}
    </Field>
    <NumberField id="quantiteFerments" label="Quantité de ferments réellement utilisée" unit={unit} error={errors.quantiteFerments?.message} min={comparableFerment ? fermentRecommendation!.recommended * 0.1 : differentFerment ? 0 : fermentRecommendation?.minimum ?? 0} max={comparableFerment ? fermentRecommendation!.recommended * 3 : differentFerment ? MAX_QUANTITE_INGREDIENT : fermentRecommendation?.maximum ?? MAX_QUANTITE_INGREDIENT} registration={register("quantiteFerments", {
      ...boundedPositiveValidation(MAX_QUANTITE_INGREDIENT),
      onChange: onFermentManualChange,
      validate: (value: string) => {
        const positiveResult = validatePositiveNumber(value, MAX_QUANTITE_INGREDIENT);
        if (positiveResult !== true) return positiveResult;
        if (!fermentRecommendation) return true;
        const quantity = Number(value);
        if (!differentFerment) {
          return (quantity >= fermentRecommendation.minimum && quantity <= fermentRecommendation.maximum)
            || `La recette recommande ${format(fermentRecommendation.recommended)} ${unit} de ferment. Pour cette fabrication, la quantité autorisée est comprise entre ${format(fermentRecommendation.minimum)} et ${format(fermentRecommendation.maximum)} ${unit} (±40 %).`;
        }
        if (!comparableFerment) return true;
        const absoluteMinimum = fermentRecommendation.recommended * 0.1;
        const absoluteMaximum = fermentRecommendation.recommended * 3;
        return (quantity >= absoluteMinimum && quantity <= absoluteMaximum)
          || `La quantité de ferment doit être comprise entre ${format(absoluteMinimum)} et ${format(absoluteMaximum)} ${unit} pour un ferment différent comparable.`;
      },
    })} />
    {fermentRecommendation && <div className={`rounded-2xl border p-4 text-sm md:col-span-2 ${differentFerment ? "border-amber-400 bg-amber-50 text-amber-950" : "border-[#d8d0bd] bg-[#f7f3e9]"}`}>
      <p><span className="font-semibold">Référence recette :</span> {fermentRecommendation.type} — {format(fermentRecommendation.recommended)} {unit}</p>
      {differentFerment
        ? <><p className="mt-1 font-semibold">Attention : la recette recommande « {fermentRecommendation.type} », mais vous avez sélectionné « {selectedFerment} ». Vérifiez que ce changement correspond bien au ferment réellement utilisé.</p>{comparableFerment ? <p className="mt-1 text-amber-800">Plage indicative : {format(fermentRecommendation.recommended * 0.2)}–{format(fermentRecommendation.recommended * 2)} {unit}</p> : <p className="mt-1 text-amber-800">Les unités ou dosages ne sont pas directement comparables : aucune conversion automatique n’est appliquée.</p>}</>
        : <p className="mt-1 text-muted-foreground">Plage autorisée : {format(fermentRecommendation.minimum)}–{format(fermentRecommendation.maximum)} {unit} (±40 %)</p>}
    </div>}
    <NumberField id="temperatureMiseEnMoule" label="Température de mise en moule" unit="°C" error={errors.temperatureMiseEnMoule?.message} min={MIN_TEMPERATURE_MISE_EN_MOULE} max={MAX_TEMPERATURE_MISE_EN_MOULE} registration={register("temperatureMiseEnMoule", moldingTemperatureValidation)} />
    <Field label="Durée d'égouttage" error={errors.dureeEgouttageMinutes?.message} required htmlFor="dureeEgouttageMinutes">
      <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-2">
        <Input
          id="dureeEgouttageMinutes"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="min-h-12 rounded-2xl border border-[#c8bea9] bg-white px-4 text-base"
          aria-invalid={Boolean(errors.dureeEgouttageMinutes)}
          {...register("dureeEgouttageMinutes", {
            required: "Ce champ est obligatoire.",
            validate: (value) => validateDrainageDuration(String(value), getValues("dureeEgouttageUnite")),
          })}
        />
        <Controller control={control} name="dureeEgouttageUnite" render={({ field }) => (
          <Select value={field.value} onValueChange={(value: "MINUTES" | "HEURES") => {
            field.onChange(value);
            queueMicrotask(() => { void trigger("dureeEgouttageMinutes"); });
          }}>
            <SelectTrigger aria-label="Unité de durée d'égouttage" className="min-h-12 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MINUTES">minutes</SelectItem>
              <SelectItem value="HEURES">heures</SelectItem>
            </SelectContent>
          </Select>
        )} />
      </div>
    </Field>
  </div>;
}

export function OutputStep({ control, register, errors, getValues }: FormStepProps) {
  const milkQuantity = useWatch({ control, name: "quantiteLait" });
  const cheeseCount = useWatch({ control, name: "nombreFromages" });
  const cheeseWeight = useWatch({ control, name: "poidsTotalFromages" });
  const maximum = maximumCheeseCount(milkQuantity);
  const showLowWarning = isExceptionallyLowCheeseCount(cheeseCount, milkQuantity);
  const yieldPercent = calculateCheeseYield(cheeseWeight, milkQuantity);
  const yieldZone = cheeseYieldZone(cheeseWeight, milkQuantity);
  const validWeight = Number(cheeseWeight) > 0 && Number.isFinite(yieldPercent);
  const averageWeight = Number(cheeseWeight) / Number(cheeseCount);
  const format = (value: number): string => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
  return <div className="grid gap-5 md:grid-cols-2">
    <NumberField id="poidsTotalFromages" label="Poids total à la sortie du moule" unit="kg" error={errors.poidsTotalFromages?.message} min={Number(milkQuantity) * 0.01} max={Number(milkQuantity) * 0.7}
      registration={register("poidsTotalFromages", { ...boundedPositiveValidation(MAX_POIDS_FROMAGES), validate: (value: string) => {
        const validation = validatePositiveNumber(value, MAX_POIDS_FROMAGES);
        if (validation !== true) return validation;
        return cheeseYieldZone(value, getValues("quantiteLait")) !== "INVALID"
          || "Le poids total des fromages saisi est manifestement incohérent avec la quantité de lait utilisée.";
      } })} />
    <NumberField id="nombreFromages" label="Nombre de fromages produits" step="1" min={1} max={maximum} error={errors.nombreFromages?.message} registration={register("nombreFromages", {
      ...boundedPositiveIntegerValidation(MAX_NOMBRE_FROMAGES),
      validate: (value: string) => {
        const integerResult = validatePositiveInteger(value, MAX_NOMBRE_FROMAGES);
        if (integerResult !== true) return integerResult;
        return Number(value) <= maximum
          || `Le nombre de fromages produits ne peut pas dépasser ${maximum} pour cette quantité de lait.`;
      },
    })} />
    {showLowWarning ? <p role="status" className="rounded-2xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950 md:col-span-2">
      Le nombre de fromages produits paraît très faible pour {milkQuantity} L de lait utilisés. Vérifiez la saisie. Si cette quantité correspond réellement à la fabrication, vous pouvez la confirmer.
    </p> : null}
    {validWeight ? <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm md:col-span-2">
      <p>Rendement estimé : <span className="font-semibold">{format(yieldPercent)} %</span></p>
      {yieldZone === "LOW" ? <p className="mt-2 text-amber-800">Le rendement paraît anormalement faible. Vérifiez le poids total saisi. Si cette valeur correspond réellement à la fabrication, vous pouvez la confirmer.</p> : null}
      {yieldZone === "HIGH" ? <p className="mt-2 text-amber-800">Le rendement paraît anormalement élevé. Vérifiez le poids total saisi. Si cette valeur correspond réellement à la fabrication, vous pouvez la confirmer.</p> : null}
      {Number.isFinite(averageWeight) && averageWeight > 0 ? <p className="mt-1 text-muted-foreground">Poids moyen indicatif : {format(averageWeight)} kg/fromage</p> : null}
    </div> : null}
    <Field label="Observations" error={errors.observations?.message} className="md:col-span-2" htmlFor="observations">
      <Textarea id="observations" className="min-h-28 text-base" placeholder="Observations facultatives sur cette fabrication" {...register("observations")} />
    </Field>
  </div>;
}
