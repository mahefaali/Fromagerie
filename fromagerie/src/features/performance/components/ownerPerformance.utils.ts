import type { PerformanceDashboard } from "../api/performanceApi";
import type { LotProductionCost, ProfitabilityGroup } from "../../profitability/api/profitabilityApi";

export type Period = "month" | "previous-month" | "three-months" | "six-months" | "year" | "custom";
export type CostItem = { label: string; color: string; value: number };
export type ChartPoint = { mois: string; cout: number | null; marge: number | null };

export const OWNER_CARD_CLASS = "rounded-2xl border-[#d9d0c1] bg-[#f5efe4] shadow-[0_1px_3px_rgba(67,52,33,0.12)]";

const money = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export const formatMoney = (value: number): string => money.format(value);
export const formatNumber = (value: number): string => number.format(value);

const COST_CATEGORIES = [
  { label: "Lait", key: "coutLait", color: "#28551f" },
  { label: "Main-d’œuvre", key: "coutMainOeuvre", color: "#4f8293" },
  { label: "Matières premières", key: "coutMatieres", color: "#82a563" },
  { label: "Énergie", key: "coutEnergie", color: "#c94b29" },
  { label: "Emballages", key: "coutEmballage", color: "#d59736" },
  { label: "Amortissements", key: "coutAmortissement", color: "#756b57" },
] as const satisfies ReadonlyArray<{
  label: string;
  key: keyof LotProductionCost;
  color: string;
}>;

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPeriodDates(period: Exclude<Period, "custom">, today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth();

  if (period === "previous-month") {
    return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
  }
  if (period === "three-months") {
    return { start: new Date(year, month - 2, 1), end: today };
  }
  if (period === "six-months") {
    return { start: new Date(year, month - 5, 1), end: today };
  }
  if (period === "year") {
    return { start: new Date(year, 0, 1), end: today };
  }
  return { start: new Date(year, month, 1), end: today };
}

export function calculateCosts(
  lots: LotProductionCost[],
  dateDebut: string,
  dateFin: string,
  fromageId?: number,
) {
  const filteredLots = lots.filter((lot) => {
    const date = /^(\d{4}-\d{2}-\d{2})/.exec(lot.dateFabrication)?.[1];
    return date !== undefined
      && date >= dateDebut
      && date <= dateFin
      && (fromageId === undefined || lot.fromageId === fromageId);
  });
  const items: CostItem[] = COST_CATEGORIES.map((category) => ({
    label: category.label,
    color: category.color,
    value: filteredLots.reduce((sum, lot) => sum + Number(lot[category.key] ?? 0), 0),
  }));

  return { items, total: items.reduce((sum, item) => sum + item.value, 0) };
}

export function createChartData(performance: PerformanceDashboard | null): ChartPoint[] {
  if (!performance) return [];

  return performance.evolutionCouts.map((cost) => {
    const margin = performance.evolutionMarges.find(
      (item) => item.annee === cost.annee && item.mois === cost.mois,
    );
    const mois = new Intl.DateTimeFormat("fr-FR", { month: "short" })
      .format(new Date(cost.annee, cost.mois - 1));
    return { mois, cout: cost.coutMoyenKg, marge: margin?.margeBrute ?? null };
  });
}

export function getMostProfitable(rows: ProfitabilityGroup[]): ProfitabilityGroup[] {
  return [...rows].sort((a, b) => b.tauxRentabilite - a.tauxRentabilite).slice(0, 3);
}
