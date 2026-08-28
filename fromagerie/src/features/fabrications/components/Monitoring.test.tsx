import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fabricationApi } from "../api/fabricationApi";
import type {
  AnomalyAnalytics,
  SeasonalYieldComparison,
  TemperatureHistoryPoint,
  YieldAnalytics,
} from "../types/fabrication.types";
import Monitoring from "./Monitoring";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  Line: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const temperatureHistory: TemperatureHistoryPoint[] = [{
  fabricationId: 12,
  numeroLot: "20260825-001",
  dateHeureDebut: "2026-08-25T10:00:00",
  fromageId: 2,
  fromageNom: "Fromage des Hauts",
  recetteId: 5,
  recetteNom: "Recette traditionnelle",
  temperatureChauffage: 38,
}];

const yieldAnalytics: YieldAnalytics = {
  nombreFabrications: 3,
  moyenne: 10.25,
  minimum: 9.5,
  maximum: 11,
  historique: [{
    fabricationId: 12,
    numeroLot: "20260825-001",
    dateHeureDebut: "2026-08-25T10:00:00",
    fromageId: 2,
    fromageNom: "Fromage des Hauts",
    recetteId: 5,
    recetteNom: "Recette traditionnelle",
    rendement: 10.25,
  }],
};

const seasons: SeasonalYieldComparison = {
  fromageId: 2,
  fromageNom: "Fromage des Hauts",
  saisonSeche: {
    nombreFabrications: 2,
    moyenne: 10,
    minimum: 9.5,
    maximum: 10.5,
    donneesDisponibles: true,
  },
  saisonHumide: {
    nombreFabrications: 1,
    moyenne: 11,
    minimum: 11,
    maximum: 11,
    donneesDisponibles: true,
  },
};

const anomalyAnalytics: AnomalyAnalytics = {
  minimumEchantillons: 8,
  donneesInsuffisantes: [],
  anomalies: [{
    fabricationId: 12,
    numeroLot: "20260825-001",
    dateHeureDebut: "2026-08-25T10:00:00",
    fromageId: 2,
    fromageNom: "Fromage des Hauts",
    recetteId: 5,
    recetteNom: "Recette traditionnelle",
    statut: "ANOMALIE",
    baselineUtilisee: "MEME_RECETTE_ET_SAISON",
    nombreEchantillons: 8,
    anomalies: [
      {
        parametre: "RENDEMENT",
        valeur: 6.8,
        borneBasse: 9.2,
        borneHaute: 11.1,
        direction: "BASSE",
        message: "Rendement inhabituellement bas",
      },
      {
        parametre: "TEMPERATURE_CHAUFFAGE",
        valeur: 45,
        borneBasse: 36,
        borneHaute: 40,
        direction: "HAUTE",
        message: "Température de chauffage inhabituellement élevée",
      },
    ],
  }],
};

