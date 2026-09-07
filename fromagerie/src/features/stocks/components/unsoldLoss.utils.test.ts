import { describe, expect, it } from "vitest";

import type { StockFromageFini } from "../api/stockApi";
import type { LossLogEntry } from "./unsoldLoss.types";
import { calculateMonthlyLossRates, summarizeLossCauses } from "./unsoldLoss.utils";

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
});

function loss(overrides: Partial<LossLogEntry> = {}): LossLogEntry {
  return { id: "1", cheeseName: "Tomme", badgeText: "Défaut", dateFormatted: "", dateIso: "2026-08-01", lotNumber: "L1", orderNumber: "Interne", clientName: "Stock", reason: "", quantity: 0, unitCost: 5, totalCost: 0, ...overrides };
}

function stock(overrides: Partial<StockFromageFini>): StockFromageFini {
  return { id: 1, lotAffinageId: 1, numeroLotFabrication: "L1", fromageNom: "Tomme", emplacementStockId: 1, emplacementStockNom: "Réserve", dateEntreeStock: "2026-08-01", quantiteInitiale: 0, quantitePhysique: 0, vendable: true, typeDateDurabilite: "DLC", dateDurabilite: "2026-09-01", statut: "DISPONIBLE", mouvements: [], ...overrides };
}
