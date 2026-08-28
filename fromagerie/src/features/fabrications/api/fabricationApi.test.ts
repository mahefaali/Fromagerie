import { afterEach, describe, expect, it, vi } from "vitest";

import { onUnauthorized } from "../../../services/http/sessionEvents";
import { fabricationApi } from "./fabricationApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fabricationApi", () => {
  it("propage globalement une session expirée reçue sur la liste", async () => {
    const unauthorizedListener = vi.fn();
    const unsubscribe = onUnauthorized(unauthorizedListener);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Session expirée" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fabricationApi.findAll()).rejects.toMatchObject({
      status: 401,
      message: "Session expirée",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/fabrications",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
    expect(unauthorizedListener).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("transmet les filtres combinés à l'historique des températures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fabricationApi.findTemperatureHistory({
      fromageId: 3,
      recetteId: 8,
      dateDebut: "2026-01-01",
      dateFin: "2026-12-31",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/fabrications/analytics/temperatures?fromageId=3&recetteId=8&dateDebut=2026-01-01&dateFin=2026-12-31",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });

  it("utilise le contrat saisonnier avec un fromage obligatoire", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        fromageId: 3,
        fromageNom: "Tomme",
        saisonSeche: { nombreFabrications: 0, moyenne: null, minimum: null, maximum: null, donneesDisponibles: false },
        saisonHumide: { nombreFabrications: 0, moyenne: null, minimum: null, maximum: null, donneesDisponibles: false },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fabricationApi.findSeasonalYieldComparison(3, { recetteId: 8 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/fabrications/analytics/rendements/saisons?fromageId=3&recetteId=8",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });

  it("transmet le paramètre d'anomalie sans calcul côté client", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        minimumEchantillons: 8,
        anomalies: [],
        donneesInsuffisantes: [],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fabricationApi.findAnomalies({ fromageId: 3 }, "TEMPERATURE_CHAUFFAGE");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/fabrications/analytics/anomalies?fromageId=3&parametre=TEMPERATURE_CHAUFFAGE",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });
});
