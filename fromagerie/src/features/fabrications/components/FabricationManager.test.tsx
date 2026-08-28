import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../../../services/http/apiClient";
import type {
  CreateFabricationRequest,
  FabricationDetail,
  FabricationListItem,
  RecetteOption,
} from "../types/fabrication.types";
import FabricationManager from "./FabricationManager";

const apiMocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findRecettes: vi.fn(),
}));

vi.mock("../api/fabricationApi", () => ({ fabricationApi: apiMocks }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const recette: RecetteOption = {
  id: 7,
  nom: "Tomme classique",
  varianteKey: "legacy-3",
  fromageId: 3,
  fromageNom: "Tomme fermière",
  version: 1,
  active: true,
  coutMatiereEstime: 84,
};

const fabrication: FabricationListItem = {
  id: 11,
  numeroLot: "FAB-20260825-001",
  dateHeureDebut: "2026-08-25T07:30:00",
  recetteId: recette.id,
  recetteNom: recette.nom,
  fromageId: recette.fromageId,
  fromageNom: recette.fromageNom,
  operateurId: 4,
  operateurNom: "Jean Démo",
  quantiteLait: 120,
  poidsTotalFromages: 14.4,
  nombreFromages: 12,
  rendement: 12,
};

const detail: FabricationDetail = {
  ...fabrication,
  temperatureLait: 7.5,
  origineLait: "TRAITE_MATIN",
  temperatureChauffage: 32,
  dureeChauffageMinutes: 45,
  typePresure: "Présure animale",
  quantitePresure: 24,
  typeFerments: "Ferments thermophiles",
  quantiteFerments: 3,
  temperatureMiseEnMoule: 29,
  dureeEgouttageMinutes: 180,
  observations: "Caillé homogène",
};

async function openAndFillValidForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
  await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
  await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Quantité, température et origine");

  await user.type(screen.getByLabelText(/Quantité de lait/), "120");
  await user.type(screen.getByLabelText(/Température du lait/), "7.5");
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Chauffage et présure");

  await user.type(screen.getByLabelText(/Température de chauffage/), "32");
  await user.type(screen.getByLabelText(/Durée de chauffage/), "45");
  await user.type(screen.getByLabelText(/Type de présure/), "Présure animale");
  await user.type(screen.getByLabelText(/Quantité de présure/), "24");
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Ferments, moulage et égouttage");

  await user.type(screen.getByLabelText(/Type de ferments/), "Ferments thermophiles");
  await user.type(screen.getByLabelText(/Quantité de ferments/), "3");
  await user.type(screen.getByLabelText(/Température de mise en moule/), "29");
  await user.type(screen.getByLabelText(/Durée d'égouttage/), "180");
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Poids, quantité et observations");

  await user.type(screen.getByLabelText(/Poids total à la sortie du moule/), "14.4");
  await user.type(screen.getByLabelText(/Nombre de fromages produits/), "12");
  await user.type(screen.getByLabelText("Observations"), "Caillé homogène");
}

beforeEach(() => {
  apiMocks.findAll.mockResolvedValue([fabrication]);
  apiMocks.findRecettes.mockResolvedValue([recette]);
  apiMocks.findById.mockResolvedValue(detail);
  apiMocks.create.mockResolvedValue(detail);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("registre des fabrications", () => {
  it("charge et affiche les données provenant de l'API", async () => {
    render(<FabricationManager />);

    expect(screen.getByRole("status")).toHaveTextContent("Chargement des fabrications");
    expect(await screen.findByText(`Lot ${fabrication.numeroLot}`)).toBeInTheDocument();
    expect(screen.getByText("Tomme fermière")).toBeInTheDocument();
    expect(screen.getByText("Jean Démo")).toBeInTheDocument();
  });

  it("affiche un état vide lorsque le registre ne contient aucune fabrication", async () => {
    apiMocks.findAll.mockResolvedValue([]);

    render(<FabricationManager />);

    expect(await screen.findByText("Aucune fabrication enregistrée.")).toBeInTheDocument();
  });

  it("permet de relancer le chargement après une erreur réseau", async () => {
    apiMocks.findAll
      .mockRejectedValueOnce(new Error("Serveur indisponible"))
      .mockResolvedValueOnce([fabrication]);
    const user = userEvent.setup();

    render(<FabricationManager />);

    expect(await screen.findByText("Serveur indisponible")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Réessayer" }));

    expect(await screen.findByText(`Lot ${fabrication.numeroLot}`)).toBeInTheDocument();
    expect(apiMocks.findAll).toHaveBeenCalledTimes(2);
  });

  it("charge le détail du lot sélectionné", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(await screen.findByRole("button", { name: "Voir le détail" }));

    expect(apiMocks.findById).toHaveBeenCalledWith(fabrication.id);
    expect(await screen.findByText("Caillé homogène")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: `Lot ${fabrication.numeroLot}` })).toBeInTheDocument();
  });

  it("bloque l'étape lait lorsque les valeurs obligatoires sont absentes", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
    await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
    await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await screen.findByText("Quantité, température et origine");
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect(await screen.findAllByText("Ce champ est obligatoire.")).toHaveLength(2);
    expect(screen.getByText("Quantité, température et origine")).toBeInTheDocument();
    expect(apiMocks.create).not.toHaveBeenCalled();
  });

  it("envoie exactement le contrat attendu et empêche une double soumission", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await openAndFillValidForm(user);
    const submitButton = screen.getByRole("button", { name: /Enregistrer/ });
    await user.dblClick(submitButton);

    await waitFor(() => expect(apiMocks.create).toHaveBeenCalledTimes(1));
    const request = apiMocks.create.mock.calls[0][0] as CreateFabricationRequest;
    expect(request).toEqual({
      dateHeureDebut: expect.any(String),
      recetteId: 7,
      quantiteLait: 120,
      temperatureLait: 7.5,
      origineLait: "TRAITE_MATIN",
      temperatureChauffage: 32,
      dureeChauffageMinutes: 45,
      typePresure: "Présure animale",
      quantitePresure: 24,
      typeFerments: "Ferments thermophiles",
      quantiteFerments: 3,
      temperatureMiseEnMoule: 29,
      dureeEgouttageMinutes: 180,
      poidsTotalFromages: 14.4,
      nombreFromages: 12,
      observations: "Caillé homogène",
    });
    await waitFor(() => expect(screen.queryByText("Étape 5 / 5 · Résultats")).not.toBeInTheDocument());
    expect(apiMocks.findAll).toHaveBeenCalledTimes(2);
  });

  it("conserve la saisie et affiche le message d'une validation backend", async () => {
    apiMocks.create.mockRejectedValue(
      new HttpError(400, "La fabrication contient des données invalides.", {
        quantiteLait: "La quantité de lait dépasse la capacité autorisée.",
      }),
    );
    const user = userEvent.setup();
    render(<FabricationManager />);

    await openAndFillValidForm(user);
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));

    expect(await screen.findByText("La fabrication contient des données invalides.")).toBeInTheDocument();
    expect(screen.getByLabelText("Observations")).toHaveValue("Caillé homogène");
    expect(screen.getByText("Étape 5 / 5 · Résultats")).toBeInTheDocument();
  });
});
