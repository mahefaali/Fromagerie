import { describe, expect, it } from "vitest";

import type { LotProductionCost } from "../api/profitabilityApi";
import { aggregateCostCategories, aggregateMonthlyCosts, filterProductionCostLots } from "./productionCosts.utils";

describe("production costs utilities", () => {
  it("filtre les lots par période et fromage", () => {
    const lots = [lot({ id: 1, fromageId: 2, dateFabrication: "2026-08-15T10:00:00" }), lot({ id: 2, fromageId: 3 }), lot({ id: 3, fromageId: 2, dateFabrication: "2026-07-31" })];
    expect(filterProductionCostLots(lots, "2026-08-01", "2026-08-31", 2).map((item) => item.id)).toEqual([1]);
  });

  it("agrège les catégories sans utiliser le coût total pré-calculé", () => {
    const categories = aggregateCostCategories([lot({ coutLait: 10, coutMatieres: 5, coutTotal: 999 })]);
    expect(categories.find((item) => item.key === "coutLait")?.value).toBe(10);
    expect(categories.reduce((sum, item) => sum + item.value, 0)).toBe(15);
  });

  it("regroupe les coûts par mois et calcule le coût au kg", () => {
    const months = aggregateMonthlyCosts([lot({ coutTotal: 100, poidsTotal: 10 }), lot({ id: 2, coutTotal: 50, poidsTotal: 5 })]);
    expect(months).toHaveLength(1);
    expect(months[0]).toMatchObject({ order: "2026-08", total: 150, poids: 15, coutKg: 10 });
  });
});

function lot(overrides: Partial<LotProductionCost> = {}): LotProductionCost {
  return { id: 1, fabricationId: 1, numeroLot: "L1", fromageId: 2, fromageNom: "Tomme", recetteNom: "Tomme", dateFabrication: "2026-08-10", poidsTotal: 1, nombreUnites: 1, coutLait: 0, coutMatieres: 0, coutEmballage: 0, coutEnergie: 0, coutMainOeuvre: 0, coutAmortissement: 0, coutTotal: 0, coutParKg: 0, coutParUnite: 0, dateCalcul: "2026-08-10", ...overrides };
}
