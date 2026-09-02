import { afterEach, describe, expect, it, vi } from "vitest";

import { profitabilityApi } from "./profitabilityApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("profitabilityApi", () => {
  it("charge l'analyse réelle avec la période et les filtres fromage/client", async () => {
    const response = {
      dateDebut: "2026-01-01",
      dateFin: "2026-01-31",
      synthese: { quantiteLivree: 4, chiffreAffaires: 80, coutAttribue: 24, margeBrute: 56, tauxRentabilite: 233.33 },
      parFromage: [], parClient: [], croisee: [],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(profitabilityApi.analyse({
      dateDebut: "2026-01-01",
      dateFin: "2026-01-31",
      fromageId: 3,
      clientId: 7,
    })).resolves.toEqual(response);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/rentabilite/analyse?");
    expect(url).toContain("dateDebut=2026-01-01");
    expect(url).toContain("dateFin=2026-01-31");
    expect(url).toContain("fromageId=3");
    expect(url).toContain("clientId=7");
  });

  it("charge les coûts définitifs des lots", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(profitabilityApi.lots()).resolves.toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/couts-production/lots");
  });

});
