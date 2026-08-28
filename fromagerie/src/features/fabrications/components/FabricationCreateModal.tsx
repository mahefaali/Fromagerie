import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Controller, useForm, type FieldPath, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Modal } from "../../../components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { HttpError } from "../../../services/http/apiClient";
import type {
  CreateFabricationRequest,
  OrigineLait,
  RecetteOption,
} from "../types/fabrication.types";
import { ORIGINE_LAIT_LABELS } from "../utils/fabricationFormatters";

interface FabricationFormValues {
  dateHeureDebut: string;
  recetteId: string;
  quantiteLait: string;
  temperatureLait: string;
  origineLait: OrigineLait;
  temperatureChauffage: string;
  dureeChauffageMinutes: string;
  typePresure: string;
  quantitePresure: string;
  typeFerments: string;
  quantiteFerments: string;
  temperatureMiseEnMoule: string;
  dureeEgouttageMinutes: string;
  poidsTotalFromages: string;
  nombreFromages: string;
  observations: string;
}

interface FabricationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: CreateFabricationRequest) => Promise<void>;
  recettes: RecetteOption[];
  isLoadingRecettes: boolean;
  recettesError: string | null;
  onRetryRecettes: () => Promise<void>;
}

const steps = [
  { key: "identification", title: "Identification", description: "Recette et démarrage" },
  { key: "milk", title: "Lait", description: "Quantité, température et origine" },
  { key: "heating", title: "Chauffage", description: "Chauffage et présure" },
  { key: "molding", title: "Ferments & moulage", description: "Ferments, moulage et égouttage" },
  { key: "results", title: "Résultats", description: "Poids, quantité et observations" },
] as const;

const stepFields: readonly (readonly FieldPath<FabricationFormValues>[])[] = [
  ["recetteId", "dateHeureDebut"],
  ["quantiteLait", "temperatureLait", "origineLait"],
  ["temperatureChauffage", "dureeChauffageMinutes", "typePresure", "quantitePresure"],
  ["typeFerments", "quantiteFerments", "temperatureMiseEnMoule", "dureeEgouttageMinutes"],
  ["poidsTotalFromages", "nombreFromages", "observations"],
];

const backendFields = new Set<FieldPath<FabricationFormValues>>([
  "dateHeureDebut",
  "recetteId",
  "quantiteLait",
  "temperatureLait",
  "origineLait",
  "temperatureChauffage",
  "dureeChauffageMinutes",
  "typePresure",
  "quantitePresure",
  "typeFerments",
  "quantiteFerments",
  "temperatureMiseEnMoule",
  "dureeEgouttageMinutes",
  "poidsTotalFromages",
  "nombreFromages",
  "observations",
]);

