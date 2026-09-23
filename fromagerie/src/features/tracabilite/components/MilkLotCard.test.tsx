import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LotLait } from "../types";
import { MilkLotCard } from "./MilkLotCard";

afterEach(cleanup);

function lot(quantiteDisponible: number): LotLait {
  return {
    id: 1,
    numeroLot: "LAIT-1",
    dateTraite: "2026-09-18T07:31:00",
    typeTraite: "MATIN",
    quantite: 200,
    quantiteDisponible,
    coutUnitaire: 0.6,
    observations: null,
    analyses: [],
  };
}

describe("MilkLotCard", () => {
  it("affiche un badge rouge Épuisé lorsque le lot ne contient plus de lait", () => {
    render(<MilkLotCard lot={lot(0)} canAddAnalysis onAddAnalysis={vi.fn()} />);

    const badge = screen.getByText("Épuisé");
    expect(badge).toHaveClass("bg-red-100", "text-red-700");
    expect(screen.queryByText("0 L disponibles")).not.toBeInTheDocument();
  });

  it("affiche la quantité restante lorsqu'elle est positive", () => {
    render(<MilkLotCard lot={lot(75)} canAddAnalysis={false} onAddAnalysis={vi.fn()} />);

    expect(screen.getByText("75 L disponibles")).toBeInTheDocument();
    expect(screen.queryByText("Épuisé")).not.toBeInTheDocument();
  });
});
