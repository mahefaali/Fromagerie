import { describe, expect, it } from "vitest";

import type { LotProductionCost, ProfitabilityGroup } from "../../profitability/api/profitabilityApi";
import { calculateCosts, getMostProfitable, getPeriodDates, toIsoDate } from "./ownerPerformance.utils";

describe("owner performance utilities", () => {
  it("calcule les bornes des périodes relativement à la date fournie", () => {
    const today = new Date(2026, 8, 7);

    expect(getPeriodDates("previous-month", today)).toEqual({
      start: new Date(2026, 7, 1),
      end: new Date(2026, 7, 31),
    });
    expect(toIsoDate(getPeriodDates("year", today).start)).toBe("2026-01-01");
  });

  it("agrège uniquement les coûts des lots inclus dans les filtres", () => {
    const included = lot({ dateFabrication: "2026-09-05T10:30:00", fromageId: 2, coutLait: 10, coutEnergie: 4 });
    const wrongCheese = lot({ dateFabrication: "2026-09-05", fromageId: 3, coutLait: 100 });
    const outsidePeriod = lot({ dateFabrication: "2026-08-31", fromageId: 2, coutLait: 100 });

    const result = calculateCosts([included, wrongCheese, outsidePeriod], "2026-09-01", "2026-09-30", 2);

    expect(result.total).toBe(14);
    expect(result.items.find((item) => item.label === "Lait")?.value).toBe(10);
    expect(result.items.find((item) => item.label === "Énergie")?.value).toBe(4);
  });

  it("classe les trois fromages les plus rentables sans muter la source", () => {
    const rows = [group(1, 20), group(2, 80), group(3, 40), group(4, 60)];

    expect(getMostProfitable(rows).map((row) => row.id)).toEqual([2, 4, 3]);
    expect(rows.map((row) => row.id)).toEqual([1, 2, 3, 4]);
  });
});

function lot(overrides: Partial<LotProductionCost>): LotProductionCost {
  return {
    id: 1,
    fabricationId: 1,
    numeroLot: "LOT-1",
    fromageId: 1,
    fromageNom: "Tomme",
    recetteNom: "Classique",
    dateFabrication: "2026-09-01",
    poidsTotal: 1,
    nombreUnites: 1,
    coutLait: 0,
    coutMatieres: 0,
    coutEmballage: 0,
    coutEnergie: 0,
    coutMainOeuvre: 0,
    coutAmortissement: 0,
    coutTotal: 0,
    coutParKg: 0,
    coutParUnite: 0,
    dateCalcul: "2026-09-01",
    ...overrides,
  };
}

function group(id: number, tauxRentabilite: number): ProfitabilityGroup {
  return { id, nom: `Fromage ${id}`, quantiteLivree: 0, chiffreAffaires: 0, coutAttribue: 0, margeBrute: 0, tauxRentabilite };
}
