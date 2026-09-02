import { apiRequest } from "../../../services/http/apiClient";

export interface PerformanceIndicator { valeur: number | null; evolution: number | null }
export interface PerformanceDashboard {
  periode: { dateDebut: string; dateFin: string };
  periodePrecedente: { dateDebut: string; dateFin: string };
  rendementMoyen: PerformanceIndicator;
  tauxPerte: PerformanceIndicator;
  coutMoyenKg: PerformanceIndicator;
  margeBrute: PerformanceIndicator;
  rendementsParFromage: Array<{ fromageId: number; fromageNom: string; rendement: number | null }>;
  pertesParFromage: Array<{ fromageId: number; fromageNom: string; quantiteEntree: number; quantitePerdue: number; tauxPerte: number | null }>;
  evolutionCouts: Array<{ annee: number; mois: number; coutMoyenKg: number | null }>;
  evolutionMarges: Array<{ annee: number; mois: number; chiffreAffaires: number; coutAttribue: number; margeBrute: number }>;
  poidsMoyens: Array<{ fromageId: number; fromageNom: string; poidsMoyenKg: number | null }>;
  dureesAffinage: Array<{ fromageId: number; fromageNom: string; dureePrevueJours: number; dureeReelleJours: number; ecartJours: number }>;
}

export const performanceApi = {
  dashboard: (params: { dateDebut: string; dateFin: string; fromageId?: number }) => {
    const query = new URLSearchParams({ dateDebut: params.dateDebut, dateFin: params.dateFin });
    if (params.fromageId) query.set("fromageId", String(params.fromageId));
    return apiRequest<PerformanceDashboard>(`/api/performances/dashboard?${query}`);
  },
};
