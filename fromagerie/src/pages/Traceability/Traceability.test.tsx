import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Traceability from "./Traceability";

const apiMocks = vi.hoisted(() => ({
  rechercherCommande: vi.fn(),
  retracerLivraison: vi.fn(),
  rechercherLot: vi.fn(),
}));

vi.mock("../../features/tracabilite/api", () => ({ tracabiliteApi: apiMocks }));
vi.mock("../../features/authentication/hooks/useAuth", () => ({ useAuth: () => ({ user: { role: "PROPRIETAIRE" } }) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("recherche de traçabilité", () => {
  it("recherche automatiquement après la saisie sans bouton", async () => {
    apiMocks.rechercherCommande.mockResolvedValue({
      numeroCommande: "CMD-2026-001",
      client: "Client test",
      produitsLivres: [],
    });
    render(<Traceability />);

    fireEvent.change(screen.getByLabelText("Numéro de commande"), {
      target: { value: "CMD-2026-001" },
    });

    expect(screen.queryByRole("button", { name: "Rechercher" })).not.toBeInTheDocument();
    expect(apiMocks.rechercherCommande).not.toHaveBeenCalled();

    await waitFor(() => expect(apiMocks.rechercherCommande).toHaveBeenCalledWith("CMD-2026-001"));
    expect(await screen.findByText("Commande CMD-2026-001")).toBeInTheDocument();
  });

  it("réutilise la page pour rechercher un lot en traçabilité descendante", async () => {
    apiMocks.rechercherLot.mockResolvedValue({
      numeroLot: "FAB-2026-0098", fromage: "Tomme", dateFabrication: "2026-09-01T08:00:00",
      quantiteProduite: 50, quantiteLivree: 30, quantiteNonVendue: 20, quantiteDisponible: 18,
      quantitePerdue: 2, clientsLivres: [], pertes: [], localisationsActuelles: [],
    });
    render(<Traceability />);
    fireEvent.click(screen.getByRole("button", { name: "Traçabilité descendante" }));
    fireEvent.change(screen.getByLabelText("Numéro du lot de fabrication"), { target: { value: "0098" } });
    await waitFor(() => expect(apiMocks.rechercherLot).toHaveBeenCalledWith("0098"));
    expect(await screen.findByText("FAB-2026-0098")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });
});
