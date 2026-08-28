import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { invalidateCsrfToken } from "../../../services/http/apiClient";
import { affinageApi } from "./affinageApi";

beforeEach(() => invalidateCsrfToken());

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateCsrfToken();
});

describe("affinageApi", () => {
  it("charge les lots sans demander de jeton CSRF", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await affinageApi.findAll();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/affinages");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("envoie un déplacement atomique avec le jeton CSRF", async () => {
    const result = {
      quantiteDemandee: 8,
      quantitePlacee: 8,
      quantiteRestante: 0,
      placementComplet: true,
      placementsCrees: [],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: "csrf-token",
        headerName: "X-CSRF-TOKEN",
        parameterName: "_csrf",
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    await affinageApi.move(12, {
      caveDestinationId: 4,
      rangeeDepartId: 9,
    });

    const options = fetchMock.mock.calls[1][1] as RequestInit;
    expect(fetchMock.mock.calls[1][0]).toBe("http://localhost:8080/api/affinages/12/deplacement");
    expect(options.method).toBe("POST");
    expect((options.headers as Headers).get("X-CSRF-TOKEN")).toBe("csrf-token");
    expect(JSON.parse(options.body as string)).toEqual({
      caveDestinationId: 4,
      rangeeDepartId: 9,
    });
  });
});
