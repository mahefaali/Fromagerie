import type { AffinageDetail, SoinAffinage, TypeSoinAffinage } from "../../types/affinage.types";
import type { CaveApiResponse } from "../../types/cave.types";
import type { CareLogEntry, CareSummary } from "../AffinageCareJournal";
import type { LotAffinageDetail } from "../AffinageLotHeader";

export const CARE_LABELS: Record<TypeSoinAffinage, string> = {
  RETOURNEMENT: "Retournement",
  LAVAGE: "Lavage",
  BROSSAGE: "Brossage",
  OBSERVATION: "Observation",
  AUTRE: "Autre",
};

export function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00`).getTime();
  const endDate = new Date(`${end}T12:00:00`).getTime();
  return Math.max(0, Math.round((endDate - startDate) / 86_400_000));
}

export function toHeaderDetail(detail: AffinageDetail, caves: CaveApiResponse[]): LotAffinageDetail {
  const totalDays = Math.max(1, daysBetween(detail.dateMiseEnCave, detail.dateSortiePrevue));
  const daysElapsed = Math.min(totalDays, daysBetween(detail.dateMiseEnCave, new Date().toISOString().slice(0, 10)));
  const locations = detail.placementsActifs.map(
    (placement) => `${placement.caveNom} · E${placement.etagereNumero}-R${placement.rangeeNumero} · ${placement.positionDebut}-${placement.positionFin}`
  );
  const currentCave = caves.find((cave) => cave.id === detail.placementsActifs[0]?.caveId);

  return {
    id: String(detail.id),
    batchCode: detail.numeroLot,
    recipeName: detail.fromageNom,
    variant: detail.recetteNom,
    pieceCount: detail.quantiteInitiale,
    operator: detail.operateurNom,
    location: locations.length > 0 ? locations.join(" ; ") : "En attente de placement",
    entryDate: formatDate(detail.dateMiseEnCave),
    expectedExitDate: formatDate(detail.dateSortiePrevue),
    daysRemaining: detail.joursRestants,
    daysElapsed,
    totalDays,
    caveTargetInfo: currentCave
      ? `${currentCave.nom} · ${currentCave.temperature} °C · ${currentCave.humidite} % HR`
      : "Aucune cave active pour ce lot",
    quantityRemaining: detail.quantiteRestante,
    quantityPlaced: detail.quantitePlacee,
  };
}

export function toCareSummary(soins: SoinAffinage[], rindState: string | null): CareSummary {
  const lastFlip = soins.find((care) => care.type === "RETOURNEMENT");
  const lastWashing = soins.find((care) => care.type === "LAVAGE");
  return {
    lastFlip: lastFlip ? formatDate(lastFlip.dateHeure) : "Jamais",
    lastWashing: lastWashing ? formatDate(lastWashing.dateHeure) : "Jamais",
    rindState: rindState || "Non renseigné",
  };
}

export function toCareLogs(soins: SoinAffinage[]): CareLogEntry[] {
  return soins.map((care) => ({
    id: String(care.id),
    type: CARE_LABELS[care.type],
    date: formatDate(care.dateHeure),
    operator: care.utilisateurNom,
    rindState: care.etatCroute ?? undefined,
    notes: care.observation ?? undefined,
  }));
}

export function toCareType(label: string): TypeSoinAffinage {
  if (label === "Retournement") return "RETOURNEMENT";
  if (label === "Lavage") return "LAVAGE";
  if (label === "Brossage") return "BROSSAGE";
  if (label === "Observation") return "OBSERVATION";
  return "AUTRE";
}
