import type { FieldPath, RegisterOptions } from "react-hook-form";

import type { CreateFabricationRequest, FabricationDetail, OrigineLait } from "../../types/fabrication.types";

export interface FabricationFormValues {
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
  dureeEgouttageUnite: "MINUTES" | "HEURES";
  poidsTotalFromages: string;
  nombreFromages: string;
  observations: string;
}

export const FABRICATION_STEPS = [
  { key: "identification", title: "Identification", description: "Recette et démarrage" },
  { key: "milk", title: "Lait", description: "Quantité, température et origine" },
  { key: "heating", title: "Chauffage", description: "Chauffage et présure" },
  { key: "molding", title: "Ferments & moulage", description: "Ferments, moulage et égouttage" },
  { key: "results", title: "Résultats", description: "Poids, quantité et observations" },
] as const;

export const STEP_FIELDS: readonly (readonly FieldPath<FabricationFormValues>[])[] = [
  ["recetteId", "dateHeureDebut"],
  ["quantiteLait", "temperatureLait", "origineLait"],
  ["temperatureChauffage", "dureeChauffageMinutes", "typePresure", "quantitePresure"],
  ["typeFerments", "quantiteFerments", "temperatureMiseEnMoule", "dureeEgouttageMinutes"],
  ["poidsTotalFromages", "nombreFromages", "observations"],
];

const backendFields = new Set<FieldPath<FabricationFormValues>>(
  Object.keys(createDefaultValues()) as FieldPath<FabricationFormValues>[],
);

export const MAX_QUANTITE_LAIT = 10_000;
export const MIN_TEMPERATURE_LAIT = 15;
export const MAX_TEMPERATURE_LAIT = 45;
export const MIN_TEMPERATURE_CHAUFFAGE = 26;
export const MAX_TEMPERATURE_CHAUFFAGE = 48;
export const MIN_DUREE_CHAUFFAGE_MINUTES = 10;
export const MAX_DUREE_CHAUFFAGE_MINUTES = 65;
export const MIN_TEMPERATURE_MISE_EN_MOULE = 20;
export const MAX_TEMPERATURE_MISE_EN_MOULE = 50;
export const MIN_DUREE_EGOUTTAGE_MINUTES = 30;
export const MAX_DUREE_EGOUTTAGE_MINUTES = 2_880;
export const MIN_TEMPERATURE = -50;
export const MAX_TEMPERATURE = 200;
export const MAX_DUREE_MINUTES = 10_080;
export const MAX_QUANTITE_INGREDIENT = 100_000;
export const MAX_POIDS_FROMAGES = 10_000;
export const MAX_NOMBRE_FROMAGES = 100_000;
export const REQUIRED_MESSAGE = "Ce champ est obligatoire.";

export function createDefaultValues(): FabricationFormValues {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return {
    dateHeureDebut: localTime.toISOString().slice(0, 16),
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
    dureeEgouttageUnite: "MINUTES",
    poidsTotalFromages: "",
    nombreFromages: "",
    observations: "",
  };
}

export function createValuesFromFabrication(fabrication: FabricationDetail): FabricationFormValues {
  return {
    dateHeureDebut: fabrication.dateHeureDebut.slice(0, 16),
    recetteId: String(fabrication.recetteId),
    quantiteLait: String(fabrication.quantiteLait),
    temperatureLait: String(fabrication.temperatureLait),
    origineLait: fabrication.origineLait,
    temperatureChauffage: String(fabrication.temperatureChauffage),
    dureeChauffageMinutes: String(fabrication.dureeChauffageMinutes),
    typePresure: fabrication.typePresure,
    quantitePresure: String(fabrication.quantitePresure),
    typeFerments: fabrication.typeFerments,
    quantiteFerments: String(fabrication.quantiteFerments),
    temperatureMiseEnMoule: String(fabrication.temperatureMiseEnMoule),
    dureeEgouttageMinutes: String(fabrication.dureeEgouttageMinutes % 60 === 0
      ? fabrication.dureeEgouttageMinutes / 60
      : fabrication.dureeEgouttageMinutes),
    dureeEgouttageUnite: fabrication.dureeEgouttageMinutes % 60 === 0 ? "HEURES" : "MINUTES",
    poidsTotalFromages: String(fabrication.poidsTotalFromages),
    nombreFromages: String(fabrication.nombreFromages),
    observations: fabrication.observations ?? "",
  };
}

export function toCreateFabricationRequest(values: FabricationFormValues): CreateFabricationRequest {
  return {
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
    dureeEgouttageMinutes: toDrainageMinutes(values.dureeEgouttageMinutes, values.dureeEgouttageUnite),
    poidsTotalFromages: Number(values.poidsTotalFromages),
    nombreFromages: Number(values.nombreFromages),
    observations: values.observations.trim() || null,
  };
}

export function toDrainageMinutes(value: string, unit: FabricationFormValues["dureeEgouttageUnite"]): number {
  const numericValue = Number(value);
  return unit === "HEURES" ? numericValue * 60 : numericValue;
}

export function validateDrainageDuration(
  value: string,
  unit: FabricationFormValues["dureeEgouttageUnite"],
): true | string {
  const minutes = toDrainageMinutes(value, unit);
  return (Number.isFinite(minutes)
    && Number.isInteger(minutes)
    && minutes >= MIN_DUREE_EGOUTTAGE_MINUTES
    && minutes <= MAX_DUREE_EGOUTTAGE_MINUTES)
    || "La durée d'égouttage doit être comprise entre 30 minutes et 48 heures.";
}

