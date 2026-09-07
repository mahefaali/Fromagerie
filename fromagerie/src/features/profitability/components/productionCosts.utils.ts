import type { LotProductionCost } from "../api/profitabilityApi";

export const COST_DEFINITIONS = [
  { label: "Lait", key: "coutLait", color: "#28551f" },
  { label: "Matières premières", key: "coutMatieres", color: "#82a563" },
  { label: "Emballages", key: "coutEmballage", color: "#d59736" },
  { label: "Énergie", key: "coutEnergie", color: "#c94b29" },
  { label: "Main-d’œuvre", key: "coutMainOeuvre", color: "#4f8293" },
  { label: "Amortissements", key: "coutAmortissement", color: "#756b57" },
] as const satisfies ReadonlyArray<{
  label: string;
  key: keyof LotProductionCost;
  color: string;
}>;

export interface CostCategory {
  label: string;
  key: (typeof COST_DEFINITIONS)[number]["key"];
  color: string;
  value: number;
}

export interface MonthlyProductionCost {
  order: string;
  mois: string;
  total: number;
  poids: number;
  coutKg: number;
}

export function filterProductionCostLots(lots: LotProductionCost[], dateDebut: string, dateFin: string, fromageId?: number) {
  return lots.filter((lot) => {
    const date = /^(\d{4}-\d{2}-\d{2})/.exec(lot.dateFabrication)?.[1];
    return date !== undefined && date >= dateDebut && date <= dateFin
      && (fromageId === undefined || lot.fromageId === fromageId);
  });
}

export function aggregateCostCategories(lots: LotProductionCost[]): CostCategory[] {
  return COST_DEFINITIONS.map((definition) => ({
    ...definition,
    value: lots.reduce((sum, lot) => sum + Number(lot[definition.key] ?? 0), 0),
  }));
}

export function aggregateMonthlyCosts(lots: LotProductionCost[]): MonthlyProductionCost[] {
  const months = new Map<string, Omit<MonthlyProductionCost, "coutKg">>();
  lots.forEach((lot) => {
    const datePart = /^(\d{4}-\d{2}-\d{2})/.exec(lot.dateFabrication)?.[1];
    if (!datePart) return;
    const date = new Date(`${datePart}T12:00:00`);
    if (!Number.isFinite(date.getTime())) return;
    const order = datePart.slice(0, 7);
    const current = months.get(order) ?? {
      order,
      mois: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date),
      total: 0,
      poids: 0,
    };
    current.total += Number(lot.coutTotal);
    current.poids += Number(lot.poidsTotal);
    months.set(order, current);
  });
  return [...months.values()]
    .sort((left, right) => left.order.localeCompare(right.order))
    .map((item) => ({ ...item, coutKg: item.poids > 0 ? item.total / item.poids : 0 }));
}
