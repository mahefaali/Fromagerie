import { apiRequest } from "../../../services/http/apiClient";

export type Saison = "SECHE" | "HUMIDE";
export type EtapeEmballage = "AFFINAGE" | "PREPARATION_VENTE";
export type TypeOperationEnergie = "CHAUFFE" | "AFFINAGE_CAVE" | "CHAMBRE_FROIDE";
export type UniteCalculEnergie = "PAR_HEURE" | "PAR_FROMAGE_PAR_JOUR" | "PAR_FABRICATION";
export type TypeOperationMainOeuvre = "FABRICATION" | "RETOURNEMENT" | "LAVAGE" | "PREPARATION_VENTE";

export interface TarifLait {
  id: number;
  saison: Saison;
  prixParLitre: number;
  dateDebutValidite: string;
  dateFinValidite: string | null;
  actif: boolean;
}

export interface TarifLaitRequest {
  saison: Saison;
  prixParLitre: number;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
  actif?: boolean;
}

export interface Emballage {
  id: number;
  nom: string;
  coutUnitaire: number;
  unite: string;
  actif: boolean;
}

export interface EmballageRequest {
  nom: string;
  coutUnitaire: number;
  unite: string;
  actif?: boolean;
}

export interface ConfigurationEmballage {
  id: number;
  fromageId: number;
  fromageNom: string;
  emballageId: number;
  emballageNom: string;
  quantiteParUnite: number;
  actif: boolean;
}

export interface ConfigurationEmballageRequest {
  fromageId: number;
  emballageId: number;
  quantiteParUnite: number;
  actif?: boolean;
}

export interface RegleCoutEnergie {
  id: number;
  typeOperation: TypeOperationEnergie;
  coutStandard: number;
  uniteCalcul: UniteCalculEnergie;
  dateDebutValidite: string;
  dateFinValidite: string | null;
  actif: boolean;
}

export interface RegleCoutEnergieRequest {
  typeOperation: TypeOperationEnergie;
  coutStandard: number;
  uniteCalcul: UniteCalculEnergie;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
  actif?: boolean;
}

export interface RegleMainOeuvre {
  id: number;
  typeOperation: TypeOperationMainOeuvre;
  dureeStandardMinutes: number;
  coutHoraire: number;
  dateDebutValidite: string;
  dateFinValidite: string | null;
  actif: boolean;
}

export interface RegleMainOeuvreRequest {
  typeOperation: TypeOperationMainOeuvre;
  dureeStandardMinutes: number;
  coutHoraire: number;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
  actif?: boolean;
}

export interface Equipement {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
}

export interface EquipementRequest {
  nom: string;
  description?: string | null;
  actif?: boolean;
}

export interface RegleAmortissement {
  id: number;
  equipementId: number;
  equipementNom: string;
  coutParFabrication: number;
  dateDebutValidite: string;
  dateFinValidite: string | null;
  actif: boolean;
}

export interface RegleAmortissementRequest {
  equipementId: number;
  coutParFabrication: number;
  dateDebutValidite: string;
  dateFinValidite?: string | null;
  actif?: boolean;
}

export const costsApi = {
  listTarifsLait: () => apiRequest<TarifLait[]>("/api/configuration/couts/lait"),
  createTarifLait: (request: TarifLaitRequest) =>
    apiRequest<TarifLait>("/api/configuration/couts/lait", { method: "POST", json: request }),
  updateTarifLait: (id: number, request: TarifLaitRequest) =>
    apiRequest<TarifLait>(`/api/configuration/couts/lait/${id}`, { method: "PUT", json: request }),

  listEmballages: () => apiRequest<Emballage[]>("/api/configuration/couts/emballages"),
  createEmballage: (request: EmballageRequest) =>
    apiRequest<Emballage>("/api/configuration/couts/emballages", { method: "POST", json: request }),
  updateEmballage: (id: number, request: EmballageRequest) =>
    apiRequest<Emballage>(`/api/configuration/couts/emballages/${id}`, { method: "PUT", json: request }),
  listConfigurationsEmballages: () =>
    apiRequest<ConfigurationEmballage[]>("/api/configuration/couts/configurations-emballages"),
  createConfigurationEmballage: (request: ConfigurationEmballageRequest) =>
    apiRequest<ConfigurationEmballage>("/api/configuration/couts/configurations-emballages", { method: "POST", json: request }),
  listFromages: () => apiRequest<{ id: number; nom: string }[]>("/api/fromages"),

  listEnergie: () => apiRequest<RegleCoutEnergie[]>("/api/configuration/couts/energie"),
  createEnergie: (request: RegleCoutEnergieRequest) =>
    apiRequest<RegleCoutEnergie>("/api/configuration/couts/energie", { method: "POST", json: request }),
  updateEnergie: (id: number, request: RegleCoutEnergieRequest) =>
    apiRequest<RegleCoutEnergie>(`/api/configuration/couts/energie/${id}`, { method: "PUT", json: request }),

  listMainOeuvre: () => apiRequest<RegleMainOeuvre[]>("/api/configuration/couts/main-oeuvre"),
  createMainOeuvre: (request: RegleMainOeuvreRequest) =>
    apiRequest<RegleMainOeuvre>("/api/configuration/couts/main-oeuvre", { method: "POST", json: request }),
  updateMainOeuvre: (id: number, request: RegleMainOeuvreRequest) =>
    apiRequest<RegleMainOeuvre>(`/api/configuration/couts/main-oeuvre/${id}`, { method: "PUT", json: request }),

  listEquipements: () => apiRequest<Equipement[]>("/api/configuration/couts/equipements"),
  createEquipement: (request: EquipementRequest) =>
    apiRequest<Equipement>("/api/configuration/couts/equipements", { method: "POST", json: request }),
  updateEquipement: (id: number, request: EquipementRequest) =>
    apiRequest<Equipement>(`/api/configuration/couts/equipements/${id}`, { method: "PUT", json: request }),

  listAmortissements: () => apiRequest<RegleAmortissement[]>("/api/configuration/couts/amortissements"),
  createAmortissement: (request: RegleAmortissementRequest) =>
    apiRequest<RegleAmortissement>("/api/configuration/couts/amortissements", { method: "POST", json: request }),
  updateAmortissement: (id: number, request: RegleAmortissementRequest) =>
    apiRequest<RegleAmortissement>(`/api/configuration/couts/amortissements/${id}`, { method: "PUT", json: request }),
};
