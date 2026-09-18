import { buildEmplacements, capaciteFor, newId, type Cave, type EtagereConfig } from "../../domain/cave";

export interface CaveFormValues {
  nom: string;
  description: string;
  etageres: EtagereConfig[];
  temperature: number;
  humidite: number;
  ageMinJours: number;
  ageMaxJours: number;
  active: boolean;
}

export const defaultShelf = (): EtagereConfig => ({ label: "1", nbRangees: 2, nbPositions: 4 });

export function initialCaveForm(cave: Cave | null): CaveFormValues {
  return {
    nom: cave?.nom ?? "",
    description: cave?.description ?? "",
    etageres: cave?.etageres.map((shelf) => ({ ...shelf })) ?? [defaultShelf()],
    temperature: cave?.temperatureCible ?? 12,
    humidite: cave?.humiditeCible ?? 90,
    ageMinJours: cave?.ageMinJours ?? 1,
    ageMaxJours: cave?.ageMaxJours ?? 30,
    active: cave?.active ?? true,
  };
}

export function normalizedShelves(shelves: EtagereConfig[]): EtagereConfig[] {
  return shelves.filter((shelf) => shelf.label.trim()).map((shelf) => ({
    label: shelf.label.trim().toUpperCase(),
    nbRangees: Math.max(1, Number(shelf.nbRangees) || 1),
    nbPositions: Math.max(1, Number(shelf.nbPositions) || 1),
    rangees: shelf.rangees,
  }));
}

export function buildCaveFromForm(values: CaveFormValues, initial: Cave | null): Cave | null {
  const etageres = normalizedShelves(values.etageres);
  if (!values.nom.trim() || etageres.length === 0 || values.ageMaxJours <= values.ageMinJours) return null;
  const capacity = capaciteFor(etageres);
  const occupied = initial?.capaciteOccupee ?? 0;
  return {
    id: initial?.id ?? newId(),
    nom: values.nom.trim(),
    description: values.description.trim(),
    etageres,
    temperatureCible: Number(values.temperature) || 0,
    humiditeCible: Number(values.humidite) || 0,
    ageMinJours: Number(values.ageMinJours) || 0,
    ageMaxJours: Number(values.ageMaxJours) || 0,
    active: values.active,
    capaciteOccupee: occupied,
    capaciteDisponible: Math.max(0, capacity - occupied),
    emplacements: buildEmplacements(etageres, initial?.emplacements ?? []),
  };
}
