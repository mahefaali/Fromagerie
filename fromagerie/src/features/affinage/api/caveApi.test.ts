import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { invalidateCsrfToken } from "../../../services/http/apiClient";
import type { Cave } from "../../../services/production-store";
import { caveApi } from "./caveApi";

beforeEach(() => invalidateCsrfToken());

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateCsrfToken();
});

describe("caveApi", () => {
  it("convertit la structure ordonnée en plan physique sans inventer d'occupation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: 7,
      nom: "Cave test",
      description: null,
      temperature: 11.5,
      humidite: 90,
      ageMinJours: 2,
      ageMaxJours: 45,
      active: true,
      capaciteTotale: 7,
      capaciteOccupee: 0,
      capaciteDisponible: 7,
      etageres: [{
        id: 3,
        numero: 1,
        ordre: 1,
        rangees: [
          { id: 4, numero: 1, ordre: 1, capacite: 3 },
          { id: 5, numero: 2, ordre: 2, capacite: 4 },
        ],
      }],
    }]), { status: 200, headers: { "Content-Type": "application/json" } })));

    const caves = await caveApi.findAll();

    expect(caves[0]).toMatchObject({ id: "7", nom: "Cave test", ageMaxJours: 45 });
    expect(caves[0].emplacements).toHaveLength(7);
    expect(caves[0].emplacements.every((position) => position.contenu === undefined)).toBe(true);
  });

  it("charge les occupations actives avec leur numéro de lot", async () => {
    const occupations = [{
      placementId: 12,
      etagereNumero: 1,
      rangeeNumero: 2,
      positionDebut: 3,
      positionFin: 5,
      numeroLot: "LOT-2026-0042",
    }];
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(occupations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(caveApi.findOccupations("7")).resolves.toEqual(occupations);
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/caves/7/occupations");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("envoie la création imbriquée avec session et CSRF", async () => {
    const cave: Cave = {
      id: "temp",
      nom: "Nouvelle cave",
      description: "",
      temperatureCible: 12,
      humiditeCible: 88,
      ageMinJours: 1,
      ageMaxJours: 30,
      active: true,
      capaciteOccupee: 0,
      capaciteDisponible: 10,
      etageres: [{ label: "1", nbRangees: 2, nbPositions: 5 }],
      emplacements: [],
    };
    const response = {
      id: 8, nom: cave.nom, description: "", temperature: 12, humidite: 88,
      ageMinJours: 1, ageMaxJours: 30, active: true, capaciteTotale: 10, etageres: [],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: "csrf-token", headerName: "X-CSRF-TOKEN", parameterName: "_csrf",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(response), {
        status: 201, headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await caveApi.create(cave);

    const options = fetchMock.mock.calls[1][1] as RequestInit;
    expect(fetchMock.mock.calls[1][0]).toBe("http://localhost:8080/api/caves");
    expect(options.credentials).toBe("include");
    expect((options.headers as Headers).get("X-CSRF-TOKEN")).toBe("csrf-token");
    expect(JSON.parse(options.body as string).etageres[0].rangees).toEqual([
      { numero: 1, ordre: 1, capacite: 5 },
      { numero: 2, ordre: 2, capacite: 5 },
    ]);
  });
});
