import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { affinageApi } from "../../api/affinageApi";
import type { AffinageDetail, AffinageListItem } from "../../types/affinage.types";
import { stockApi } from "../../../stocks/api/stockApi";
import { parseLotId, useAffinageTracker } from "./useAffinageTracker";

vi.mock("../../../authentication/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, username: "operator", nom: "Opérateur", role: "FABRICATION" } }),
}));

const firstLot = lot(11, "LOT-011");
const requestedLot = lot(22, "LOT-022");

describe("useAffinageTracker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(affinageApi, "findAll").mockResolvedValue([firstLot, requestedLot]);
    vi.spyOn(affinageApi, "findFabrications").mockResolvedValue([]);
    vi.spyOn(affinageApi, "findCaves").mockResolvedValue([]);
    vi.spyOn(stockApi, "findEmplacements").mockResolvedValue([]);
    vi.spyOn(affinageApi, "findById").mockImplementation(async (id) => detail(id));
  });

  it("conserve le lot demandé par l’accueil après le chargement du catalogue", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={["/affinage?lot=22"]}>{children}</MemoryRouter>;
    const { result } = renderHook(() => useAffinageTracker(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.selectedId).toBe(22));
    await waitFor(() => expect(result.current.detail?.id).toBe(22));
    expect(affinageApi.findById).toHaveBeenCalledWith(22);
  });

  it("ignore les identifiants absents ou invalides", () => {
    expect(parseLotId(null)).toBeNull();
    expect(parseLotId("abc")).toBeNull();
    expect(parseLotId("-1")).toBeNull();
    expect(parseLotId("22")).toBe(22);
  });
});

function lot(id: number, numeroLot: string): AffinageListItem {
  return {
    id, fabricationId: id + 100, numeroLot, fromageNom: "Tomme", recetteNom: "Classique",
    dateMiseEnCave: "2026-09-01", dateSortiePrevue: "2026-09-30", joursRestants: 22,
    statut: "EN_AFFINAGE", quantiteInitiale: 10, quantitePlacee: 10, quantiteRestante: 0, cavesActuelles: ["Cave A"],
  };
}

function detail(id: number): AffinageDetail {
  const source = id === requestedLot.id ? requestedLot : firstLot;
  return { ...source, operateurNom: "Opérateur", etatCroute: null, placementsActifs: [], historiquePlacements: [], soins: [] };
}
