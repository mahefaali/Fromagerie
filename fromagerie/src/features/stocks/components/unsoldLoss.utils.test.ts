import { describe, expect, it } from "vitest";

import type { LotProductionCost } from "../../profitability/api/profitabilityApi";
import type { StockFromageFini, StockLossApi } from "../api/stockApi";
import type { LossLogEntry } from "./unsoldLoss.types";
import { calculateAgingDefectQuantity, calculateAverageProductionCosts, calculateMonthlyLossRates, mapLossToLogEntry, summarizeLossCauses } from "./unsoldLoss.utils";

describe("unsold loss utilities", () => {
  it("calcule le taux mensuel à partir des entrées et des pertes", () => {
    const rates = calculateMonthlyLossRates(
      [stock({ fromageNom: "Tomme", dateEntreeStock: "2026-08-02", quantiteInitiale: 40 })],
      [loss({ cheeseName: "Tomme", dateIso: "2026-08-20T10:00:00", quantity: 5, totalCost: 25 })],
    );

    expect(rates).toHaveLength(1);
    expect(rates[0]).toMatchObject({ cheeseName: "Tomme", month: "2026-08", enteredQuantity: 40, lostQuantity: 5, lostCost: 25, lossRate: 12.5 });
  });

  it("regroupe les pertes par fromage et par cause", () => {
    const summaries = summarizeLossCauses([
      loss({ quantity: 2, totalCost: 10 }),
      loss({ quantity: 3, totalCost: 15 }),
      loss({ badgeText: "Péremption", quantity: 1, totalCost: 5 }),
    ]);

    expect(summaries).toEqual([
      { name: "Tomme", badgeText: "Défaut", totalQty: 5, totalCost: 25 },
      { name: "Tomme", badgeText: "Péremption", totalQty: 1, totalCost: 5 },
    ]);
  });

  it("calcule le prix moyen pondéré par les pièces fabriquées", () => {
    const averages = calculateAverageProductionCosts([
      productionLot({ id: 1, nombreUnites: 10, coutTotal: 100 }),
      productionLot({ id: 2, nombreUnites: 30, coutTotal: 600 }),
    ]);

    expect(averages).toEqual([{ fromageId: 1, cheeseName: "Tomme", lotCount: 2, unitCount: 40, averageUnitCost: 17.5 }]);
  });

  it("traduit le type API et additionne les pièces perdues pour défaut d'affinage", () => {
    const mapped = mapLossToLogEntry(apiLoss({ quantite: 4 }));

    expect(mapped.badgeText).toBe("Défaut d'affinage");
    expect(calculateAgingDefectQuantity([
      mapped,
      loss({ badgeText: "DEFAUT_AFFINAGE", quantity: 3 }),
      loss({ badgeText: "DLC / DDM dépassée", quantity: 2 }),
    ])).toBe(7);
  });
});

function apiLoss(overrides: Partial<StockLossApi> = {}): StockLossApi {
  return { id: 1, stockId: 1, reservationId: null, numeroLot: "L1", fromageNom: "Tomme", quantite: 1, typePerte: "DEFAUT_AFFINAGE", motif: "Croûte", dateHeure: "2026-08-01T10:00:00", coutUnitaireReference: 5, coutTotal: 5, utilisateurNom: "Alex", ...overrides };
}

function loss(overrides: Partial<LossLogEntry> = {}): LossLogEntry {
  return { id: "1", cheeseName: "Tomme", badgeText: "Défaut", dateFormatted: "", dateIso: "2026-08-01", lotNumber: "L1", orderNumber: "Interne", clientName: "Stock", reason: "", quantity: 0, unitCost: 5, totalCost: 0, ...overrides };
}

function stock(overrides: Partial<StockFromageFini>): StockFromageFini {
  return { id: 1, lotAffinageId: 1, numeroLotFabrication: "L1", fromageNom: "Tomme", emplacementStockId: 1, emplacementStockNom: "Réserve", dateEntreeStock: "2026-08-01", quantiteInitiale: 0, quantitePhysique: 0, vendable: true, typeDateDurabilite: "DLC", dateDurabilite: "2026-09-01", statut: "DISPONIBLE", mouvements: [], ...overrides };
}

function productionLot(overrides: Partial<LotProductionCost> = {}): LotProductionCost {
  return {
    id: 1, fabricationId: 1, numeroLot: "FAB-1", fromageId: 1, fromageNom: "Tomme", recetteNom: "Tomme",
    dateFabrication: "2026-08-01T08:00:00", poidsTotal: 10, nombreUnites: 10, coutLait: 0, coutMatieres: 0,
    coutEmballage: 0, coutEnergie: 0, coutMainOeuvre: 0, coutAmortissement: 0, coutTotal: 100,
    coutParKg: 10, coutParUnite: 10, dateCalcul: "2026-08-01T12:00:00", ...overrides,
  };
}