export function isBackendField(value: string): value is FieldPath<FabricationFormValues> {
  return backendFields.has(value as FieldPath<FabricationFormValues>);
}

export function validatePositiveNumber(value: string, max?: number): true | string {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "La valeur doit être strictement positive.";
  return max === undefined || number <= max || `La valeur ne peut pas dépasser ${max}.`;
}

export function validatePositiveInteger(value: string, max?: number): true | string {
  const number = Number(value);
  if (!Number.isFinite(number) || !Number.isInteger(number) || number <= 0) return "Saisissez un nombre entier strictement positif.";
  return max === undefined || number <= max || `La valeur ne peut pas dépasser ${max}.`;
}

export function maximumCheeseCount(milkQuantity: string | number): number {
  return Math.floor(Number(milkQuantity) * 10);
}

export type CheeseYieldZone = "INVALID" | "LOW" | "NORMAL" | "HIGH";

export function calculateCheeseYield(
  cheeseWeight: string | number,
  milkQuantity: string | number,
): number {
  return Number(cheeseWeight) / Number(milkQuantity) * 100;
}

export function cheeseYieldZone(
  cheeseWeight: string | number,
  milkQuantity: string | number,
): CheeseYieldZone {
  const yieldPercent = calculateCheeseYield(cheeseWeight, milkQuantity);
  if (!Number.isFinite(yieldPercent) || yieldPercent < 1 || yieldPercent > 70) return "INVALID";
  if (yieldPercent < 5) return "LOW";
  if (yieldPercent > 30) return "HIGH";
  return "NORMAL";
}

export function isExceptionallyLowCheeseCount(
  cheeseCount: string | number,
  milkQuantity: string | number,
): boolean {
  const warningThreshold = minimumCheeseWarningThreshold(milkQuantity);
  return Number(cheeseCount) >= 1 && Number(cheeseCount) < warningThreshold;
}

export function minimumCheeseWarningThreshold(milkQuantity: string | number): number {
  return Math.max(1, Math.floor(Number(milkQuantity) / 20));
}

export function validateTemperature(value: string): true | string {
  return validateTemperatureRange(value, MIN_TEMPERATURE, MAX_TEMPERATURE);
}

export function validateTemperatureRange(value: string, min: number, max: number): true | string {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Saisissez un nombre fini valide.";
  return (number >= min && number <= max)
    || `La température doit être comprise entre ${min} et ${max} °C.`;
}

export function isValidLocalDateTime(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  return Number.isFinite(date.getTime()) && date.getFullYear() === year
    && date.getMonth() === month - 1 && date.getDate() === day
    && date.getHours() === hour && date.getMinutes() === minute && date.getTime() <= Date.now();
}

export const boundedPositiveValidation = (max: number): RegisterOptions<FabricationFormValues> => ({
  required: REQUIRED_MESSAGE,
  validate: (value) => validatePositiveNumber(String(value), max),
});

export const boundedPositiveIntegerValidation = (max: number): RegisterOptions<FabricationFormValues> => ({
  required: REQUIRED_MESSAGE,
  validate: (value) => validatePositiveInteger(String(value), max),
});

export const temperatureValidation: RegisterOptions<FabricationFormValues> = {
  required: REQUIRED_MESSAGE,
  validate: (value) => validateTemperature(String(value)),
};

export const milkTemperatureValidation: RegisterOptions<FabricationFormValues> = {
  required: REQUIRED_MESSAGE,
  validate: (value) => validateTemperatureRange(String(value), MIN_TEMPERATURE_LAIT, MAX_TEMPERATURE_LAIT) === true
    || "La température du lait doit être comprise entre 15 °C et 45 °C.",
};

export const heatingTemperatureValidation: RegisterOptions<FabricationFormValues> = {
  required: REQUIRED_MESSAGE,
  validate: (value) => validateTemperatureRange(String(value), MIN_TEMPERATURE_CHAUFFAGE, MAX_TEMPERATURE_CHAUFFAGE) === true
    || "La température de chauffage doit être comprise entre 26 °C et 48 °C.",
};

export const moldingTemperatureValidation: RegisterOptions<FabricationFormValues> = {
  required: REQUIRED_MESSAGE,
  validate: (value) => validateTemperatureRange(
    String(value),
    MIN_TEMPERATURE_MISE_EN_MOULE,
    MAX_TEMPERATURE_MISE_EN_MOULE,
  ) === true || "La température de mise en moule doit être comprise entre 20 °C et 50 °C.",
};

export const heatingDurationValidation: RegisterOptions<FabricationFormValues> = {
  required: REQUIRED_MESSAGE,
  validate: (value) => {
    const duration = Number(value);
    return (Number.isInteger(duration)
      && duration >= MIN_DUREE_CHAUFFAGE_MINUTES
      && duration <= MAX_DUREE_CHAUFFAGE_MINUTES)
      || "La durée de chauffage doit être comprise entre 10 et 65 minutes.";
  },
};

export const referenceTextValidation: RegisterOptions<FabricationFormValues> = {
  required: REQUIRED_MESSAGE,
  maxLength: { value: 255, message: "Ce texte ne peut pas dépasser 255 caractères." },
  validate: (value) => String(value).trim().length > 0 || REQUIRED_MESSAGE,
};
