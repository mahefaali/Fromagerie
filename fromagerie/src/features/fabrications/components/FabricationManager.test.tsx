import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  delete: vi.fn(),
  findRecettes: vi.fn(),
}));

const affinageApiMocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  findCaves: vi.fn(),
  create: vi.fn(),
}));
const tracabiliteApiMocks = vi.hoisted(() => ({ lots: vi.fn() }));
const recipeApiMocks = vi.hoisted(() => ({ findById: vi.fn(), findMaterials: vi.fn() }));

vi.mock("../api/fabricationApi", () => ({ fabricationApi: apiMocks }));
vi.mock("../../affinage/api/affinageApi", () => ({ affinageApi: affinageApiMocks }));
vi.mock("../../tracabilite/api", () => ({ tracabiliteApi: tracabiliteApiMocks }));
vi.mock("../api/recipeApi", () => ({ recipeApi: recipeApiMocks }));
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
const recetteDetail = {
  ...recette,
  dateCreation: "2026-08-01T08:00:00",
  quantiteLaitReference: 100,
  frequenceRetournementJours: null,
  ingredients: [{
    id: 31,
    matierePremiereId: 41,
    matierePremiereNom: "Présure animale",
    quantite: 20,
    unite: "ML" as const,
    coutUnitaireReference: 0.2,
    coutEstime: 4,
  }, {
    id: 32,
    matierePremiereId: 43,
    matierePremiereNom: "Ferments thermophiles",
    quantite: 2,
    unite: "G" as const,
    coutUnitaireReference: 1,
    coutEstime: 2,
  }],
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
  temperatureLait: 31.5,
  origineLait: "TRAITE_MATIN",
  temperatureChauffage: 32,
  dureeChauffageMinutes: 45,
  typePresure: "Présure animale",
  quantitePresure: 25,
  typeFerments: "Ferments thermophiles",
  quantiteFerments: 3,
  temperatureMiseEnMoule: 29,
  dureeEgouttageMinutes: 180,
  observations: "Caillé homogène",
};

const milkLot = {
  id: 21, numeroLot: "LAIT-20260825-001", dateTraite: "2026-08-25T06:00:00",
  typeTraite: "MATIN" as const, quantite: 200, quantiteDisponible: 200,
  observations: null, analyses: [],
};
const secondMilkLot = {
  id: 22, numeroLot: "LAIT-20260825-002", dateTraite: "2026-08-25T18:00:00",
  typeTraite: "SOIR" as const, quantite: 80, quantiteDisponible: 80,
  observations: null, analyses: [],
};

async function selectMilkLot(user: ReturnType<typeof userEvent.setup>, row: number, lotNumber: string): Promise<void> {
  await user.click(screen.getByRole("combobox", { name: `Lot de lait ${row}` }));
  await user.click(await screen.findByRole("option", { name: new RegExp(lotNumber) }));
}

