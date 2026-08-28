import { apiRequest } from "../../../services/http/apiClient";
import type {
  CreateFabricationRequest,
  AnomalyAnalytics,
  AnomalyParameter,
  FabricationAnalyticsFilters,
  FabricationDetail,
  FabricationListItem,
  SeasonalYieldComparison,
  TemperatureHistoryPoint,
  UpdateFabricationRequest,
  YieldAnalytics,
} from "../types/fabrication.types";
import type { RecetteListItem } from "../types/recipe.types";

function analyticsPath(
  path: string,
  filters: FabricationAnalyticsFilters,
  parameter?: AnomalyParameter,
): string {
  const search = new URLSearchParams();
  if (filters.fromageId !== undefined) search.set("fromageId", String(filters.fromageId));
  if (filters.recetteId !== undefined) search.set("recetteId", String(filters.recetteId));
  if (filters.dateDebut) search.set("dateDebut", filters.dateDebut);
  if (filters.dateFin) search.set("dateFin", filters.dateFin);
  if (parameter) search.set("parametre", parameter);
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const fabricationApi = {
  findAll: (): Promise<FabricationListItem[]> =>
    apiRequest<FabricationListItem[]>("/api/fabrications"),

  findById: (id: number): Promise<FabricationDetail> =>
    apiRequest<FabricationDetail>(`/api/fabrications/${id}`),

  create: (request: CreateFabricationRequest): Promise<FabricationDetail> =>
    apiRequest<FabricationDetail>("/api/fabrications", {
      method: "POST",
      json: request,
    }),

  update: (id: number, request: UpdateFabricationRequest): Promise<FabricationDetail> =>
    apiRequest<FabricationDetail>(`/api/fabrications/${id}`, {
      method: "PUT",
      json: request,
    }),

  findRecettes: (): Promise<RecetteListItem[]> =>
    apiRequest<RecetteListItem[]>("/api/recettes"),

  findTemperatureHistory: (
    filters: FabricationAnalyticsFilters,
  ): Promise<TemperatureHistoryPoint[]> =>
    apiRequest<TemperatureHistoryPoint[]>(
      analyticsPath("/api/fabrications/analytics/temperatures", filters),
    ),

  findYieldAnalytics: (filters: FabricationAnalyticsFilters): Promise<YieldAnalytics> =>
    apiRequest<YieldAnalytics>(
      analyticsPath("/api/fabrications/analytics/rendements", filters),
    ),

  findSeasonalYieldComparison: (
    fromageId: number,
    filters: Omit<FabricationAnalyticsFilters, "fromageId">,
  ): Promise<SeasonalYieldComparison> =>
    apiRequest<SeasonalYieldComparison>(
      analyticsPath("/api/fabrications/analytics/rendements/saisons", {
        ...filters,
        fromageId,
      }),
    ),

  findAnomalies: (
    filters: FabricationAnalyticsFilters,
    parameter?: AnomalyParameter,
  ): Promise<AnomalyAnalytics> =>
    apiRequest<AnomalyAnalytics>(
      analyticsPath("/api/fabrications/analytics/anomalies", filters, parameter),
    ),
};
