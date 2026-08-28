import { apiRequest } from "../../../services/http/apiClient";
import type {
  CreateFromageRequest,
  CreateMatierePremiereRequest,
  CreateRecetteRequest,
  CreateRecetteVersionRequest,
  FromageOption,
  MatierePremiere,
  RecetteDetail,
  RecetteFilters,
  RecetteHistoryItem,
  RecetteListItem,
} from "../types/recipe.types";

function listPath(filters: RecetteFilters = {}): string {
  const search = new URLSearchParams();
  if (filters.fromageId !== undefined) search.set("fromageId", String(filters.fromageId));
  if (filters.active !== undefined) search.set("active", String(filters.active));
  if (filters.nom?.trim()) search.set("nom", filters.nom.trim());
  const query = search.toString();
  return query ? `/api/recettes?${query}` : "/api/recettes";
}

export const recipeApi = {
  findAll: (filters?: RecetteFilters): Promise<RecetteListItem[]> =>
    apiRequest<RecetteListItem[]>(listPath(filters)),

  findById: (id: number): Promise<RecetteDetail> =>
    apiRequest<RecetteDetail>(`/api/recettes/${id}`),

  create: (request: CreateRecetteRequest): Promise<RecetteDetail> =>
    apiRequest<RecetteDetail>("/api/recettes", { method: "POST", json: request }),

  createVersion: (id: number, request: CreateRecetteVersionRequest): Promise<RecetteDetail> =>
    apiRequest<RecetteDetail>(`/api/recettes/${id}/versions`, {
      method: "POST",
      json: request,
    }),

  findHistory: (id: number): Promise<RecetteHistoryItem[]> =>
    apiRequest<RecetteHistoryItem[]>(`/api/recettes/${id}/historique`),

  findMaterials: (): Promise<MatierePremiere[]> =>
    apiRequest<MatierePremiere[]>("/api/matieres-premieres"),

  findCheeses: (): Promise<FromageOption[]> =>
    apiRequest<FromageOption[]>("/api/fromages"),

  createCheese: (request: CreateFromageRequest): Promise<FromageOption> =>
    apiRequest<FromageOption>("/api/fromages", { method: "POST", json: request }),

  createMaterial: (request: CreateMatierePremiereRequest): Promise<MatierePremiere> =>
    apiRequest<MatierePremiere>("/api/matieres-premieres", { method: "POST", json: request }),
};