async function openAndFillValidForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
  await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
  await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Quantité, température et origine");

  await selectMilkLot(user, 1, milkLot.numeroLot);
  fireEvent.change(await screen.findByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "120" } });
  expect(screen.getByText("Total lait utilisé : 120 L")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Température du lait au début/), { target: { value: "31.5" } });
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Chauffage et présure");

  fireEvent.change(screen.getByLabelText(/Température de chauffage/), { target: { value: "42.8" } });
  fireEvent.change(screen.getByLabelText(/Durée de chauffage/), { target: { value: "45" } });
  fireEvent.change(screen.getByLabelText(/Quantité réellement utilisée/), { target: { value: "24" } });
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Ferments, moulage et égouttage");

  fireEvent.change(screen.getByLabelText(/Quantité de ferments/), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText(/Température de mise en moule/), { target: { value: "29" } });
  fireEvent.change(screen.getByLabelText(/Durée d'égouttage/), { target: { value: "180" } });
  await user.click(screen.getByRole("button", { name: /Suivant/ }));
  await screen.findByText("Poids, quantité et observations");

  fireEvent.change(screen.getByLabelText(/Poids total à la sortie du moule/), { target: { value: "14.4" } });
  fireEvent.change(screen.getByLabelText(/Nombre de fromages produits/), { target: { value: "12" } });
  fireEvent.change(screen.getByLabelText("Observations"), { target: { value: "Caillé homogène" } });
}

beforeEach(() => {
  apiMocks.findAll.mockResolvedValue([fabrication]);
  apiMocks.findRecettes.mockResolvedValue([recette]);
  apiMocks.findById.mockResolvedValue(detail);
  apiMocks.create.mockResolvedValue(detail);
  apiMocks.update.mockResolvedValue(detail);
  apiMocks.delete.mockResolvedValue(undefined);
  affinageApiMocks.findAll.mockResolvedValue([]);
  affinageApiMocks.findCaves.mockResolvedValue([]);
  tracabiliteApiMocks.lots.mockResolvedValue([milkLot, secondMilkLot]);
  recipeApiMocks.findById.mockResolvedValue(recetteDetail);
  recipeApiMocks.findMaterials.mockResolvedValue([
    { id: 41, nom: "Présure animale", uniteReference: "ML", coutUnitaire: 0.2, actif: true },
    { id: 42, nom: "Présure microbienne", uniteReference: "ML", coutUnitaire: 0.3, actif: true },
    { id: 43, nom: "Ferments thermophiles", uniteReference: "G", coutUnitaire: 1, actif: true },
    { id: 44, nom: "Ferment mésophile", uniteReference: "G", coutUnitaire: 1.2, actif: true },
    { id: 45, nom: "Ferment en dose", uniteReference: "UNITE", coutUnitaire: 2, actif: true },
  ]);
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

  it("filtre les fabrications par avancement avec les trois cartes", async () => {
    const enAffinage = { ...fabrication, id: 12, numeroLot: "FAB-AFFINAGE" };
    const termine = { ...fabrication, id: 13, numeroLot: "FAB-TERMINE" };
    apiMocks.findAll.mockResolvedValue([fabrication, enAffinage, termine]);
    affinageApiMocks.findAll.mockResolvedValue([
      { fabricationId: enAffinage.id, statut: "EN_AFFINAGE" },
      { fabricationId: termine.id, statut: "TERMINE" },
    ]);
    const user = userEvent.setup();

    render(<FabricationManager />);

    const fabriqueFilter = await screen.findByRole("button", { name: /Fabriqué.*1/ });
    const affinageFilter = screen.getByRole("button", { name: /En affinage.*1/ });
    const termineFilter = screen.getByRole("button", { name: /Terminé.*1/ });

    await user.click(affinageFilter);
    expect(screen.getByText("Lot FAB-AFFINAGE")).toBeInTheDocument();
    expect(screen.queryByText(`Lot ${fabrication.numeroLot}`)).not.toBeInTheDocument();
    expect(screen.queryByText("Lot FAB-TERMINE")).not.toBeInTheDocument();

    await user.click(termineFilter);
    expect(screen.getByText("Lot FAB-TERMINE")).toBeInTheDocument();
    expect(screen.queryByText("Lot FAB-AFFINAGE")).not.toBeInTheDocument();

    await user.click(termineFilter);
    expect(screen.getByText(`Lot ${fabrication.numeroLot}`)).toBeInTheDocument();
    expect(screen.getByText("Lot FAB-AFFINAGE")).toBeInTheDocument();
    expect(fabriqueFilter).toHaveAttribute("aria-pressed", "false");
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
    await user.click(screen.getByRole("button", { name: "Fermer le détail de la fabrication" }));
    expect(await screen.findByRole("button", { name: "Passer en affinage" })).toBeInTheDocument();
  });

  it("masque le passage en affinage si la fabrication possède déjà un lot", async () => {
    affinageApiMocks.findAll.mockResolvedValue([{ fabricationId: fabrication.id }]);
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(await screen.findByRole("button", { name: "Voir le détail" }));
    await screen.findByText("Caillé homogène");

    await waitFor(() => expect(affinageApiMocks.findAll).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Passer en affinage" })).not.toBeInTheDocument();
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

    expect(await screen.findByText("Sélectionnez au moins un lot de lait.")).toBeInTheDocument();
    expect(screen.getByText("Quantité, température et origine")).toBeInTheDocument();
    expect(apiMocks.create).not.toHaveBeenCalled();
  });

  it.each(["14.9", "45.1"])(
    "affiche une erreur pour une température du lait hors plage (%s °C)",
    async (temperature) => {
      const user = userEvent.setup();
      render(<FabricationManager />);

      await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
      await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
      await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
      await user.click(screen.getByRole("button", { name: /Suivant/ }));
      await selectMilkLot(user, 1, milkLot.numeroLot);
      fireEvent.change(await screen.findByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "120" } });
      fireEvent.change(screen.getByLabelText(/Température du lait au début/), { target: { value: temperature } });
      await user.click(screen.getByRole("button", { name: /Suivant/ }));

      expect(await screen.findByText("La température du lait doit être comprise entre 15 °C et 45 °C.")).toBeInTheDocument();
      expect(screen.getByText("Quantité, température et origine")).toBeInTheDocument();
      expect(apiMocks.create).not.toHaveBeenCalled();
    },
  );

  it("ajoute un second sélecteur de lot uniquement à la demande", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
    await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
    await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect(screen.getAllByRole("combobox", { name: /Lot de lait/ })).toHaveLength(1);
    await selectMilkLot(user, 1, milkLot.numeroLot);
    expect(screen.getByText("Traite du matin")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantité utilisée pour le lot 1")).toHaveAttribute("type", "text");
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "70" } });
    await user.click(screen.getByRole("button", { name: "Ajouter un autre lot" }));
    await selectMilkLot(user, 2, secondMilkLot.numeroLot);
    expect(screen.getByText("Mélange")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 2"), { target: { value: "30" } });

    expect(screen.getAllByRole("combobox", { name: /Lot de lait/ })).toHaveLength(2);
    expect(screen.getByText("Total lait utilisé : 100 L")).toBeInTheDocument();
  });

  it("préremplit et recalcule la présure selon la quantité de lait", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
    await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
    await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await selectMilkLot(user, 1, milkLot.numeroLot);
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText(/Température du lait au début/), { target: { value: "31.5" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect((await screen.findByText("Recette :")).parentElement).toHaveTextContent("20 mL");
    expect(screen.getByLabelText(/Quantité réellement utilisée/)).toHaveValue("20");

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "150" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect((await screen.findByText("Recette :")).parentElement).toHaveTextContent("30 mL");
    expect(screen.getByLabelText(/Quantité réellement utilisée/)).toHaveValue("30");
    expect(screen.getByText(/Plage autorisée :/)).toHaveTextContent("18–42 mL");

    await user.click(screen.getByRole("combobox", { name: /Type de présure/ }));
    await user.click(await screen.findByRole("option", { name: "Présure microbienne" }));
    fireEvent.change(screen.getByLabelText(/Quantité réellement utilisée/), { target: { value: "150" } });
    expect(screen.queryByText(/Maximum autorisé/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "100" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    expect(await screen.findByText(/Maximum autorisé pour cette fabrication : 100 mL/)).toBeInTheDocument();
  });

  it("demande confirmation pour une présure différente très hors référence", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    await user.click(screen.getByRole("combobox", { name: /Type de présure/ }));
    await user.click(await screen.findByRole("option", { name: "Présure microbienne" }));
    fireEvent.change(screen.getByLabelText(/Quantité réellement utilisée/), { target: { value: "10000" } });
    expect(await screen.findByText(/Maximum autorisé pour cette fabrication : 120 mL/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Quantité réellement utilisée/), { target: { value: "3" } });
    expect(screen.getByText(/Plage indicative par rapport à la recette/)).toHaveTextContent("4,8–48 mL");
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));

    expect(await screen.findByRole("alertdialog", { name: "Vérifier la quantité de présure" })).toBeInTheDocument();
    expect(apiMocks.create).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirmer la quantité" }));

    await waitFor(() => expect(apiMocks.create).toHaveBeenCalledTimes(1));
    expect(apiMocks.create.mock.calls[0][0]).toMatchObject({
      typePresure: "Présure microbienne",
      quantitePresure: 3,
      presureHorsPlageConfirmee: true,
    });
  });

  it("préremplit, avertit et bloque les bornes absolues d'un ferment différent comparable", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    expect(screen.getByRole("combobox", { name: /Type de ferments/ })).toHaveTextContent("Ferments thermophiles");
    expect(screen.getByText(/Référence recette/).parentElement).toHaveTextContent("2,4 G");
    await user.click(screen.getByRole("combobox", { name: /Type de ferments/ }));
    await user.click(await screen.findByRole("option", { name: "Ferment mésophile" }));
    expect(screen.getByText(/la recette recommande « Ferments thermophiles »/)).toBeInTheDocument();
    expect(screen.getByText(/Plage indicative/)).toHaveTextContent("0,48–4,8 G");

    fireEvent.change(screen.getByLabelText(/Quantité de ferments/), { target: { value: "0.23" } });
    expect(await screen.findByText(/comprise entre 0,24 et 7,2 G/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Quantité de ferments/), { target: { value: "0.24" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));

    expect(await screen.findByRole("alertdialog", { name: "Vérifier la quantité de ferment" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmer la quantité" }));
    await waitFor(() => expect(apiMocks.create).toHaveBeenCalledTimes(1));
    expect(apiMocks.create.mock.calls[0][0]).toMatchObject({
      typeFerments: "Ferment mésophile",
      quantiteFerments: 0.24,
      fermentHorsPlageConfirmee: true,
    });
  });

  it("n'applique aucune fausse conversion à un ferment d'unité non comparable", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    await user.click(screen.getByRole("combobox", { name: /Type de ferments/ }));
    await user.click(await screen.findByRole("option", { name: "Ferment en dose" }));
    fireEvent.change(screen.getByLabelText(/Quantité de ferments/), { target: { value: "100" } });

    expect(screen.getByText(/aucune conversion automatique n’est appliquée/)).toBeInTheDocument();
    expect(screen.queryByText(/pour un ferment différent comparable/)).not.toBeInTheDocument();
  });

  it.each([
    ["", "Ce champ est obligatoire."],
    ["25.9", "La température de chauffage doit être comprise entre 26 °C et 48 °C."],
    ["48.1", "La température de chauffage doit être comprise entre 26 °C et 48 °C."],
  ])("bloque une température de chauffage invalide (%s)", async (temperature, message) => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
    await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
    await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await selectMilkLot(user, 1, milkLot.numeroLot);
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText(/Température du lait au début/), { target: { value: "31.5" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    fireEvent.change(screen.getByLabelText(/Température de chauffage/), { target: { value: temperature } });
    if (temperature) expect(await screen.findByText(message)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect((await screen.findAllByText(message)).length).toBeGreaterThan(0);
    expect(screen.getByText("Chauffage et présure")).toBeInTheDocument();
    expect(apiMocks.create).not.toHaveBeenCalled();
  });

  it.each(["", "9", "66"])("bloque une durée de chauffage invalide (%s)", async (duration) => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle fabrication" }));
    await user.click(await screen.findByRole("combobox", { name: /Recette/ }));
    await user.click(await screen.findByRole("option", { name: "Tomme fermière · Tomme classique" }));
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await selectMilkLot(user, 1, milkLot.numeroLot);
    fireEvent.change(screen.getByLabelText("Quantité utilisée pour le lot 1"), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText(/Température du lait au début/), { target: { value: "31.5" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    fireEvent.change(screen.getByLabelText(/Durée de chauffage/), { target: { value: duration } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    const message = duration === "" ? "Ce champ est obligatoire." : "La durée de chauffage doit être comprise entre 10 et 65 minutes.";
    expect((await screen.findAllByText(message)).length).toBeGreaterThan(0);
    expect(screen.getByText("Chauffage et présure")).toBeInTheDocument();
    expect(apiMocks.create).not.toHaveBeenCalled();
  });

  it.each([
    ["", "Ce champ est obligatoire."],
    ["19.9", "La température de mise en moule doit être comprise entre 20 °C et 50 °C."],
    ["50.1", "La température de mise en moule doit être comprise entre 20 °C et 50 °C."],
  ])("bloque une température de mise en moule invalide (%s)", async (temperature, message) => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    fireEvent.change(screen.getByLabelText(/Température de mise en moule/), { target: { value: temperature } });
    if (temperature) expect(await screen.findByText(message)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect((await screen.findAllByText(message)).length).toBeGreaterThan(0);
    expect(screen.getByText("Ferments, moulage et égouttage")).toBeInTheDocument();
  });

  it.each(["20", "35.5", "50"])("accepte une température de mise en moule valide (%s)", async (temperature) => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    fireEvent.change(screen.getByLabelText(/Température de mise en moule/), { target: { value: temperature } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));

    expect(await screen.findByText("Poids, quantité et observations")).toBeInTheDocument();
  });

  it("valide les heures et les convertit en minutes avant l'envoi", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Précédent/ }));
    await user.click(screen.getByRole("combobox", { name: /Unité de durée d'égouttage/ }));
    await user.click(await screen.findByRole("option", { name: "heures" }));
    fireEvent.change(screen.getByLabelText(/Durée d'égouttage/), { target: { value: "50" } });
    expect(await screen.findByText("La durée d'égouttage doit être comprise entre 30 minutes et 48 heures.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Durée d'égouttage/), { target: { value: "4" } });
    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));

    await waitFor(() => expect(apiMocks.create).toHaveBeenCalledTimes(1));
    expect(apiMocks.create.mock.calls[0][0]).toMatchObject({ dureeEgouttageMinutes: 240 });
  });

  it("bloque le maximum dynamique et confirme un nombre exceptionnellement faible", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    fireEvent.change(screen.getByLabelText(/Nombre de fromages produits/), { target: { value: "1201" } });
    expect(await screen.findByText("Le nombre de fromages produits ne peut pas dépasser 1200 pour cette quantité de lait.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre de fromages produits/), { target: { value: "1" } });
    expect(await screen.findByText(/très faible pour 120 L de lait utilisés/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));
    expect(await screen.findByRole("alertdialog", { name: "Vérifier le nombre de fromages" })).toBeInTheDocument();
    expect(apiMocks.create).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Confirmer cette valeur" }));
    await waitFor(() => expect(apiMocks.create).toHaveBeenCalledTimes(1));
    expect(apiMocks.create.mock.calls[0][0]).toMatchObject({
      nombreFromages: 1,
      nombreFromagesFaibleConfirme: true,
    });
  });

  it("bloque les rendements absolus et confirme un rendement atypique sans modifier le poids", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);
    await openAndFillValidForm(user);

    fireEvent.change(screen.getByLabelText(/Poids total à la sortie du moule/), { target: { value: "0.5" } });
    expect(await screen.findByText("Le poids total des fromages saisi est manifestement incohérent avec la quantité de lait utilisée.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Poids total à la sortie du moule/), { target: { value: "1.2" } });
    expect(await screen.findByText(/Rendement estimé/)).toHaveTextContent("1 %");
    expect(screen.getByText(/Le rendement paraît anormalement faible/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Enregistrer/ }));
    expect(await screen.findByRole("alertdialog", { name: "Vérifier le rendement" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmer le rendement" }));
    await waitFor(() => expect(apiMocks.create).toHaveBeenCalledTimes(1));
    expect(apiMocks.create.mock.calls[0][0]).toMatchObject({
      poidsTotalFromages: 1.2,
      rendementAnormalConfirme: true,
    });
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
      lotsLait: [{ lotLaitId: milkLot.id, quantiteUtilisee: 120 }],
      temperatureLait: 31.5,
      origineLait: "TRAITE_MATIN",
      temperatureChauffage: 42.8,
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

  it("préremplit toutes les étapes de la modale de modification", async () => {
    const user = userEvent.setup();
    render(<FabricationManager />);

    await user.click(await screen.findByRole("button", { name: `Modifier le lot ${fabrication.numeroLot}` }));

    expect(await screen.findByDisplayValue("2026-08-25T07:30")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Recette/ })).toHaveTextContent("Tomme fermière · Tomme classique");

    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    expect(screen.getByLabelText(/Quantité de lait/)).toHaveValue("120");
    expect(screen.getByLabelText(/Température du lait au début/)).toHaveValue("31.5");

    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    expect(screen.getByLabelText(/Température de chauffage/)).toHaveValue("32");
    expect(screen.getByRole("combobox", { name: /Type de présure/ })).toHaveTextContent("Présure animale");
    expect(screen.getByLabelText(/Quantité réellement utilisée/)).toHaveValue("25");

    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    expect(screen.getByRole("combobox", { name: /Type de ferments/ })).toHaveTextContent("Ferments thermophiles");
    expect(screen.getByLabelText(/Durée d'égouttage/)).toHaveValue("3");
    expect(screen.getByRole("combobox", { name: /Unité de durée d'égouttage/ })).toHaveTextContent("heures");

    await user.click(screen.getByRole("button", { name: /Suivant/ }));
    expect(screen.getByLabelText(/Poids total à la sortie du moule/)).toHaveValue("14.4");
    expect(screen.getByLabelText("Observations")).toHaveValue("Caillé homogène");

    await user.click(screen.getByRole("button", { name: "Enregistrer les modifications" }));
    expect(apiMocks.update).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog", { name: "Confirmer la modification ?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmer la modification" }));
    await waitFor(() => expect(apiMocks.update).toHaveBeenCalledTimes(1));
  });
});