function localDateTimeNow(): string {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

function createDefaultValues(): FabricationFormValues {
  return {
    dateHeureDebut: localDateTimeNow(),
    recetteId: "",
    quantiteLait: "",
    temperatureLait: "",
    origineLait: "TRAITE_MATIN",
    temperatureChauffage: "",
    dureeChauffageMinutes: "",
    typePresure: "",
    quantitePresure: "",
    typeFerments: "",
    quantiteFerments: "",
    temperatureMiseEnMoule: "",
    dureeEgouttageMinutes: "",
    poidsTotalFromages: "",
    nombreFromages: "",
    observations: "",
  };
}

function isBackendField(value: string): value is FieldPath<FabricationFormValues> {
  return backendFields.has(value as FieldPath<FabricationFormValues>);
}

const positiveValidation = {
  required: "Ce champ est obligatoire.",
  validate: (value: string) => Number(value) > 0 || "La valeur doit être strictement positive.",
};

const numberValidation = {
  required: "Ce champ est obligatoire.",
  validate: (value: string) => Number.isFinite(Number(value)) || "Saisissez un nombre valide.",
};

export default function FabricationCreateModal({
  open,
  onOpenChange,
  onCreate,
  recettes,
  isLoadingRecettes,
  recettesError,
  onRetryRecettes,
}: FabricationCreateModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    control,
    register,
    handleSubmit,
    trigger,
    reset,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FabricationFormValues>({ defaultValues: createDefaultValues() });

  useEffect(() => {
    if (open && recettes.length === 1 && !getValues("recetteId")) {
      setValue("recetteId", String(recettes[0].id), { shouldValidate: true });
    }
  }, [getValues, open, recettes, setValue]);

  const resetAndClose = (): void => {
    if (isSubmitting) return;
    reset(createDefaultValues());
    setCurrentStep(0);
    onOpenChange(false);
  };

  const goNext = async (): Promise<void> => {
    if (await trigger(stepFields[currentStep])) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const submit = handleSubmit(async (values) => {
    const request: CreateFabricationRequest = {
      dateHeureDebut: values.dateHeureDebut,
      recetteId: Number(values.recetteId),
      quantiteLait: Number(values.quantiteLait),
      temperatureLait: Number(values.temperatureLait),
      origineLait: values.origineLait,
      temperatureChauffage: Number(values.temperatureChauffage),
      dureeChauffageMinutes: Number(values.dureeChauffageMinutes),
      typePresure: values.typePresure.trim(),
      quantitePresure: Number(values.quantitePresure),
      typeFerments: values.typeFerments.trim(),
      quantiteFerments: Number(values.quantiteFerments),
      temperatureMiseEnMoule: Number(values.temperatureMiseEnMoule),
      dureeEgouttageMinutes: Number(values.dureeEgouttageMinutes),
      poidsTotalFromages: Number(values.poidsTotalFromages),
      nombreFromages: Number(values.nombreFromages),
      observations: values.observations.trim() || null,
    };

    try {
      await onCreate(request);
      reset(createDefaultValues());
      setCurrentStep(0);
      onOpenChange(false);
    } catch (requestError: unknown) {
      if (requestError instanceof HttpError && requestError.validationErrors) {
        Object.entries(requestError.validationErrors).forEach(([field, message]) => {
          if (isBackendField(field)) setError(field, { message });
        });
      }

      const message = requestError instanceof Error
        ? requestError.message
        : "Enregistrement de la fabrication impossible.";
      setError("root", { message });
      toast.error(message);
    }
  });

  const renderStep = (): ReactNode => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Recette" error={errors.recetteId?.message} required htmlFor="recetteId">
              {isLoadingRecettes ? (
                <div role="status" className="flex min-h-12 items-center rounded-xl border px-3 text-sm text-muted-foreground">
                  Chargement des recettes...
                </div>
              ) : recettesError ? (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p>{recettesError}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetryRecettes}>
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
                      <SelectTrigger id="recetteId" className="min-h-12" aria-invalid={Boolean(errors.recetteId)}>
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

            <Field label="Début de fabrication" error={errors.dateHeureDebut?.message} required htmlFor="dateHeureDebut">
              <Input
                id="dateHeureDebut"
                type="datetime-local"
                className="min-h-12"
                aria-invalid={Boolean(errors.dateHeureDebut)}
                {...register("dateHeureDebut", { required: "La date et l'heure sont obligatoires." })}
              />
            </Field>

            <ServerField label="Numéro de lot" value="Généré automatiquement après enregistrement" />
            <ServerField label="Opérateur" value="Déterminé depuis votre session sécurisée" />
          </div>
        );

      case 1:
        return (
          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              id="quantiteLait"
              label="Quantité de lait"
              unit="L"
              error={errors.quantiteLait?.message}
              registration={register("quantiteLait", positiveValidation)}
            />
            <NumberField
              id="temperatureLait"
              label="Température du lait"
              unit="°C"
              error={errors.temperatureLait?.message}
              registration={register("temperatureLait", numberValidation)}
            />
            <Field label="Origine du lait" error={errors.origineLait?.message} required htmlFor="origineLait">
              <Controller
                control={control}
                name="origineLait"
                rules={{ required: "Sélectionnez l'origine du lait." }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="origineLait" className="min-h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(ORIGINE_LAIT_LABELS) as [OrigineLait, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              id="temperatureChauffage"
              label="Température de chauffage"
              unit="°C"
              error={errors.temperatureChauffage?.message}
              registration={register("temperatureChauffage", numberValidation)}
            />
            <NumberField
              id="dureeChauffageMinutes"
              label="Durée de chauffage"
              unit="min"
              step="1"
              error={errors.dureeChauffageMinutes?.message}
              registration={register("dureeChauffageMinutes", positiveValidation)}
            />
            <Field label="Type de présure" error={errors.typePresure?.message} required htmlFor="typePresure">
              <Input
                id="typePresure"
                className="min-h-12"
                placeholder="Ex. Présure animale"
                aria-invalid={Boolean(errors.typePresure)}
                {...register("typePresure", {
                  required: "Le type de présure est obligatoire.",
                  validate: (value) => value.trim().length > 0 || "Le type de présure est obligatoire.",
                })}
              />
            </Field>
            <NumberField
              id="quantitePresure"
              label="Quantité de présure"
              error={errors.quantitePresure?.message}
              registration={register("quantitePresure", positiveValidation)}
            />
          </div>
        );

      case 3:
        return (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Type de ferments" error={errors.typeFerments?.message} required htmlFor="typeFerments">
              <Input
                id="typeFerments"
                className="min-h-12"
                placeholder="Ex. Ferments thermophiles"
                aria-invalid={Boolean(errors.typeFerments)}
                {...register("typeFerments", {
                  required: "Le type de ferments est obligatoire.",
                  validate: (value) => value.trim().length > 0 || "Le type de ferments est obligatoire.",
                })}
              />
            </Field>
            <NumberField
              id="quantiteFerments"
              label="Quantité de ferments"
              error={errors.quantiteFerments?.message}
              registration={register("quantiteFerments", positiveValidation)}
            />
            <NumberField
              id="temperatureMiseEnMoule"
              label="Température de mise en moule"
              unit="°C"
              error={errors.temperatureMiseEnMoule?.message}
              registration={register("temperatureMiseEnMoule", numberValidation)}
            />
            <NumberField
              id="dureeEgouttageMinutes"
              label="Durée d'égouttage"
              unit="min"
              step="1"
              error={errors.dureeEgouttageMinutes?.message}
              registration={register("dureeEgouttageMinutes", positiveValidation)}
            />
          </div>
        );

      default:
        return (
          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              id="poidsTotalFromages"
              label="Poids total à la sortie du moule"
              unit="kg"
              error={errors.poidsTotalFromages?.message}
              registration={register("poidsTotalFromages", positiveValidation)}
            />
            <NumberField
              id="nombreFromages"
              label="Nombre de fromages produits"
              step="1"
              error={errors.nombreFromages?.message}
              registration={register("nombreFromages", {
                ...positiveValidation,
                validate: (value) =>
                  (Number(value) > 0 && Number.isInteger(Number(value))) ||
                  "Saisissez un nombre entier strictement positif.",
              })}
            />
            <Field label="Observations" error={errors.observations?.message} className="md:col-span-2" htmlFor="observations">
              <Textarea
                id="observations"
                className="min-h-28 text-base"
                placeholder="Observations facultatives sur cette fabrication"
                {...register("observations")}
              />
            </Field>
            <ServerField
              className="md:col-span-2"
              label="Rendement"
              value="Calculé par le backend à partir du lait et du poids obtenus"
            />
          </div>
        );
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) resetAndClose();
        else onOpenChange(true);
      }}
      title={`Étape ${currentStep + 1} / ${steps.length} · ${steps[currentStep].title}`}
      description={steps[currentStep].description}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Les champs marqués * sont obligatoires.</p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              className="min-h-12 px-5"
              disabled={currentStep === 0 || isSubmitting}
              onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
            >
              <ChevronLeft className="size-4" /> Précédent
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="button" className="min-h-12 px-5" disabled={isSubmitting} onClick={goNext}>
                Suivant <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="fabrication-create-form"
                className="min-h-12 px-5"
                disabled={isSubmitting || isLoadingRecettes || recettes.length === 0}
              >
                {isSubmitting ? (
                  <><Loader2 className="size-4 animate-spin" /> Enregistrement...</>
                ) : (
                  <>Enregistrer <ArrowRight className="size-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form id="fabrication-create-form" onSubmit={submit} noValidate>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {steps.map((step, index) => (
            <span
              key={step.key}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>

        {errors.root?.message ? (
          <p role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {errors.root.message}
          </p>
        ) : null}

        {renderStep()}
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  required = false,
  className = "",
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}{required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function NumberField({
  id,
  label,
  unit,
  step = "any",
  error,
  registration,
}: {
  id: string;
  label: string;
  unit?: string;
  step?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <Field label={label} error={error} required htmlFor={id}>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step={step}
          inputMode="decimal"
          className="min-h-12 pr-14"
          aria-invalid={Boolean(error)}
          {...registration}
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

function ServerField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-4 ${className}`}>
      <p className="text-xs uppercase tracking-[0.14em] text-primary">{label}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
