import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CaveApiResponse } from "../types/cave.types";
import type { FabricationListItem } from "../../fabrications/types/fabrication.types";
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

const fabrication: FabricationListItem = {
  id: 7,
  numeroLot: "FAB-20260910-001",
  dateHeureDebut: "2026-09-10T07:00:00",
  fromageId: 2,
  fromageNom: "Tomme",
  recetteId: 3,
  recetteNom: "Classique",
  quantiteLait: 100,
  poidsTotalFromages: 12,
  nombreFromages: 8,
  rendement: 12,
  operateurId: 1,
  operateurNom: "Opérateur",
};

describe("AffinagePlacementDialog", () => {
  it("affiche directement le lot présélectionné dans l'en-tête sans sélecteur", () => {
    render(
      <AffinagePlacementDialog
        open
        mode="create"
        fabrications={[fabrication]}
        caves={[availableCave]}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("FAB-20260910-001").closest("p")).toHaveTextContent(
      "Lot FAB-20260910-001 — Tomme · Classique · 8 emplacements requis",
    );
    expect(screen.queryByText("Fabrication")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Choisir une fabrication")).not.toBeInTheDocument();
  });

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

  it("bloque la mise en affinage si les caves compatibles manquent de place", () => {
    render(
      <AffinagePlacementDialog
        open
        mode="create"
        fabrications={[fabrication]}
        caves={[availableCave]}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "5 place(s) pour 8 fromages",
    );
    expect(screen.getByRole("button", { name: "Confirmer" })).toBeDisabled();
  });

  it("permet de sélectionner une seconde cave compatible et une rangée pour chacune", () => {
    const first = { ...availableCave, nom: "Cave A" };
    const second: CaveApiResponse = {
      ...availableCave,
      id: 5,
      nom: "Cave B",
      etageres: [{
        ...availableCave.etageres[0],
        id: 9,
        rangees: [{ ...availableCave.etageres[0].rangees[0], id: 13 }],
      }],
    };

    render(
      <AffinagePlacementDialog
        open
        mode="create"
        fabrications={[fabrication]}
        caves={[first, second]}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText(/Cette cave ne peut accueillir que 5 fromages sur 8/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Cave B/ }));
    expect(screen.getByText(/Les 2 caves sélectionnées peuvent satisfaire tout le lot/)).toBeInTheDocument();
    expect(screen.getAllByText(/Rangée de départ — Cave/)).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Confirmer" })).toBeEnabled();
  });

  it("permet de remplacer la cave de référence par une cave de conditions différentes", () => {
    const otherConditions: CaveApiResponse = {
      ...availableCave,
      id: 6,
      nom: "Cave de Test",
      temperature: 8,
      humidite: 50,
      ageMaxJours: 60,
      capaciteTotale: 56,
      capaciteOccupee: 0,
      capaciteDisponible: 56,
      etageres: [{
        ...availableCave.etageres[0],
        id: 10,
        rangees: [{
          ...availableCave.etageres[0].rangees[0],
          id: 14,
          capacite: 56,
          capaciteOccupee: 0,
          capaciteDisponible: 56,
        }],
      }],
    };

    render(
      <AffinagePlacementDialog
        open
        mode="create"
        fabrications={[fabrication]}
        caves={[availableCave, otherConditions]}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cave de Test/ }));

    expect(screen.getByText(/Cette cave peut satisfaire tout le lot/)).toBeInTheDocument();
    expect(screen.getByText(/Cliquez pour choisir cette cave et changer de conditions/)).toBeInTheDocument();
    expect(screen.getByText("Rangée de départ — Cave de Test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer" })).toBeEnabled();
  });
});
