import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { fabricationApi } from "../api/fabricationApi";
import type { FabricationDetail } from "../types/fabrication.types";
import { FabricationDetailsModal } from "./FabricationDetailsModal";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const fabrication: FabricationDetail = {
  id: 7, numeroLot: "LOT-7", dateHeureDebut: "2026-09-21T08:00:00", fromageId: 1, fromageNom: "Tomme", recetteId: 2, recetteNom: "Recette A",
  quantiteLait: 100, poidsTotalFromages: 15, nombreFromages: 20, rendement: 15, operateurId: 3, operateurNom: "Marie",
  temperatureLait: 32, origineLait: "TRAITE_MATIN", temperatureChauffage: 36, dureeChauffageMinutes: 30, typePresure: "Animale", quantitePresure: 2,
  typeFerments: "Thermophiles", quantiteFerments: 1, temperatureMiseEnMoule: 30, dureeEgouttageMinutes: 60, observations: null,
};

describe("FabricationDetailsModal", () => {
  it("affiche le détail chargé et se ferme avec Échap", async () => {
    vi.spyOn(fabricationApi, "findById").mockResolvedValue(fabrication);
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FabricationDetailsModal fabricationId={7} onClose={onClose} />);

    expect(await screen.findByRole("dialog", { name: "Lot LOT-7" })).toBeInTheDocument();
    expect(screen.getByText("Tomme · Recette A")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("propose de réessayer après une erreur de chargement", async () => {
    const findById = vi.spyOn(fabricationApi, "findById").mockRejectedValueOnce(new Error("Réseau indisponible")).mockResolvedValueOnce(fabrication);
    const user = userEvent.setup();
    render(<FabricationDetailsModal fabricationId={7} onClose={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Réseau indisponible");
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByRole("dialog", { name: "Lot LOT-7" })).toBeInTheDocument();
    expect(findById).toHaveBeenCalledTimes(2);
  });
});
