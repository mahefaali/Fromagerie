import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CaveApiResponse } from "../types/cave.types";
import { AffinagePlacementDialog } from "./AffinagePlacementDialog";

afterEach(cleanup);

const availableCave: CaveApiResponse = {
  id: 4,
  nom: "Cave secondaire",
  description: null,
  temperature: 12,
  humidite: 90,
  ageMinJours: 1,
  ageMaxJours: 60,
  active: true,
  capaciteTotale: 10,
  capaciteOccupee: 5,
  capaciteDisponible: 5,
  etageres: [{
    id: 8,
    numero: 1,
    ordre: 1,
    rangees: [{
      id: 12,
      numero: 1,
      ordre: 1,
      capacite: 10,
      capaciteOccupee: 5,
      capaciteDisponible: 5,
    }],
  }],
};

describe("AffinagePlacementDialog", () => {
  it("explique qu'il faut attendre lorsqu'aucune cave n'est libre", () => {
    render(
      <AffinagePlacementDialog
        open
        mode="create"
        fabrications={[]}
        caves={[]}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Il n'y a plus de cave libre")).toBeInTheDocument();
    expect(screen.getByText(/Attendez la prochaine sortie d'affinage/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
  });

  it("exclut la cave déjà utilisée pour proposer le placement du reste", () => {
    render(
      <AffinagePlacementDialog
        open
        mode="remaining"
        quantity={7}
        fabrications={[]}
        caves={[availableCave]}
        excludedCaveIds={[availableCave.id]}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Il n'y a plus d'autre cave libre")).toBeInTheDocument();
    expect(screen.getByText(/Quantité concernée/)).toHaveTextContent("7 fromage(s)");
    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
  });
});
