import { apiRequest } from "../../../services/http/apiClient";
import type { FabricationListItem } from "../../fabrications/types/fabrication.types";
import type {
  AffinageCapacityPlanning,
  AffinageDashboard,
  AffinageDetail,
  AffinageListItem,
  CreateAffinageRequest,
  DeplacementRequest,
  PlacementRequest,
  PlacementResult,
  SoinAffinage,
  SoinRequest,
} from "../types/affinage.types";
import type { CaveApiResponse } from "../types/cave.types";

export const affinageApi = {
  findAll: (): Promise<AffinageListItem[]> =>
    apiRequest<AffinageListItem[]>("/api/affinages"),

  dashboard: (): Promise<AffinageDashboard> =>
    apiRequest<AffinageDashboard>("/api/affinages/dashboard"),

  planification: (): Promise<AffinageCapacityPlanning> =>
    apiRequest<AffinageCapacityPlanning>("/api/affinages/planification"),

  findById: (id: number): Promise<AffinageDetail> =>
    apiRequest<AffinageDetail>(`/api/affinages/${id}`),

  create: (request: CreateAffinageRequest): Promise<AffinageDetail> =>
    apiRequest<AffinageDetail>("/api/affinages", { method: "POST", json: request }),

  place: (id: number, request: PlacementRequest): Promise<PlacementResult> =>
    apiRequest<PlacementResult>(`/api/affinages/${id}/placements`, {
      method: "POST",
      json: request,
    }),

  move: (id: number, request: DeplacementRequest): Promise<PlacementResult> =>
    apiRequest<PlacementResult>(`/api/affinages/${id}/deplacement`, {
      method: "POST",
      json: request,
    }),

  addCare: (id: number, request: SoinRequest): Promise<SoinAffinage> =>
    apiRequest<SoinAffinage>(`/api/affinages/${id}/soins`, {
      method: "POST",
      json: request,
    }),

  findFabrications: (): Promise<FabricationListItem[]> =>
    apiRequest<FabricationListItem[]>("/api/fabrications"),

  findCaves: (): Promise<CaveApiResponse[]> =>
    apiRequest<CaveApiResponse[]>("/api/caves"),
};
