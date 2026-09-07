import { describe, expect, it } from "vitest";

import type { PerformanceDashboard } from "../api/performanceApi";
import { average, mergeIndicatorDetails } from "./indicatorsDashboard.utils";

describe("indicators dashboard utilities", () => {
  it("calcule une moyenne en ignorant les valeurs absentes et invalides", () => {
    expect(average([2, null, undefined, Number.NaN, 4])).toBe(3);
    expect(average([null, undefined])).toBeNull();
  });

  it("fusionne les indicateurs par identifiant de fromage", () => {
    const result = mergeIndicatorDetails({
      rendementsParFromage: [{ fromageId: 2, fromageNom: "Tomme", rendement: 12 }],
      poidsMoyens: [{ fromageId: 2, fromageNom: "Tomme", poidsMoyenKg: 1.5 }],
      pertesParFromage: [{ fromageId: 1, fromageNom: "Brie", quantiteEntree: 10, quantitePerdue: 1, tauxPerte: 10 }],
      dureesAffinage: [{ fromageId: 2, fromageNom: "Tomme", dureePrevueJours: 30, dureeReelleJours: 32, ecartJours: 2 }],
    } as PerformanceDashboard);

    expect(result.map((row) => row.name)).toEqual(["Brie", "Tomme"]);
    expect(result[1]).toMatchObject({ yield: 12, weight: 1.5, expected: 30, actual: 32, gap: 2 });
  });
});
