import type { RecetteListItem } from "./recipe.types";

export type OrigineLait = "TRAITE_MATIN" | "TRAITE_SOIR" | "MELANGE";

export type RecetteOption = RecetteListItem;

export interface FabricationListItem {
  id: number;
  numeroLot: string;
  dateHeureDebut: string;
  fromageId: number;
  fromageNom: string;
  recetteId: number;
  recetteNom: string;
  quantiteLait: number;
  poidsTotalFromages: number;
  nombreFromages: number;
  rendement: number;
  operateurId: number | null;
  operateurNom: string;
}

export interface FabricationDetail extends FabricationListItem {
  temperatureLait: number;
  origineLait: OrigineLait;
  temperatureChauffage: number;
  dureeChauffageMinutes: number;
  typePresure: string;
  quantitePresure: number;
  typeFerments: string;
  quantiteFerments: number;
  temperatureMiseEnMoule: number;
  dureeEgouttageMinutes: number;
  observations: string | null;
}

export interface CreateFabricationRequest {
  dateHeureDebut: string;
  recetteId: number;
  quantiteLait: number;
  temperatureLait: number;
  origineLait: OrigineLait;
  temperatureChauffage: number;
  dureeChauffageMinutes: number;
  typePresure: string;
  quantitePresure: number;
  presureHorsPlageConfirmee?: boolean;
  typeFerments: string;
  quantiteFerments: number;
  fermentHorsPlageConfirmee?: boolean;
  temperatureMiseEnMoule: number;
  dureeEgouttageMinutes: number;
  poidsTotalFromages: number;
  rendementAnormalConfirme?: boolean;
  nombreFromages: number;
  nombreFromagesFaibleConfirme?: boolean;
  observations: string | null;
  lotsLait?: { lotLaitId: number; quantiteUtilisee: number }[];
}

export type UpdateFabricationRequest = CreateFabricationRequest;

export type AnomalyParameter = "RENDEMENT" | "TEMPERATURE_CHAUFFAGE";
export type AnomalyDirection = "BASSE" | "HAUTE";
export type AnomalyAnalysisStatus = "NORMALE" | "ANOMALIE" | "DONNEES_INSUFFISANTES";

export interface FabricationAnalyticsFilters {
  fromageId?: number;
  recetteId?: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface TemperatureHistoryPoint {
  fabricationId: number;
  numeroLot: string;
  dateHeureDebut: string;
  fromageId: number;
  fromageNom: string;
  recetteId: number;
  recetteNom: string;
  temperatureChauffage: number;
}

export interface YieldHistoryPoint {
  fabricationId: number;
  numeroLot: string;
  dateHeureDebut: string;
  fromageId: number;
  fromageNom: string;
  recetteId: number;
  recetteNom: string;
  rendement: number;
}

export interface YieldAnalytics {
  nombreFabrications: number;
  moyenne: number | null;
  minimum: number | null;
  maximum: number | null;
  historique: YieldHistoryPoint[];
}

export interface SeasonYieldStatistics {
  nombreFabrications: number;
  moyenne: number | null;
  minimum: number | null;
  maximum: number | null;
  donneesDisponibles: boolean;
}

export interface SeasonalYieldComparison {
  fromageId: number;
  fromageNom: string;
  saisonSeche: SeasonYieldStatistics;
  saisonHumide: SeasonYieldStatistics;
}

export interface AnomalyDetail {
  parametre: AnomalyParameter;
  valeur: number;
  borneBasse: number;
  borneHaute: number;
  direction: AnomalyDirection;
  message: string;
}

export interface FabricationAnomaly {
  fabricationId: number;
  numeroLot: string;
  dateHeureDebut: string;
  fromageId: number;
  fromageNom: string;
  recetteId: number;
  recetteNom: string;
  statut: AnomalyAnalysisStatus;
  baselineUtilisee: string;
  nombreEchantillons: number;
  anomalies: AnomalyDetail[];
}

export interface AnomalyAnalytics {
  minimumEchantillons: number;
  anomalies: FabricationAnomaly[];
  donneesInsuffisantes: FabricationAnomaly[];
}
