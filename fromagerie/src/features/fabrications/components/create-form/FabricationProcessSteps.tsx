import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { NumericTextInput } from "../../../../components/ui/numeric-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import type { OrigineLait } from "../../types/fabrication.types";
import { ORIGINE_LAIT_LABELS } from "../../utils/fabricationFormatters";
import { Field, NumberField } from "./FormFields";
import type { FormStepProps } from "./fabricationFormStep.types";
import {
  boundedPositiveValidation,
  isValidLocalDateTime,
  MAX_DUREE_CHAUFFAGE_MINUTES,
  MAX_QUANTITE_INGREDIENT,
  MAX_QUANTITE_LAIT,
  MAX_TEMPERATURE_CHAUFFAGE,
  MAX_TEMPERATURE_LAIT,
  MIN_TEMPERATURE_CHAUFFAGE,
  MIN_DUREE_CHAUFFAGE_MINUTES,
  MIN_TEMPERATURE_LAIT,
  heatingTemperatureValidation,
  heatingDurationValidation,
  milkTemperatureValidation,
  referenceTextValidation,
  validatePositiveNumber,
} from "./fabricationCreateForm.utils";

export function FabricationStartStep({
  control,
  register,
  errors,
  recettes,
  isLoadingRecettes,
  recettesError,
  onRetryRecettes,
}: FormStepProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field
        label="Recette"
        error={errors.recetteId?.message}
        required
        htmlFor="recetteId"
      >
        {isLoadingRecettes ? (
          <div
            role="status"
            className="flex min-h-12 items-center rounded-xl border px-3 text-sm text-muted-foreground"
          >
            Chargement des recettes...
          </div>
        ) : recettesError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm"
          >
            <p>{recettesError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onRetryRecettes}
            >
              <RefreshCw className="size-4" /> Réessayer
            </Button>
          </div>
        ) : recettes.length === 0 ? (
          <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
            Aucune recette associée à un fromage n'est disponible.
          </p>
        ) : (
          <Controller
            control={control}
            name="recetteId"
            rules={{ required: "Sélectionnez une recette." }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="recetteId"
                  className="min-h-12"
                  aria-invalid={Boolean(errors.recetteId)}
                >
                  <SelectValue placeholder="Choisir une recette" />
                </SelectTrigger>
                <SelectContent>
                  {recettes.map((recette) => (
                    <SelectItem key={recette.id} value={String(recette.id)}>
                      {recette.fromageNom} · {recette.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>
      <Field
        label="Début de fabrication"
        error={errors.dateHeureDebut?.message}
        required
        htmlFor="dateHeureDebut"
      >
        <Input
          id="dateHeureDebut"
          type="datetime-local"
          className="min-h-12"
          aria-invalid={Boolean(errors.dateHeureDebut)}
          {...register("dateHeureDebut", {
            required: "La date et l'heure sont obligatoires.",
            validate: (value) =>
              isValidLocalDateTime(value) ||
              "Saisissez une date et une heure valides.",
          })}
        />
      </Field>
    </div>
  );
}

export function MilkStep({
  control,
  register,
  errors,
  lotsLait,
  selectedMilkLotIds,
  milkUsages,
  onMilkLotChange,
  onAddMilkLot,
  onRemoveMilkLot,
  onMilkUsageChange,
  isEditing,
}: FormStepProps) {
  const total = Object.values(milkUsages).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {isEditing && (
        <NumberField
          id="quantiteLait"
          label="Quantité de lait"
          unit="L"
          error={errors.quantiteLait?.message}
          min={0}
          max={MAX_QUANTITE_LAIT}
          registration={register(
            "quantiteLait",
            boundedPositiveValidation(MAX_QUANTITE_LAIT),
          )}
        />
      )}
      <NumberField
        id="temperatureLait"
        label="Température du lait au début de la fabrication"
        unit="°C"
        error={errors.temperatureLait?.message}
        min={MIN_TEMPERATURE_LAIT}
        max={MAX_TEMPERATURE_LAIT}
        registration={register("temperatureLait", milkTemperatureValidation)}
      />
      {isEditing ? <Field label="Origine du lait" error={errors.origineLait?.message} required htmlFor="origineLait"><Controller
          control={control}
          name="origineLait"
          rules={{ required: "Sélectionnez l'origine du lait." }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="origineLait" className="min-h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(ORIGINE_LAIT_LABELS) as [OrigineLait, string][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        /></Field> : <Controller control={control} name="origineLait" render={({ field }) => <Field label="Origine du lait" htmlFor="origineLait"><div id="origineLait" className="flex min-h-12 items-center rounded-2xl border border-[#d8d0bd] bg-[#f7f3e9] px-4 text-sm font-medium" aria-live="polite">{selectedMilkLotIds.some(Boolean) ? ORIGINE_LAIT_LABELS[field.value] : "Déterminée après la sélection du lot"}</div></Field>} />}
      {!isEditing && (
        <div className="min-w-0 rounded-2xl border border-[#d8d0bd] bg-[#f7f3e9] p-3 sm:p-4 md:col-span-2">
          <div className="mb-3 flex flex-col items-start gap-1 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
            <p className="font-semibold">Lots de lait utilisés</p>
            <span className="whitespace-nowrap text-sm font-semibold text-[#28551c]">
              Total lait utilisé : {total} L
            </span>
          </div>
          {errors.quantiteLait?.message && !isEditing ? (
            <p role="alert" className="mb-3 text-sm text-destructive">
              {errors.quantiteLait.message}
            </p>
          ) : null}
          {lotsLait.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun lot de lait disponible.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedMilkLotIds.map((selectedId, index) => {
                const selectedLot = lotsLait.find(
                  (lot) => String(lot.id) === selectedId,
                );
                return (
                  <div
                    key={index}
                    className="grid min-w-0 items-start gap-3 rounded-xl border bg-white p-3 sm:grid-cols-[minmax(0,1fr)_190px_auto]"
                  >
                    <div className="min-w-0">
                      <label
                        className="mb-1.5 block text-sm font-medium"
                        htmlFor={`milk-lot-${index}`}
                      >
                        Lot de lait
                      </label>
                      <Select
                        value={selectedId}
                        onValueChange={(value) => onMilkLotChange(index, value)}
                      >
                        <SelectTrigger
                          id={`milk-lot-${index}`}
                          aria-label={`Lot de lait ${index + 1}`}
                          className="min-h-12"
                        >
                          <SelectValue placeholder="Choisir un lot existant" />
                        </SelectTrigger>
                        <SelectContent>
                          {lotsLait
                            .filter((lot) => lot.quantiteDisponible > 0)
                            .map((lot) => (
                              <SelectItem
                                key={lot.id}
                                value={String(lot.id)}
                                disabled={selectedMilkLotIds.some(
                                  (id, rowIndex) =>
                                    rowIndex !== index && id === String(lot.id),
                                )}
                              >
                                {lot.numeroLot} · {lot.quantiteDisponible} L
                                disponibles
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {selectedLot && (
                        <small className="mt-1 block text-muted-foreground">
                          Traite du{" "}
                          {new Date(selectedLot.dateTraite).toLocaleString(
                            "fr-FR",
                          )}{" "}
                          · {selectedLot.quantiteDisponible} L disponibles
                        </small>
                      )}
                    </div>
                    <div className="min-w-0">
                      <label
                        className="mb-1.5 block text-sm font-medium"
                        htmlFor={`milk-quantity-${index}`}
                      >
                        Quantité utilisée
                      </label>
                      <div className="relative">
                        <NumericTextInput
                          id={`milk-quantity-${index}`}
                          className="h-12 w-full rounded-2xl border border-[#c8bea9] bg-white px-4 pr-10 text-base font-semibold text-[#241f18] shadow-sm transition-colors hover:border-[#8f8168] focus-visible:border-[#28551c] focus-visible:ring-2 focus-visible:ring-[#28551c]/20"
                          aria-label={`Quantité utilisée pour le lot ${index + 1}`}
                          min={0}
                          autoComplete="off"
                          placeholder="0"
                          disabled={!selectedLot}
                          value={
                            selectedLot
                              ? (milkUsages[selectedLot.id] ?? "")
                              : ""
                          }
                          onValueChange={(value) =>
                            selectedLot &&
                            onMilkUsageChange(
                              selectedLot.id,
                              value,
                            )
                          }
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-muted-foreground">
                          L
                        </span>
                      </div>
                    </div>
                    {selectedMilkLotIds.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full sm:mt-7"
                        aria-label={`Retirer le lot ${index + 1}`}
                        onClick={() => onRemoveMilkLot(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={
                  selectedMilkLotIds.length >=
                  lotsLait.filter((lot) => lot.quantiteDisponible > 0).length
                }
                onClick={onAddMilkLot}
              >
                <Plus className="size-4" /> Ajouter un autre lot
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CoagulationStep({ control, register, errors, presureRecommendation, availablePresures, onPresureTypeChange, onPresureManualChange }: FormStepProps) {
  const unit = presureRecommendation?.unit === "ML" ? "mL" : presureRecommendation?.unit;
  const format = (value: number): string => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 4 }).format(value);
  const selectedPresure = useWatch({ control, name: "typePresure" });
  const normalize = (value: string): string => value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
  const differentPresure = Boolean(presureRecommendation
    && normalize(selectedPresure) !== normalize(presureRecommendation.type));
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <NumberField
        id="temperatureChauffage"
        label="Température de chauffage"
        unit="°C"
        error={errors.temperatureChauffage?.message}
        min={MIN_TEMPERATURE_CHAUFFAGE}
        max={MAX_TEMPERATURE_CHAUFFAGE}
        registration={register("temperatureChauffage", heatingTemperatureValidation)}
      />
      <NumberField
        id="dureeChauffageMinutes"
        label="Durée de chauffage"
        unit="min"
        step="1"
        min={MIN_DUREE_CHAUFFAGE_MINUTES}
        max={MAX_DUREE_CHAUFFAGE_MINUTES}
        error={errors.dureeChauffageMinutes?.message}
        registration={register("dureeChauffageMinutes", heatingDurationValidation)}
      />
      <Field
        label="Type de présure"
        error={errors.typePresure?.message}
        required
        htmlFor="typePresure"
      >
        <Controller control={control} name="typePresure" rules={referenceTextValidation} render={({ field }) => <Select value={field.value} onValueChange={(value) => { field.onChange(value); onPresureTypeChange(); }}><SelectTrigger id="typePresure" className="min-h-12" aria-invalid={Boolean(errors.typePresure)}><SelectValue placeholder="Choisir une présure" /></SelectTrigger><SelectContent>{[presureRecommendation?.type, ...availablePresures.map((item) => item.nom)].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index).map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent></Select>} />
      </Field>
      {presureRecommendation && <div className={`rounded-2xl border p-4 text-sm md:col-span-2 ${differentPresure ? "border-amber-400 bg-amber-50 text-amber-950" : "border-[#d8d0bd] bg-[#f7f3e9]"}`}><p><span className="font-semibold">Recette :</span> {presureRecommendation.type} — {format(presureRecommendation.recommended)} {unit}</p>{differentPresure ? <><p className="mt-1 font-semibold">Présure utilisée : {selectedPresure}</p><p className="mt-1">La présure sélectionnée diffère de celle prévue par la recette.</p><p className="mt-1 text-amber-800">Plage indicative par rapport à la recette : {format(presureRecommendation.recommended * 0.2)}–{format(presureRecommendation.recommended * 2)} {unit}</p></> : <p className="mt-1 text-muted-foreground">Plage autorisée : {format(presureRecommendation.minimum)}–{format(presureRecommendation.maximum)} {unit} (±40 %)</p>}</div>}
      <NumberField
        id="quantitePresure"
        label="Quantité réellement utilisée"
        unit={unit}
        error={errors.quantitePresure?.message}
        min={differentPresure ? undefined : presureRecommendation?.minimum ?? 0}
        max={differentPresure ? presureRecommendation?.absoluteMaximum : presureRecommendation?.maximum ?? MAX_QUANTITE_INGREDIENT}
        registration={register("quantitePresure", {
          ...boundedPositiveValidation(MAX_QUANTITE_INGREDIENT),
          onChange: onPresureManualChange,
          validate: (value: string) => {
            const positiveResult = validatePositiveNumber(value, MAX_QUANTITE_INGREDIENT);
            if (positiveResult !== true) return positiveResult;
            if (!presureRecommendation) return true;
            if (normalize(selectedPresure) !== normalize(presureRecommendation.type)) {
              return Number(value) <= presureRecommendation.absoluteMaximum
                || `La quantité de présure saisie est manifestement incohérente avec la quantité de lait utilisée. Maximum autorisé pour cette fabrication : ${format(presureRecommendation.absoluteMaximum)} mL.`;
            }
            const quantity = Number(value);
            return (quantity >= presureRecommendation.minimum && quantity <= presureRecommendation.maximum)
              || `La recette recommande ${format(presureRecommendation.recommended)} ${unit} de présure. Pour cette fabrication, la quantité autorisée est comprise entre ${format(presureRecommendation.minimum)} et ${format(presureRecommendation.maximum)} ${unit} (±40 %).`;
          },
        })}
      />
    </div>
  );
}
