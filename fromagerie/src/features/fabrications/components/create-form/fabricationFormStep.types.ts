import type { Control, FieldErrors, UseFormGetValues, UseFormRegister, UseFormTrigger } from "react-hook-form";

import type { RecetteOption } from "../../types/fabrication.types";
import type { FabricationFormValues } from "./fabricationCreateForm.utils";
import type { LotLait } from "../../../tracabilite/types";
import type { MatierePremiere, UniteMesure } from "../../types/recipe.types";

export interface PresureRecommendation {
  type: string;
  unit: UniteMesure;
  recommended: number;
  minimum: number;
  maximum: number;
  absoluteMaximum: number;
}

export interface FermentRecommendation {
  type: string;
  unit: UniteMesure;
  recommended: number;
  minimum: number;
  maximum: number;
}

export interface FabricationFormStepProps {
  currentStep: number;
  control: Control<FabricationFormValues>;
  register: UseFormRegister<FabricationFormValues>;
  errors: FieldErrors<FabricationFormValues>;
  getValues: UseFormGetValues<FabricationFormValues>;
  trigger: UseFormTrigger<FabricationFormValues>;
  recettes: RecetteOption[];
  isLoadingRecettes: boolean;
  recettesError: string | null;
  onRetryRecettes: () => Promise<void>;
  lotsLait: LotLait[];
  selectedMilkLotIds: string[];
  milkUsages: Record<number, string>;
  onMilkLotChange: (index: number, lotId: string) => void;
  onAddMilkLot: () => void;
  onRemoveMilkLot: (index: number) => void;
  onMilkUsageChange: (id: number, value: string) => void;
  presureRecommendation: PresureRecommendation | null;
  availablePresures: MatierePremiere[];
  onPresureTypeChange: () => void;
  onPresureManualChange: () => void;
  fermentRecommendation: FermentRecommendation | null;
  availableFerments: MatierePremiere[];
  onFermentTypeChange: () => void;
  onFermentManualChange: () => void;
  isEditing: boolean;
}

export type FormStepProps = Omit<FabricationFormStepProps, "currentStep">;
