import { apiRequest, HttpError, refreshCsrfToken } from "../../../services/http/apiClient";

export interface ClientOption { id: number; nom: string; typeClient: string; telephone: string | null; adresse: string | null; actif: boolean; }
export interface ReservationApi { id: number; ligneCommandeId: number; stockId: number; lot: string; fromage: string; emplacement: string; quantiteReservee: number; quantiteDisponible: number; }
export interface LivraisonLigneApi { reservationId: number; quantitePrevue: number; quantiteLivree: number; ecart: number; }
export interface LivraisonApi { dateLivraison: string; observations: string | null; lignes: LivraisonLigneApi[]; }
export interface FactureApi { id: number; numeroFacture: string; commandeId: number; dateFacture: string; total: number; modePaiement: string; }
export interface CommandeApi { id: number; numeroCommande: string; client: ClientOption; dateCommande: string; dateLivraisonSouhaitee: string; statut: string; observations: string | null; lignes: { id: number; fromageId: number; fromageNom: string; quantiteCommandee: number; prixUnitaire: number; reservations: ReservationApi[] }[]; livraison: LivraisonApi | null; facture: FactureApi | null; }

export interface EmplacementStock {
  id: number;
  nom: string;
  description: string | null;
  active: boolean;
}

export interface StockMouvement {
  id: number;
  type: "ENTREE" | "SORTIE" | "AJUSTEMENT" | "VENTE";
  quantite: number;
  utilisateurId: number;
  utilisateurNom: string;
  dateMouvement: string;
  commentaire: string | null;
}

export interface StockFromageFini {
  id: number;
  lotAffinageId: number;
  numeroLotFabrication: string;
  fromageNom: string;
  emplacementStockId: number;
  emplacementStockNom: string;
  dateEntreeStock: string;
  quantiteInitiale: number;
  quantitePhysique: number;
  vendable: boolean;
  typeDateDurabilite: "DLC" | "DDM";
  dateDurabilite: string;
  statut: "DISPONIBLE" | "EPUISE" | "BLOQUE";
  mouvements: StockMouvement[];
}

export type LossType = "INVENDU" | "RETOUR_CLIENT" | "DEFAUT_AFFINAGE" | "DLC_DDM_DEPASSEE" | "AUTRE";
export interface ProductionCostApi {
  fromageId: number;
  fromageNom: string;
  coutUnitaire: string | number | null;
  dateMiseAJour: string | null;
  utilisateurNom: string | null;
}
export interface StockLossApi {
  id: number;
  stockId: number;
  reservationId: number | null;
  numeroLot: string;
  fromageNom: string;
  quantite: number;
  typePerte: LossType;
  motif: string;
  dateHeure: string;
  coutUnitaireReference: string | number;
  coutTotal: string | number;
  utilisateurNom: string;
}

export interface SortieAffinageRequest {
  emplacementStockId: number;
  dateEntreeStock: string;
  typeDateDurabilite: "DLC" | "DDM";
  dateDurabilite: string;
  commentaire?: string;
}

export interface EmplacementStockRequest {
  nom: string;
  description?: string;
  active?: boolean;
}

export const stockApi = {
  findEmplacements: (): Promise<EmplacementStock[]> =>
    apiRequest<EmplacementStock[]>("/api/emplacements-stock"),
  createEmplacement: (request: EmplacementStockRequest): Promise<EmplacementStock> =>
    apiRequest<EmplacementStock>("/api/emplacements-stock", { method: "POST", json: request }),
  findStocks: (): Promise<StockFromageFini[]> =>
    apiRequest<StockFromageFini[]>("/api/stock-fromages-finis"),
  createLoss: async (stockId: number, json: { quantite: number; typePerte: LossType; motif?: string; reservationId?: number }): Promise<StockLossApi> => {
    await refreshCsrfToken();
    try {
      return await apiRequest<StockLossApi>(`/api/stock-fromages-finis/${stockId}/pertes`, { method: "POST", json });
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 403) {
        throw error;
      }
      await refreshCsrfToken();
      return apiRequest<StockLossApi>(`/api/stock-fromages-finis/${stockId}/pertes`, { method: "POST", json });
    }
  },
  listLosses: (): Promise<StockLossApi[]> => apiRequest<StockLossApi[]>("/api/pertes"),
  listCosts: (): Promise<ProductionCostApi[]> => apiRequest<ProductionCostApi[]>("/api/couts-production-manuels"),
  updateCost: (fromageId: number, json: { coutUnitaire: number }): Promise<ProductionCostApi> =>
    apiRequest<ProductionCostApi>(`/api/couts-production-manuels/${fromageId}`, { method: "PUT", json }),
  sortirAffinage: async (lotId: number, request: SortieAffinageRequest): Promise<StockFromageFini> => {
    await refreshCsrfToken();
    try {
      return await apiRequest<StockFromageFini>(`/api/affinages/${lotId}/sortie-stock`, {
        method: "POST",
        json: request,
      });
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 403) {
        throw error;
      }
      await refreshCsrfToken();
      return apiRequest<StockFromageFini>(`/api/affinages/${lotId}/sortie-stock`, {
        method: "POST",
        json: request,
      });
    }
  },
};

export const orderApi = {
  findClients: (): Promise<ClientOption[]> => apiRequest<ClientOption[]>('/api/clients'),
  findFromages: (): Promise<{ id: number; nom: string }[]> => apiRequest<{ id: number; nom: string }[]>('/api/fromages'),
  createClient: (json: unknown): Promise<ClientOption> => apiRequest<ClientOption>('/api/clients', { method: 'POST', json }),
  findAll: (): Promise<CommandeApi[]> => apiRequest<CommandeApi[]>('/api/commandes'),
  create: (json: unknown): Promise<CommandeApi> => apiRequest<CommandeApi>('/api/commandes', { method: 'POST', json }),
  prepare: (id: number): Promise<CommandeApi> => apiRequest<CommandeApi>(`/api/commandes/${id}/preparation`, { method: 'POST' }),
  confirm: (id: number): Promise<CommandeApi> => apiRequest<CommandeApi>(`/api/commandes/${id}/confirmation`, { method: 'POST' }),
  deliver: (id: number, json: unknown): Promise<CommandeApi> => apiRequest<CommandeApi>(`/api/commandes/${id}/livraison`, { method: 'POST', json }),
  invoice: (id: number, json: unknown): Promise<FactureApi> => apiRequest<FactureApi>(`/api/commandes/${id}/facture`, { method: 'POST', json }),
  cancel: (id: number) => apiRequest(`/api/commandes/${id}/annulation`, { method: 'POST' }),
};
