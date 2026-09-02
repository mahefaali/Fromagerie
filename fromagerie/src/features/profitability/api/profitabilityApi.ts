import { apiRequest } from "../../../services/http/apiClient";

export interface ProfitabilitySummary {
  quantiteLivree: number;
  chiffreAffaires: number;
  coutAttribue: number;
  margeBrute: number;
  tauxRentabilite: number;
}

export interface ProfitabilityGroup extends ProfitabilitySummary {
  id: number;
  nom: string;
  coutProductionParKg?: number;
}

export interface CrossProfitability extends ProfitabilitySummary {
  fromageId: number;
  fromageNom: string;
  clientId: number;
  clientNom: string;
  prixVenteMoyen: number;
}

export interface ProfitabilityAnalysis {
  dateDebut: string;
  dateFin: string;
  synthese: ProfitabilitySummary;
  parFromage: ProfitabilityGroup[];
  parClient: ProfitabilityGroup[];
  croisee: CrossProfitability[];
}

export interface LotProductionCost {
  id: number;
  fabricationId: number;
  numeroLot: string;
  fromageId: number;
  fromageNom: string;
  recetteNom: string;
  dateFabrication: string;
  poidsTotal: number;
  nombreUnites: number;
  coutLait: number;
  coutMatieres: number;
  coutEmballage: number;
  coutEnergie: number;
  coutMainOeuvre: number;
  coutAmortissement: number;
  coutTotal: number;
  coutParKg: number;
  coutParUnite: number;
  dateCalcul: string;
}

export const profitabilityApi = {
  analyse: (params: { dateDebut: string; dateFin: string; fromageId?: number; clientId?: number }) => {
    const query = new URLSearchParams({ dateDebut: params.dateDebut, dateFin: params.dateFin });
    if (params.fromageId) query.set("fromageId", String(params.fromageId));
    if (params.clientId) query.set("clientId", String(params.clientId));
    return apiRequest<ProfitabilityAnalysis>(`/api/rentabilite/analyse?${query}`);
  },
  lots: () => apiRequest<LotProductionCost[]>("/api/couts-production/lots"),
};
