import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Cave } from "../domain/cave";
import { CaveGridPlan } from "./CaveGridPlan";

const cave: Cave = {
  id: "7",
  nom: "Cave test",
  description: "",
  temperatureCible: 12,
  humiditeCible: 90,
  ageMinJours: 1,
  ageMaxJours: 30,
  active: true,
  capaciteOccupee: 2,
  capaciteDisponible: 1,
  etageres: [{ label: "1", nbRangees: 1, nbPositions: 3 }],
  emplacements: [
    { id: "1-1-1", etagere: "1", rangee: 1, position: 1 },
    { id: "1-1-2", etagere: "1", rangee: 1, position: 2 },
    { id: "1-1-3", etagere: "1", rangee: 1, position: 3 },
  ],
};

describe("CaveGridPlan", () => {
  it("affiche le numéro du lot sur les places occupées et Libre sur les autres", () => {
    render(
      <CaveGridPlan
        cave={cave}
        occupations={[{
          placementId: 10,
          etagereNumero: 1,
          rangeeNumero: 1,
          positionDebut: 1,
          positionFin: 2,
          numeroLot: "LOT-2026-0042",
        }]}
        isLoadingOccupations={false}
        occupationError={null}
        onRetryOccupations={vi.fn()}
      />,
    );

    expect(screen.getAllByText("LOT-2026-0042")).toHaveLength(2);
    expect(screen.getByLabelText("Position 1-1-1, lot LOT-2026-0042")).toBeInTheDocument();
    expect(screen.getByLabelText("Position 1-1-2, lot LOT-2026-0042")).toBeInTheDocument();
    expect(screen.getByLabelText("Position 1-1-3, libre")).toHaveTextContent("1-1-3");
    expect(screen.getByLabelText("Position 1-1-3, libre")).toHaveTextContent("Libre");
  });
});
