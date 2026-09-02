import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../services/http/apiClient";
import { performanceApi } from "./performanceApi";

vi.mock("../../../services/http/apiClient", () => ({ apiRequest: vi.fn() }));

describe("performanceApi", () => {
  beforeEach(() => vi.mocked(apiRequest).mockReset());

  it("transmet la période et le filtre fromage au point d'entrée unique", async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    await performanceApi.dashboard({ dateDebut: "2026-08-01", dateFin: "2026-08-31", fromageId: 4 });
    expect(apiRequest).toHaveBeenCalledWith("/api/performances/dashboard?dateDebut=2026-08-01&dateFin=2026-08-31&fromageId=4");
  });

  it("omet le fromage lorsque tous les types sont demandés", async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    await performanceApi.dashboard({ dateDebut: "2026-08-01", dateFin: "2026-08-31" });
    expect(apiRequest).toHaveBeenCalledWith("/api/performances/dashboard?dateDebut=2026-08-01&dateFin=2026-08-31");
  });
});
