import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../../../services/http/apiClient";
import type { RecetteDetail, RecetteListItem } from "../types/recipe.types";
import RecipeManager from "./RecipeManager";

const mocks = vi.hoisted(() => ({
  createRecipe: vi.fn(),
  createCheese: vi.fn(),
  createMaterial: vi.fn(),
  createVersion: vi.fn(),
  loadCatalog: vi.fn(),
  loadHistory: vi.fn(),
  loadRecipeDetail: vi.fn(),
  reloadSelectedRecipe: vi.fn(),
  selectCheese: vi.fn(),
  setSelectedId: vi.fn(),
  role: "PROPRIETAIRE" as "PROPRIETAIRE" | "FABRICATION",
  hookValue: {} as Record<string, unknown>,
}));

vi.mock("../hooks/useRecipes", () => ({ useRecipes: () => mocks.hookValue }));
vi.mock("../../authentication/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, username: "demo", nom: "Propriétaire", role: mocks.role } }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const classic: RecetteListItem = {
  id: 10,
  nom: "Classique",
  varianteKey: "legacy-2",
  fromageId: 2,
  fromageNom: "Fromage des Hauts",
  version: 2,
  active: true,
  coutMatiereEstime: 73,
};

const herbs: RecetteListItem = {
  ...classic,
  id: 11,
  nom: "Aux herbes",
  varianteKey: "5b4be7b6-4b8e-4f80-980f-f12ddc9e276c",
  version: 1,
  coutMatiereEstime: 76.5,
};

const detail: RecetteDetail = {
  ...classic,
  dateCreation: "2026-08-25T10:00:00",
  ingredients: [
    {
      id: 100,
      matierePremiereId: 1,
      matierePremiereNom: "Lait",
      quantite: 100,
      unite: "L",
      coutUnitaireReference: 0.7,
      coutEstime: 70,
    },
    {
      id: 101,
      matierePremiereId: 2,
      matierePremiereNom: "Sel",
      quantite: 2,
      unite: "KG",
      coutUnitaireReference: 1.5,
      coutEstime: 3,
    },
  ],
};

const herbsDetail: RecetteDetail = {
  ...detail,
  ...herbs,
  varianteKey: "variant-herbs",
  ingredients: [
    {
      id: 102,
      matierePremiereId: 3,
      matierePremiereNom: "Herbes",
      quantite: 0.5,
      unite: "KG",
      coutUnitaireReference: 7,
      coutEstime: 3.5,
    },
  ],
};

