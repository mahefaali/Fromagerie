import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../../../services/http/apiClient";
import CostsSection from "./Costs";

const apiMocks = vi.hoisted(() => ({
  listTarifsLait: vi.fn(),
  listEmballages: vi.fn(),
  listConfigurationsEmballages: vi.fn(),
  listFromages: vi.fn(),
  listEnergie: vi.fn(),
  listMainOeuvre: vi.fn(),
  listEquipements: vi.fn(),
  listAmortissements: vi.fn(),
  createEnergie: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("../api/costsApi", () => ({ costsApi: apiMocks }));
vi.mock("sonner", () => ({ toast: toastMocks }));

beforeEach(() => {
  apiMocks.listTarifsLait.mockResolvedValue([]);
  apiMocks.listEmballages.mockResolvedValue([]);
  apiMocks.listConfigurationsEmballages.mockResolvedValue([]);
  apiMocks.listFromages.mockResolvedValue([]);
  apiMocks.listEnergie.mockResolvedValue([]);
  apiMocks.listMainOeuvre.mockResolvedValue([]);
  apiMocks.listEquipements.mockResolvedValue([]);
  apiMocks.listAmortissements.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("configuration des coûts", () => {
  it("affiche le conflit énergie sans laisser une promesse rejetée", async () => {
    const user = userEvent.setup();
    const message = "La règle énergie chevauche une période existante pour ce type d'opération";
    apiMocks.createEnergie.mockRejectedValue(new HttpError(409, message));

    render(<CostsSection />);
    await user.click(screen.getByRole("tab", { name: "Énergie" }));
    await user.type(screen.getByPlaceholderText("Coût standard"), "0.05");
    await user.type(screen.getByLabelText("Début de validité"), "2026-02-14");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() => expect(toastMocks.error).toHaveBeenCalledWith(message));
    expect(toastMocks.success).not.toHaveBeenCalled();
    expect(apiMocks.createEnergie).toHaveBeenCalledWith(expect.objectContaining({
      typeOperation: "CHAUFFE",
      uniteCalcul: "PAR_HEURE",
      dateDebutValidite: "2026-02-14",
      dateFinValidite: null,
    }));
  });
});
