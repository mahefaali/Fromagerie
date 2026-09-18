import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { HttpError } from "../../../services/http/apiClient";
import type {
  CreateFabricationRequest,
  FabricationDetail,
  RecetteOption,
} from "../types/fabrication.types";
import {
  createDefaultValues,
  createValuesFromFabrication,
  cheeseYieldZone,
  FABRICATION_STEPS,
  isExceptionallyLowCheeseCount,
  isBackendField,
  STEP_FIELDS,
  toCreateFabricationRequest,
  type FabricationFormValues,
} from "./create-form/fabricationCreateForm.utils";
import { FabricationFormStep } from "./create-form/FabricationFormStep";
import { tracabiliteApi } from "../../tracabilite/api";
import type { LotLait } from "../../tracabilite/types";
import { recipeApi } from "../api/recipeApi";
import type { MatierePremiere, RecetteDetail } from "../types/recipe.types";
import type { FermentRecommendation, PresureRecommendation } from "./create-form/fabricationFormStep.types";

interface FabricationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: CreateFabricationRequest) => Promise<void>;
  recettes: RecetteOption[];
  isLoadingRecettes: boolean;
  recettesError: string | null;
  onRetryRecettes: () => Promise<void>;
  fabrication?: FabricationDetail | null;
}


export default function FabricationCreateModal({
  open,
  onOpenChange,
  onCreate,
  recettes,
  isLoadingRecettes,
  recettesError,
  onRetryRecettes,
  fabrication = null,
}: FabricationCreateModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [lotsLait, setLotsLait] = useState<LotLait[]>([]);
  const [selectedMilkLotIds, setSelectedMilkLotIds] = useState<string[]>([""]);
  const [milkUsages, setMilkUsages] = useState<Record<number, string>>({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [recipeDetail, setRecipeDetail] = useState<RecetteDetail | null>(null);
  const [availablePresures, setAvailablePresures] = useState<MatierePremiere[]>([]);
  const [availableFerments, setAvailableFerments] = useState<MatierePremiere[]>([]);
  const [presureAlertOpen, setPresureAlertOpen] = useState(false);
  const [fermentAlertOpen, setFermentAlertOpen] = useState(false);
  const [cheeseCountAlertOpen, setCheeseCountAlertOpen] = useState(false);
  const [yieldAlertOpen, setYieldAlertOpen] = useState(false);
  const presureTypeManuallyEdited = useRef(false);
  const presureManuallyEdited = useRef(false);
  const presureAlertConfirmed = useRef(false);
  const fermentTypeManuallyEdited = useRef(false);
  const fermentManuallyEdited = useRef(false);
  const fermentAlertConfirmed = useRef(false);
  const cheeseCountAlertConfirmed = useRef(false);
  const yieldAlertConfirmed = useRef(false);
  const {
    control,
    register,
    handleSubmit,
    trigger,
    reset,
    setError,
    clearErrors,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FabricationFormValues>({
    mode: "onChange",
    defaultValues: fabrication ? createValuesFromFabrication(fabrication) : createDefaultValues(),
  });
  const selectedRecipeId = watch("recetteId");

  useEffect(() => {
    if (open && fabrication) {
      reset(createValuesFromFabrication(fabrication));
      setCurrentStep(0);
    }
  }, [fabrication, open, reset]);

  useEffect(() => {
    if (open && recettes.length === 1 && !getValues("recetteId")) {
      setValue("recetteId", String(recettes[0].id), { shouldValidate: true });
    }
  }, [getValues, open, recettes, setValue]);

  useEffect(() => { if (open) void tracabiliteApi.lots().then(setLotsLait).catch(() => setLotsLait([])); }, [open]);
  useEffect(() => {
    if (open) void recipeApi.findMaterials()
      .then((materials) => {
        setAvailablePresures(materials.filter((material) => material.actif && normalizePresureName(material.nom).includes("presure")));
        setAvailableFerments(materials.filter((material) => material.actif && normalizePresureName(material.nom).includes("ferment")));
      })
      .catch(() => { setAvailablePresures([]); setAvailableFerments([]); });
  }, [open]);

  useEffect(() => {
    if (!open || !selectedRecipeId) {
      setRecipeDetail(null);
      return;
    }
    let active = true;
    void recipeApi.findById(Number(selectedRecipeId))
      .then((detail) => { if (active) setRecipeDetail(detail); })
      .catch(() => { if (active) setRecipeDetail(null); });
    return () => { active = false; };
  }, [open, selectedRecipeId]);

  const milkTotal = fabrication?.quantiteLait
    ?? Object.values(milkUsages).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const presureRecommendation = useMemo<PresureRecommendation | null>(() => {
    const presureIngredient = recipeDetail?.ingredients.find((ingredient) =>
      ingredient.matierePremiereNom.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().includes("presure"));
    const milkReference = recipeDetail?.quantiteLaitReference;
    return presureIngredient && milkReference && milkTotal > 0
      ? (() => {
        const recommended = presureIngredient.quantite * milkTotal / milkReference;
        return {
          type: presureIngredient.matierePremiereNom,
          unit: presureIngredient.unite,
          recommended,
          minimum: recommended * 0.6,
          maximum: recommended * 1.4,
          absoluteMaximum: milkTotal,
        };
        })()
      : null;
  }, [milkTotal, recipeDetail]);
  const fermentRecommendation = useMemo<FermentRecommendation | null>(() => {
    const fermentIngredient = recipeDetail?.ingredients.find((ingredient) =>
      normalizePresureName(ingredient.matierePremiereNom).includes("ferment"));
    const milkReference = recipeDetail?.quantiteLaitReference;
    if (!fermentIngredient || !milkReference || milkTotal <= 0) return null;
    const recommended = fermentIngredient.quantite * milkTotal / milkReference;
    return {
      type: fermentIngredient.matierePremiereNom,
      unit: fermentIngredient.unite,
      recommended,
      minimum: recommended * 0.6,
      maximum: recommended * 1.4,
    };
  }, [milkTotal, recipeDetail]);

  useEffect(() => {
    if (!presureRecommendation) return;
    if (!fabrication && !presureTypeManuallyEdited.current) {
      setValue("typePresure", presureRecommendation.type, { shouldValidate: true });
    }
    if (!fabrication && !presureManuallyEdited.current) {
      setValue("quantitePresure", String(presureRecommendation.recommended), { shouldValidate: true });
    }
  }, [fabrication, presureRecommendation, setValue]);

  useEffect(() => {
    if (!fermentRecommendation) return;
    if (!fabrication && !fermentTypeManuallyEdited.current) {
      setValue("typeFerments", fermentRecommendation.type, { shouldValidate: true });
    }
    if (!fabrication && !fermentManuallyEdited.current) {
      setValue("quantiteFerments", String(fermentRecommendation.recommended), { shouldValidate: true });
    }
  }, [fabrication, fermentRecommendation, setValue]);

  useEffect(() => {
    if (presureRecommendation && currentStep === 2) void trigger("quantitePresure");
  }, [currentStep, presureRecommendation, trigger]);

  useEffect(() => {
    if (fermentRecommendation && currentStep === 3) void trigger("quantiteFerments");
  }, [currentStep, fermentRecommendation, trigger]);

  useEffect(() => {
    if (currentStep === 4) void trigger(["nombreFromages", "poidsTotalFromages"]);
  }, [currentStep, milkTotal, trigger]);

  useEffect(() => {
    if (!open || fabrication) return;
    const selectedTypes = selectedMilkLotIds
      .map((id) => lotsLait.find((lot) => String(lot.id) === id)?.typeTraite)
      .filter((type): type is LotLait["typeTraite"] => Boolean(type));
    if (selectedTypes.length === 0) return;
    const hasMorning = selectedTypes.includes("MATIN");
    const hasEvening = selectedTypes.includes("SOIR");
    setValue("origineLait", hasMorning && hasEvening ? "MELANGE" : hasMorning ? "TRAITE_MATIN" : "TRAITE_SOIR", { shouldValidate: true });
  }, [fabrication, lotsLait, open, selectedMilkLotIds, setValue]);

  const resetAndClose = (): void => {
    if (isSubmitting) return;
    reset(createDefaultValues());
    setSelectedMilkLotIds([""]);
    setMilkUsages({});
    presureTypeManuallyEdited.current = false;
    presureManuallyEdited.current = false;
    presureAlertConfirmed.current = false;
    fermentTypeManuallyEdited.current = false;
    fermentManuallyEdited.current = false;
    fermentAlertConfirmed.current = false;
    cheeseCountAlertConfirmed.current = false;
    yieldAlertConfirmed.current = false;
    setCurrentStep(0);
    onOpenChange(false);
  };

  const goNext = async (): Promise<void> => {
    if (currentStep === 1 && !fabrication) {
      const selectedUsages = Object.entries(milkUsages).filter(([, value]) => value !== "");
      if (selectedUsages.length === 0) {
        setError("quantiteLait", { message: "Sélectionnez au moins un lot de lait." });
        return;
      }
      const invalidUsage = selectedUsages.find(([lotId, value]) => {
        const quantity = Number(value);
        const available = lotsLait.find((lot) => lot.id === Number(lotId))?.quantiteDisponible ?? 0;
        return !Number.isFinite(quantity) || quantity <= 0 || quantity > available;
      });
      if (invalidUsage) {
        setError("quantiteLait", { message: "Chaque quantité doit être positive et ne pas dépasser le disponible." });
        return;
      }
      const total = selectedUsages.reduce((sum, [, value]) => sum + Number(value), 0);
      setValue("quantiteLait", String(total), { shouldValidate: true });
      clearErrors("quantiteLait");
    }
    if (await trigger(STEP_FIELDS[currentStep])) {
      setCurrentStep((step) => Math.min(step + 1, FABRICATION_STEPS.length - 1));
    }
  };

  const submit = handleSubmit(async (values) => {
    const differentPresure = presureRecommendation
      && normalizePresureName(values.typePresure) !== normalizePresureName(presureRecommendation.type);
    const quantity = Number(values.quantitePresure);
    const outsideIndicativeRange = differentPresure
      && (quantity < presureRecommendation.recommended * 0.2
        || quantity > presureRecommendation.recommended * 2);
    if (outsideIndicativeRange && !presureAlertConfirmed.current) {
      setPresureAlertOpen(true);
      return;
    }
    const differentFerment = fermentRecommendation
      && normalizePresureName(values.typeFerments) !== normalizePresureName(fermentRecommendation.type);
    const selectedFerment = availableFerments.find((material) =>
      normalizePresureName(material.nom) === normalizePresureName(values.typeFerments));
    const comparableFerment = differentFerment && selectedFerment?.uniteReference === fermentRecommendation.unit;
    const fermentQuantity = Number(values.quantiteFerments);
    const fermentOutsideIndicativeRange = comparableFerment
      && (fermentQuantity < fermentRecommendation.recommended * 0.2
        || fermentQuantity > fermentRecommendation.recommended * 2);
    if (fermentOutsideIndicativeRange && !fermentAlertConfirmed.current) {
      setFermentAlertOpen(true);
      return;
    }
    const yieldZone = cheeseYieldZone(values.poidsTotalFromages, values.quantiteLait);
    const abnormalYield = yieldZone === "LOW" || yieldZone === "HIGH";
    if (abnormalYield && !yieldAlertConfirmed.current) {
      setYieldAlertOpen(true);
      return;
    }
    const exceptionallyLowCheeseCount = isExceptionallyLowCheeseCount(
      values.nombreFromages,
      values.quantiteLait,
    );
    if (exceptionallyLowCheeseCount && !cheeseCountAlertConfirmed.current) {
      setCheeseCountAlertOpen(true);
      return;
    }
    const request = toCreateFabricationRequest(values);
    if (outsideIndicativeRange) request.presureHorsPlageConfirmee = true;
    if (fermentOutsideIndicativeRange) request.fermentHorsPlageConfirmee = true;
    if (abnormalYield) request.rendementAnormalConfirme = true;
    if (exceptionallyLowCheeseCount) request.nombreFromagesFaibleConfirme = true;
    if (!fabrication) {
      request.lotsLait = Object.entries(milkUsages).filter(([, value]) => Number(value) > 0).map(([id, value]) => ({ lotLaitId: Number(id), quantiteUtilisee: Number(value) }));
      if (request.lotsLait.length === 0) delete request.lotsLait;
    }

    try {
      await onCreate(request);
      reset(createDefaultValues());
      setSelectedMilkLotIds([""]);
      setMilkUsages({});
      presureTypeManuallyEdited.current = false;
      presureManuallyEdited.current = false;
      presureAlertConfirmed.current = false;
      fermentTypeManuallyEdited.current = false;
      fermentManuallyEdited.current = false;
      fermentAlertConfirmed.current = false;
      cheeseCountAlertConfirmed.current = false;
      yieldAlertConfirmed.current = false;
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

  const requestUpdateConfirmation = handleSubmit(() => setConfirmationOpen(true));

  return (<>
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) resetAndClose();
        else onOpenChange(true);
      }}
      title={`${fabrication ? "Modification · " : ""}Étape ${currentStep + 1} / ${FABRICATION_STEPS.length} · ${FABRICATION_STEPS[currentStep].title}`}
      description={FABRICATION_STEPS[currentStep].description}
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
            {currentStep < FABRICATION_STEPS.length - 1 ? (
              <Button type="button" className="min-h-12 px-5" disabled={isSubmitting} onClick={goNext}>
                Suivant <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type={fabrication ? "button" : "submit"}
                form={fabrication ? undefined : "fabrication-create-form"}
                className="min-h-12 px-5"
                disabled={isSubmitting || isLoadingRecettes || recettes.length === 0}
                onClick={fabrication ? () => void requestUpdateConfirmation() : undefined}
              >
                {isSubmitting ? (
                  <><Loader2 className="size-4 animate-spin" /> Enregistrement...</>
                ) : (
                  <>{fabrication ? "Enregistrer les modifications" : "Enregistrer"} <ArrowRight className="size-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form id="fabrication-create-form" onSubmit={fabrication ? requestUpdateConfirmation : submit} noValidate>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FABRICATION_STEPS.map((step, index) => (
            <span
              key={step.key}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${index === currentStep
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

        <FabricationFormStep
          currentStep={currentStep}
          control={control}
          register={register}
          errors={errors}
          getValues={getValues}
          trigger={trigger}
          recettes={recettes}
          isLoadingRecettes={isLoadingRecettes}
          recettesError={recettesError}
          onRetryRecettes={onRetryRecettes}
          lotsLait={lotsLait}
          selectedMilkLotIds={selectedMilkLotIds}
          milkUsages={milkUsages}
          onMilkLotChange={(index, lotId) => {
            const previousLotId = Number(selectedMilkLotIds[index]);
            if (previousLotId) {
              setMilkUsages((current) => {
                const next = { ...current };
                delete next[previousLotId];
                return next;
              });
            }
            setSelectedMilkLotIds((current) => current.map((value, rowIndex) => rowIndex === index ? lotId : value));
            clearErrors("quantiteLait");
          }}
          onAddMilkLot={() => setSelectedMilkLotIds((current) => [...current, ""])}
          onRemoveMilkLot={(index) => {
            const removedLotId = Number(selectedMilkLotIds[index]);
            setSelectedMilkLotIds((current) => current.filter((_, rowIndex) => rowIndex !== index));
            if (removedLotId) {
              setMilkUsages((current) => {
                const next = { ...current };
                delete next[removedLotId];
                return next;
              });
            }
          }}
          onMilkUsageChange={(id, value) => setMilkUsages(current => ({ ...current, [id]: value }))}
          presureRecommendation={presureRecommendation}
          availablePresures={availablePresures}
          onPresureTypeChange={() => { presureTypeManuallyEdited.current = true; }}
          onPresureManualChange={() => { presureManuallyEdited.current = true; }}
          fermentRecommendation={fermentRecommendation}
          availableFerments={availableFerments}
          onFermentTypeChange={() => { fermentTypeManuallyEdited.current = true; }}
          onFermentManualChange={() => { fermentManuallyEdited.current = true; }}
          isEditing={Boolean(fabrication)}
        />
      </form>
    </Modal>
    <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la modification ?</AlertDialogTitle>
          <AlertDialogDescription>
            Les nouvelles informations remplaceront celles du lot {fabrication?.numeroLot}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Revenir au formulaire</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              setConfirmationOpen(false);
              void submit();
            }}
          >
            {isSubmitting ? "Modification..." : "Confirmer la modification"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={presureAlertOpen} onOpenChange={setPresureAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vérifier la quantité de présure</AlertDialogTitle>
          <AlertDialogDescription>
            Attention : la recette prévoit {formatPresure(presureRecommendation?.recommended)} {displayPresureUnit(presureRecommendation?.unit)} avec « {presureRecommendation?.type} ». Vous utilisez « {getValues("typePresure")} » avec {getValues("quantitePresure")} {displayPresureUnit(presureRecommendation?.unit)}. Cette quantité est très éloignée de la référence de la recette (plage indicative : {formatPresure((presureRecommendation?.recommended ?? 0) * 0.2)}–{formatPresure((presureRecommendation?.recommended ?? 0) * 2)} {displayPresureUnit(presureRecommendation?.unit)}). Les présures peuvent avoir des forces différentes. Vérifiez la quantité réellement utilisée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Corriger</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => { event.preventDefault(); presureAlertConfirmed.current = true; setPresureAlertOpen(false); void submit(); }}>Confirmer la quantité</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={fermentAlertOpen} onOpenChange={setFermentAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vérifier la quantité de ferment</AlertDialogTitle>
          <AlertDialogDescription>
            Attention : la quantité utilisée est très éloignée de la référence de la recette. Vérifiez que « {getValues("typeFerments")} » et la quantité de {getValues("quantiteFerments")} {displayPresureUnit(fermentRecommendation?.unit)} correspondent bien au ferment réellement utilisé.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Corriger</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => { event.preventDefault(); fermentAlertConfirmed.current = true; setFermentAlertOpen(false); void submit(); }}>Confirmer la quantité</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={cheeseCountAlertOpen} onOpenChange={setCheeseCountAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vérifier le nombre de fromages</AlertDialogTitle>
          <AlertDialogDescription>
            Le nombre de fromages produits paraît très faible pour {getValues("quantiteLait")} L de lait utilisés. Vérifiez la saisie. Si cette quantité correspond réellement à la fabrication, vous pouvez la confirmer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Corriger</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => { event.preventDefault(); cheeseCountAlertConfirmed.current = true; setCheeseCountAlertOpen(false); void submit(); }}>Confirmer cette valeur</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={yieldAlertOpen} onOpenChange={setYieldAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vérifier le rendement</AlertDialogTitle>
          <AlertDialogDescription>
            {cheeseYieldZone(getValues("poidsTotalFromages"), getValues("quantiteLait")) === "LOW"
              ? "Le rendement paraît anormalement faible. Vérifiez le poids total saisi. Si cette valeur correspond réellement à la fabrication, vous pouvez la confirmer."
              : "Le rendement paraît anormalement élevé. Vérifiez le poids total saisi. Si cette valeur correspond réellement à la fabrication, vous pouvez la confirmer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Corriger</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => { event.preventDefault(); yieldAlertConfirmed.current = true; setYieldAlertOpen(false); void submit(); }}>Confirmer le rendement</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>);
}

function normalizePresureName(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}

function formatPresure(value?: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 4 }).format(value ?? 0);
}

function displayPresureUnit(unit?: string): string {
  return unit === "ML" ? "mL" : (unit ?? "");
}
