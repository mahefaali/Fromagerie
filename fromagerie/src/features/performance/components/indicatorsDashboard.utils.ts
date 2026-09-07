import type { PerformanceDashboard } from "../api/performanceApi";

export interface IndicatorDetail {
  id: number;
  name: string;
  yield: number | null;
  weight: number | null;
  loss: number | null;
  expected: number | null;
  actual: number | null;
  gap: number | null;
}

export function average(values: Array<number | null | undefined>): number | null {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value));
  return valid.length > 0 ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(year, month - 1));
}

export function mergeIndicatorDetails(data: PerformanceDashboard | null): IndicatorDetail[] {
  const rows = new Map<number, IndicatorDetail>();
  const getRow = (id: number, name: string) => {
    const existing = rows.get(id);
    if (existing) return existing;
    const created = { id, name, yield: null, weight: null, loss: null, expected: null, actual: null, gap: null };
    rows.set(id, created);
    return created;
  };

  data?.rendementsParFromage.forEach((item) => {
    getRow(item.fromageId, item.fromageNom).yield = item.rendement;
  });
  data?.poidsMoyens.forEach((item) => {
    getRow(item.fromageId, item.fromageNom).weight = item.poidsMoyenKg;
  });
  data?.pertesParFromage.forEach((item) => {
    getRow(item.fromageId, item.fromageNom).loss = item.tauxPerte;
  });
  data?.dureesAffinage.forEach((item) => {
    const row = getRow(item.fromageId, item.fromageNom);
    row.expected = item.dureePrevueJours;
    row.actual = item.dureeReelleJours;
    row.gap = item.ecartJours;
  });

  return [...rows.values()].sort((left, right) => left.name.localeCompare(right.name, "fr"));
}
