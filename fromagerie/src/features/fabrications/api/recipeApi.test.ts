import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { invalidateCsrfToken } from "../../../services/http/apiClient";
import { onUnauthorized } from "../../../services/http/sessionEvents";
import type { CreateRecetteRequest } from "../types/recipe.types";
import { recipeApi } from "./recipeApi";

beforeEach(() => invalidateCsrfToken());

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateCsrfToken();
});

describe("recipeApi", () => {
  it("charge la liste avec les filtres et la session cookie", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));
    vi.stubGlobal("fetch", fetchMock);

    await recipeApi.findAll({ fromageId: 2, active: false, nom: " aux herbes " });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/recettes?fromageId=2&active=false&nom=aux+herbes",
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });

  it("envoie la création avec le token CSRF sans ajouter de coût ni de version", async () => {
    const request: CreateRecetteRequest = {
      nom: "Classique",
      fromageId: 2,
      recetteDeBase: true,
      quantiteLaitReference: 100,
      ingredients: [{ matierePremiereId: 1, quantite: 100, unite: "L" }],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: "csrf-token",
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 9 }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await recipeApi.create(request);

    expect(fetchMock).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/recettes",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
        body: JSON.stringify(request),
        headers: expect.any(Headers),
      }),
    );
    const options = fetchMock.mock.calls[1][1] as RequestInit;
    expect((options.headers as Headers).get("X-CSRF-TOKEN")).toBe("csrf-token");
  });

  it("crée un nouveau type de fromage avec la session et le token CSRF", async () => {
    const request = { nom: "Tomme fermière", description: "Une pâte pressée non cuite." };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: "csrf-token",
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 7, ...request }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await recipeApi.createCheese(request);

    expect(fetchMock).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/fromages",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
        body: JSON.stringify(request),
        headers: expect.any(Headers),
      }),
    );
    const options = fetchMock.mock.calls[1][1] as RequestInit;
    expect((options.headers as Headers).get("X-CSRF-TOKEN")).toBe("csrf-token");
  });

  it("crée une nouvelle matière première avec la session et le token CSRF", async () => {
    const request = { nom: "Ferments lactiques", uniteReference: "G" as const, coutUnitaire: 4.5, actif: true };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: "csrf-token",
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 8, ...request }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await recipeApi.createMaterial(request);

    expect(fetchMock).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/matieres-premieres",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
        body: JSON.stringify(request),
        headers: expect.any(Headers),
      }),
    );
  });

  it("utilise les endpoints réels de détail, historique, matières et fromages", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));
    vi.stubGlobal("fetch", fetchMock);

    await recipeApi.findById(4);
    await recipeApi.findHistory(4);
    await recipeApi.findMaterials();
    await recipeApi.findCheeses();

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:8080/api/recettes/4",
      "http://localhost:8080/api/recettes/4/historique",
      "http://localhost:8080/api/matieres-premieres",
      "http://localhost:8080/api/fromages",
    ]);
  });

  it("propage une session expirée au gestionnaire global", async () => {
    const listener = vi.fn();
    const unsubscribe = onUnauthorized(listener);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: "Session expirée" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )));

    await expect(recipeApi.findAll()).rejects.toMatchObject({ status: 401, message: "Session expirée" });
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
