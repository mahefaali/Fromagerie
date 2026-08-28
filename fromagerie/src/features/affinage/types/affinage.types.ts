import type { FabricationListItem } from "../../fabrications/types/fabrication.types";
import type { CaveApiResponse } from "./cave.types";

export type StatutLotAffinage =
  | "EN_ATTENTE_PLACEMENT"
  | "PARTIELLEMENT_PLACE"
  | "EN_AFFINAGE"
  | "TERMINE";

export type TypeSoinAffinage =
  | "RETOURNEMENT"
  | "LAVAGE"
  | "BROSSAGE"
  | "OBSERVATION"
  | "AUTRE";

export interface PlacementAffinage {
  id: number;
  caveId: number;
  caveNom: string;
  etagereId: number;
  etagereNumero: number;
  rangeeId: number;
  rangeeNumero: number;
  positionDebut: number;
  positionFin: number;
  quantite: number;
  dateDebut: string;
  dateFin: string | null;
  actif: boolean;
}

export interface SoinAffinage {
  id: number;
  type: TypeSoinAffinage;
  dateHeure: string;
  observation: string | null;
  etatCroute: string | null;
  utilisateurId: number;
  utilisateurNom: string;
}

export interface AffinageListItem {
  id: number;
  fabricationId: number;
  numeroLot: string;
  fromageNom: string;
  recetteNom: string;
  dateMiseEnCave: string;
  dateSortiePrevue: string;
  joursRestants: number;
  statut: StatutLotAffinage;
  quantiteInitiale: number;
  quantitePlacee: number;
  quantiteRestante: number;
  cavesActuelles: string[];
}

export interface AffinageDetail extends AffinageListItem {
  operateurNom: string;
  etatCroute: string | null;
  placementsActifs: PlacementAffinage[];
  historiquePlacements: PlacementAffinage[];
  soins: SoinAffinage[];
}

export interface AffinageAlertItem {
  lotId: number;
  fabricationId: number;
  numeroLot: string;
  fromageNom: string;
  recetteNom: string;
  dateSortiePrevue: string;
  joursRestants: number;
  statut: StatutLotAffinage;
  frequenceRetournementJours: number | null;
  caveNom: string;
  message: string;
  route: string;
}

export interface AffinageDashboard {
  retounementsAEffectuer: AffinageAlertItem[];
  retounementsEnRetard: AffinageAlertItem[];
  sortiesProches: AffinageAlertItem[];
  lotsPretsASortir: AffinageAlertItem[];
  changementsCaveRecommandes: AffinageAlertItem[];
  lotsEnAffinage: number;
  lotsPrets: number;
  placesLibres: number;
}

export interface CaveCapacityPlanning {
  caveId: number;
  caveNom: string;
  capaciteTotale: number;
  placesLibresMaintenant: number;
  placesLibresJ7: number;
  placesLibresJ30: number;
}

export interface AffinageCapacityPlanning {
  caves: CaveCapacityPlanning[];
}

export interface PlacementRequest {
  caveId: number;
  rangeeDepartId: number;
}

export interface CreateAffinageRequest {
  fabricationId: number;
  dateMiseEnCave: string;
  dateSortiePrevue: string;
  emplacementInitial: PlacementRequest;
}

export interface DeplacementRequest {
  caveDestinationId: number;
  rangeeDepartId: number;
}

export interface PlacementResult {
  quantiteDemandee: number;
  quantitePlacee: number;
  quantiteRestante: number;
  placementComplet: boolean;
  placementsCrees: PlacementAffinage[];
}

export interface SoinRequest {
  type: TypeSoinAffinage;
  dateHeure: string;
  observation: string | null;
  etatCroute: string | null;
}

export interface AffinageCatalog {
  fabrications: FabricationListItem[];
  caves: CaveApiResponse[];
}