beforeEach(() => {
  mocks.role = "PROPRIETAIRE";
  mocks.createRecipe.mockResolvedValue({ ...detail, id: 12, version: 1 });
  mocks.createCheese.mockResolvedValue({ id: 7, nom: "Tomme fermière", description: "Pâte pressée" });
  mocks.createMaterial.mockResolvedValue({ id: 8, nom: "Ferments lactiques", uniteReference: "G", coutUnitaire: 4.5, actif: true });
  mocks.createVersion.mockResolvedValue({ ...detail, id: 13, version: 3 });
  mocks.loadRecipeDetail.mockResolvedValue(herbsDetail);
  mocks.loadHistory.mockResolvedValue([
    { id: 9, version: 1, nom: "Classique", dateCreation: "2026-08-20T10:00:00", active: false, coutMatiereEstime: 70 },
    { id: 10, version: 2, nom: "Classique", dateCreation: "2026-08-25T10:00:00", active: true, coutMatiereEstime: 73 },
  ]);
  mocks.hookValue = {
    recipes: [classic, herbs],
    materials: [
      { id: 1, nom: "Lait", uniteReference: "L", coutUnitaire: 0.7, actif: true },
      { id: 2, nom: "Sel", uniteReference: "KG", coutUnitaire: 1.5, actif: true },
      { id: 3, nom: "Herbes", uniteReference: "KG", coutUnitaire: 7, actif: true },
    ],
    cheeses: [{ id: 2, nom: "Fromage des Hauts", description: "Pâte pressée" }],
    selectedId: 10,
    selectedRecipe: detail,
    isLoading: false,
    isLoadingDetail: false,
    isLoadingCatalog: false,
    error: null,
    detailError: null,
    catalogError: null,
    selectCheese: mocks.selectCheese,
    setSelectedId: mocks.setSelectedId,
    reloadSelectedRecipe: mocks.reloadSelectedRecipe,
    loadCatalog: mocks.loadCatalog,
    loadReferenceData: vi.fn(),
    createRecipe: mocks.createRecipe,
    createCheese: mocks.createCheese,
    createMaterial: mocks.createMaterial,
    createVersion: mocks.createVersion,
    loadHistory: mocks.loadHistory,
    loadRecipeDetail: mocks.loadRecipeDetail,
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("gestion des recettes", () => {
  it("utilise le type de fromage dans le sélecteur supérieur", () => {
    render(<RecipeManager />);

    const cheeseSelect = screen.getByLabelText("Type de fromage");
    expect(cheeseSelect).toHaveTextContent("Fromage des Hauts");
    expect(cheeseSelect).not.toHaveTextContent("Classique");
    expect(screen.queryByLabelText("Recette")).not.toBeInTheDocument();
  });

  it("demande au hook de sélectionner la recette de base du fromage choisi", async () => {
    const blueCheese: RecetteListItem = {
      ...classic,
      id: 20,
      fromageId: 3,
      fromageNom: "Bleu des Hauts",
      nom: "Bleu classique",
    };
    mocks.hookValue = { ...mocks.hookValue, recipes: [classic, herbs, blueCheese] };
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByLabelText("Type de fromage"));
    await user.click(screen.getByRole("option", { name: "Bleu des Hauts" }));

    expect(mocks.selectCheese).toHaveBeenCalledWith(3);
  });

  it("affiche des états de chargement et de liste vide accessibles", () => {
    mocks.hookValue = { ...mocks.hookValue, isLoading: true };
    const { rerender } = render(<RecipeManager />);

    expect(screen.getByRole("status")).toHaveTextContent("Chargement des recettes");

    mocks.hookValue = {
      ...mocks.hookValue,
      isLoading: false,
      recipes: [],
      selectedId: null,
      selectedRecipe: null,
    };
    rerender(<RecipeManager />);

    expect(screen.getByText("Aucune recette disponible.")).toBeInTheDocument();
  });

  it("affiche les coûts fournis par le backend en euros", () => {
    render(<RecipeManager />);

    expect(screen.getByText("Classique", { selector: "[data-slot='card-title']" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Recette de base" })).toBeInTheDocument();
    expect(screen.getByText("Fromage des Hauts · version 2 · version courante")).toBeInTheDocument();
    expect(screen.getByText("Lait")).toBeInTheDocument();
    expect(screen.getByText("100 L")).toBeInTheDocument();
    expect(screen.getByText("0,7 € / L")).toBeInTheDocument();
    expect(screen.getByText("73,00 €")).toBeInTheDocument();
  });

  it("ouvre le détail d’une variante en modale sans remplacer la recette de base", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("tab", { name: /Variantes/ }));
    expect(screen.getByText("Aux herbes")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Voir la variante" }));

    expect(mocks.loadRecipeDetail).toHaveBeenCalledWith(11);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Aux herbes" })).toBeInTheDocument();
    expect(within(dialog).getByText("Herbes")).toBeInTheDocument();
    expect(screen.getByText("Classique", { selector: "[data-slot='card-title']" })).toBeInTheDocument();
    expect(mocks.setSelectedId).not.toHaveBeenCalled();
  });

  it("n’affiche pas les anciennes versions parmi les variantes", async () => {
    const historical: RecetteListItem = {
      ...classic,
      id: 9,
      nom: "Classique historique",
      version: 1,
      active: false,
    };
    mocks.hookValue = { ...mocks.hookValue, recipes: [historical, classic, herbs] };
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("tab", { name: /Variantes/ }));

    expect(screen.getByText("Aux herbes")).toBeInTheDocument();
    expect(screen.queryByText("Classique historique")).not.toBeInTheDocument();
  });

  it("charge et affiche l’historique réellement renvoyé", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("button", { name: /Historique/ }));

    expect(mocks.loadHistory).toHaveBeenCalledWith(10);
    expect(await screen.findByText("Version 1 · Classique")).toBeInTheDocument();
    expect(screen.getAllByText("Historique").length).toBeGreaterThan(0);
    expect(screen.getByText("Courante")).toBeInTheDocument();
  });

  it("valide une quantité positive puis crée une nouvelle version", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("button", { name: /Modifier/ }));
    const quantityInputs = screen.getAllByLabelText("Quantité");
    await user.clear(quantityInputs[0]);
    await user.click(screen.getByRole("button", { name: /Enregistrer la révision/ }));
    expect(await screen.findByText("Chaque quantité doit être strictement positive.")).toBeInTheDocument();
    expect(mocks.createVersion).not.toHaveBeenCalled();

    await user.type(quantityInputs[0], "110");
    await user.click(screen.getByRole("button", { name: /Enregistrer la révision/ }));
    await waitFor(() => expect(mocks.createVersion).toHaveBeenCalledWith(10, {
      nom: "Classique",
      ingredients: [
        { matierePremiereId: 1, quantite: 110, unite: "L" },
        { matierePremiereId: 2, quantite: 2, unite: "KG" },
      ],
    }));
  });

  it("permet au propriétaire de choisir et versionner une variante", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("button", { name: /Modifier/ }));
    await user.selectOptions(screen.getByLabelText("Recette à modifier"), "11");

    expect(mocks.loadRecipeDetail).toHaveBeenCalledWith(11);
    await waitFor(() => expect(screen.getByLabelText("Nom de la recette")).toHaveValue("Aux herbes"));
    expect(screen.getByLabelText("Recette à modifier")).toHaveTextContent("Aux herbes · Variante");

    await user.click(screen.getByRole("button", { name: /Enregistrer la révision/ }));

    await waitFor(() => expect(mocks.createVersion).toHaveBeenCalledWith(11, {
      nom: "Aux herbes",
      ingredients: [
        { matierePremiereId: 3, quantite: 0.5, unite: "KG" },
      ],
    }));
  });

  it("crée une recette avec le fromage et les matières du référentiel", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("tab", { name: /Variantes/ }));
    await user.click(screen.getByRole("button", { name: "Ajouter une variante" }));
    await user.type(screen.getByLabelText("Nom de la recette"), "Au poivre");
    await user.type(screen.getByLabelText("Quantité"), "90");
    await user.click(screen.getByRole("button", { name: "Créer la recette" }));

    await waitFor(() => expect(mocks.createRecipe).toHaveBeenCalledWith({
      nom: "Au poivre",
      fromageId: 2,
      recetteDeBase: false,
      ingredients: [{ matierePremiereId: 1, quantite: 90, unite: "L" }],
    }));
  });

  it("ajoute et sélectionne un nouveau type de fromage depuis la modale", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle recette" }));
    await user.type(screen.getByLabelText("Nom de la recette"), "Recette fermière");
    await user.click(screen.getByRole("button", { name: "Ajouter un nouveau type de fromage" }));
    await user.type(screen.getByLabelText("Nom du fromage"), "Tomme fermière");
    await user.type(screen.getByLabelText("Description"), "Pâte pressée");
    await user.click(screen.getByRole("button", { name: "Ajouter et sélectionner" }));

    await waitFor(() => expect(mocks.createCheese).toHaveBeenCalledWith({
      nom: "Tomme fermière",
      description: "Pâte pressée",
    }));
    await user.type(screen.getByLabelText("Quantité"), "80");
    await user.click(screen.getByRole("button", { name: "Créer la recette" }));

    await waitFor(() => expect(mocks.createRecipe).toHaveBeenCalledWith({
      nom: "Recette fermière",
      fromageId: 7,
      recetteDeBase: true,
      ingredients: [{ matierePremiereId: 1, quantite: 80, unite: "L" }],
    }));
  });

  it("crée une nouvelle matière première depuis le bas de la modale", async () => {
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("button", { name: "Nouvelle recette" }));
    await user.click(screen.getByRole("button", { name: "Créer un nouvel ingrédient" }));
    await user.type(screen.getByLabelText("Nom de l’ingrédient"), "Ferments lactiques");
    await user.selectOptions(screen.getByLabelText("Unité de référence"), "G");
    await user.type(screen.getByLabelText("Coût unitaire de référence (€)"), "4.5");
    await user.click(screen.getByRole("button", { name: "Ajouter à la recette" }));

    await waitFor(() => expect(mocks.createMaterial).toHaveBeenCalledWith({
      nom: "Ferments lactiques",
      uniteReference: "G",
      coutUnitaire: 4.5,
      actif: true,
    }));
  });

  it("conserve le formulaire ouvert et sa saisie après une erreur backend", async () => {
    mocks.createVersion.mockRejectedValue(new HttpError(409, "Conflit de version"));
    const user = userEvent.setup();
    render(<RecipeManager />);

    await user.click(screen.getByRole("button", { name: /Modifier/ }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Enregistrer la révision/ }));

    expect(await screen.findByText("Conflit de version")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom de la recette")).toHaveValue("Classique");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("affiche les états réseau et masque les écritures pour FABRICATION", () => {
    mocks.role = "FABRICATION";
    mocks.hookValue = { ...mocks.hookValue, error: "Serveur indisponible", isLoading: false };
    const { rerender } = render(<RecipeManager />);

    expect(screen.getByRole("alert")).toHaveTextContent("Serveur indisponible");
    mocks.hookValue = { ...mocks.hookValue, error: null };
    rerender(<RecipeManager />);
    expect(screen.queryByRole("button", { name: "Nouvelle recette" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Modifier/ })).not.toBeInTheDocument();
  });

  it("laisse les recettes visibles lorsqu’un référentiel propriétaire est refusé", () => {
    mocks.hookValue = {
      ...mocks.hookValue,
      catalogError: "Matières premières : Accès refusé",
      isLoadingCatalog: false,
    };

    render(<RecipeManager />);

    expect(screen.getByText("Classique", { selector: "[data-slot='card-title']" })).toBeInTheDocument();
    expect(screen.getByText("Les recettes restent consultables, mais le formulaire est indisponible.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nouvelle recette" })).toBeDisabled();
  });
});
