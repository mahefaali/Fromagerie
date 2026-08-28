import { apiRequest } from "../../../services/http/apiClient";
import {
  buildEmplacements,
  type Cave,
  type EtagereConfig,
} from "../../../services/production-store";
import type { CaveApiRequest, CaveApiResponse, CaveOccupation } from "../types/cave.types";

function toCave(response: CaveApiResponse): Cave {
  const etageres: EtagereConfig[] = response.etageres.map((etagere) => ({
    label: String(etagere.numero),
    nbRangees: etagere.rangees.length,
    nbPositions: etagere.rangees[0]?.capacite ?? 0,
    rangees: etagere.rangees.map((rangee) => ({
      numero: rangee.numero,
      ordre: rangee.ordre,
      capacite: rangee.capacite,
    })),
  }));

  return {
    id: String(response.id),
    nom: response.nom,
    description: response.description ?? "",
    temperatureCible: response.temperature,
    humiditeCible: response.humidite,
    ageMinJours: response.ageMinJours,
    ageMaxJours: response.ageMaxJours,
    active: response.active,
    capaciteOccupee: response.capaciteOccupee,
    capaciteDisponible: response.capaciteDisponible,
    etageres,
    emplacements: buildEmplacements(etageres),
  };
}

function toRequest(cave: Cave): CaveApiRequest {
  return {
    nom: cave.nom,
    description: cave.description,
    temperature: cave.temperatureCible,
    humidite: cave.humiditeCible,
    ageMinJours: cave.ageMinJours,
    ageMaxJours: cave.ageMaxJours,
    active: cave.active,
    etageres: cave.etageres.map((etagere, etagereIndex) => ({
      numero: Number(etagere.label) || etagereIndex + 1,
      ordre: etagereIndex + 1,
      rangees: etagere.rangees ?? Array.from(
        { length: etagere.nbRangees },
        (_, rangeeIndex) => ({
          numero: rangeeIndex + 1,
          ordre: rangeeIndex + 1,
          capacite: etagere.nbPositions,
        }),
      ),
    })),
  };
}

export const caveApi = {
  findAll: async (): Promise<Cave[]> =>
    (await apiRequest<CaveApiResponse[]>("/api/caves")).map(toCave),

  findOccupations: (id: string): Promise<CaveOccupation[]> =>
    apiRequest<CaveOccupation[]>(`/api/caves/${id}/occupations`),

  create: async (cave: Cave): Promise<Cave> =>
    toCave(await apiRequest<CaveApiResponse>("/api/caves", {
      method: "POST",
      json: toRequest(cave),
    })),

  update: async (cave: Cave): Promise<Cave> =>
    toCave(await apiRequest<CaveApiResponse>(`/api/caves/${cave.id}`, {
      method: "PUT",
      json: toRequest(cave),
    })),

  remove: (id: string): Promise<void> =>
    apiRequest<void>(`/api/caves/${id}`, { method: "DELETE" }),
};