describe("Monitoring", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(fabricationApi, "findRecettes").mockResolvedValue([{
      id: 5,
      nom: "Recette traditionnelle",
      varianteKey: "legacy-2",
      fromageId: 2,
      fromageNom: "Fromage des Hauts",
      version: 1,
      active: true,
      coutMatiereEstime: 84,
    }]);
    vi.spyOn(fabricationApi, "findTemperatureHistory").mockResolvedValue(temperatureHistory);
    vi.spyOn(fabricationApi, "findYieldAnalytics").mockResolvedValue(yieldAnalytics);
    vi.spyOn(fabricationApi, "findSeasonalYieldComparison").mockResolvedValue(seasons);
    vi.spyOn(fabricationApi, "findAnomalies").mockResolvedValue(anomalyAnalytics);
  });

  it("affiche les historiques, statistiques et anomalies fournis par le backend", async () => {
    render(<Monitoring />);

    expect(screen.getByRole("heading", { name: "Suivi des paramètres" })).toBeInTheDocument();
    expect((await screen.findAllByText("20260825-001")).length).toBe(2);
    expect(screen.getByText("38 °C")).toBeInTheDocument();
    expect(screen.getAllByText("10,25 %").length).toBeGreaterThan(0);
    expect(screen.getByText("Rendement inhabituellement bas")).toBeInTheDocument();
    expect(screen.getByText("Température de chauffage inhabituellement élevée")).toBeInTheDocument();
    expect(screen.getByText("Baseline minimale : 8 échantillons")).toBeInTheDocument();
  });

  it("applique le filtre fromage au backend et affiche la comparaison saisonnière", async () => {
    const user = userEvent.setup();
    render(<Monitoring />);
    await screen.findAllByText("20260825-001");

    await user.click(screen.getByRole("combobox", { name: "Fromage" }));
    await user.click(screen.getByRole("option", { name: "Fromage des Hauts" }));

    await waitFor(() => {
      expect(fabricationApi.findTemperatureHistory).toHaveBeenLastCalledWith({ fromageId: 2 });
      expect(fabricationApi.findSeasonalYieldComparison).toHaveBeenCalledWith(2, {
        recetteId: undefined,
        dateDebut: undefined,
        dateFin: undefined,
      });
    });
    expect(await screen.findByText("Saison sèche")).toBeInTheDocument();
    expect(screen.getByText("Saison humide")).toBeInTheDocument();
  });

  it("transmet la période sélectionnée aux analyses backend", async () => {
    render(<Monitoring />);
    await screen.findAllByText("20260825-001");

    fireEvent.change(screen.getByLabelText("Date de début"), {
      target: { value: "2026-08-01" },
    });
    fireEvent.change(screen.getByLabelText("Date de fin"), {
      target: { value: "2026-08-31" },
    });

    await waitFor(() => {
      expect(fabricationApi.findTemperatureHistory).toHaveBeenLastCalledWith({
        dateDebut: "2026-08-01",
        dateFin: "2026-08-31",
      });
      expect(fabricationApi.findYieldAnalytics).toHaveBeenLastCalledWith({
        dateDebut: "2026-08-01",
        dateFin: "2026-08-31",
      });
    });
  });

  it("distingue clairement absence de données et historique insuffisant", async () => {
    vi.mocked(fabricationApi.findTemperatureHistory).mockResolvedValue([]);
    vi.mocked(fabricationApi.findYieldAnalytics).mockResolvedValue({
      nombreFabrications: 0,
      moyenne: null,
      minimum: null,
      maximum: null,
      historique: [],
    });
    vi.mocked(fabricationApi.findAnomalies).mockResolvedValue({
      minimumEchantillons: 8,
      anomalies: [],
      donneesInsuffisantes: [{
        ...anomalyAnalytics.anomalies[0],
        statut: "DONNEES_INSUFFISANTES",
        anomalies: [],
      }],
    });

    render(<Monitoring />);

    expect(await screen.findByText("Aucun historique de température disponible pour cette période.")).toBeInTheDocument();
    expect(screen.getByText("Aucun rendement disponible pour cette période.")).toBeInTheDocument();
    expect(screen.getByText("Pas encore assez de données pour détecter des anomalies fiables.")).toBeInTheDocument();
    expect(screen.queryByText("Aucune anomalie détectée pour ce périmètre.")).not.toBeInTheDocument();
  });

  it("affiche les erreurs backend et permet de relancer", async () => {
    const user = userEvent.setup();
    vi.mocked(fabricationApi.findTemperatureHistory).mockRejectedValue(new Error("Service indisponible"));
    vi.mocked(fabricationApi.findYieldAnalytics).mockRejectedValue(new Error("Erreur réseau"));
    vi.mocked(fabricationApi.findAnomalies).mockRejectedValue(new Error("Accès impossible"));

    render(<Monitoring />);

    expect((await screen.findAllByText("Impossible de charger cette analyse.")).length).toBe(3);
    expect(screen.getByText("Service indisponible")).toBeInTheDocument();
    expect(screen.getByText("Erreur réseau")).toBeInTheDocument();
    expect(screen.getByText("Accès impossible")).toBeInTheDocument();

    vi.mocked(fabricationApi.findTemperatureHistory).mockResolvedValue(temperatureHistory);
    vi.mocked(fabricationApi.findYieldAnalytics).mockResolvedValue(yieldAnalytics);
    vi.mocked(fabricationApi.findAnomalies).mockResolvedValue(anomalyAnalytics);
    await user.click(screen.getAllByRole("button", { name: "Réessayer" })[0]);

    expect(await screen.findByText("38 °C")).toBeInTheDocument();
  });
});
