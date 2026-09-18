import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Traceability from "./Traceability";

const apiMocks = vi.hoisted(() => ({
  rechercherCommande: vi.fn(),
  retracerLivraison: vi.fn(),
}));

vi.mock("../../features/tracabilite/api", () => ({ tracabiliteApi: apiMocks }));

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
});
