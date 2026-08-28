import { useEffect, useState } from "react";

import { fabricationApi } from "../api/fabricationApi";
import type {
  AnomalyAnalytics,
  AnomalyParameter,
  FabricationAnalyticsFilters,
  RecetteOption,
  SeasonalYieldComparison,
  TemperatureHistoryPoint,
  YieldAnalytics,
} from "../types/fabrication.types";

interface AnalyticsErrors {
  temperatures: string | null;
  rendements: string | null;
  saisons: string | null;
  anomalies: string | null;
}

const EMPTY_ERRORS: AnalyticsErrors = {
  temperatures: null,
  rendements: null,
  saisons: null,
  anomalies: null,
};

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Chargement impossible.";
}

export function useFabricationAnalytics() {
  const [filters, setFilters] = useState<FabricationAnalyticsFilters>({});
  const [anomalyParameter, setAnomalyParameter] = useState<AnomalyParameter | undefined>();
  const [recettes, setRecettes] = useState<RecetteOption[]>([]);
  const [recettesError, setRecettesError] = useState<string | null>(null);
  const [temperatures, setTemperatures] = useState<TemperatureHistoryPoint[]>([]);
  const [rendements, setRendements] = useState<YieldAnalytics | null>(null);
  const [saisons, setSaisons] = useState<SeasonalYieldComparison | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAnalytics | null>(null);
  const [errors, setErrors] = useState<AnalyticsErrors>(EMPTY_ERRORS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    fabricationApi.findRecettes()
      .then((data) => {
        if (active) setRecettes(data);
      })
      .catch((reason: unknown) => {
        if (active) setRecettesError(errorMessage(reason));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrors((current) => ({
      ...current,
      temperatures: null,
      rendements: null,
      saisons: null,
    }));

    const seasonalRequest = filters.fromageId === undefined
      ? Promise.resolve<SeasonalYieldComparison | null>(null)
      : fabricationApi.findSeasonalYieldComparison(filters.fromageId, {
          recetteId: filters.recetteId,
          dateDebut: filters.dateDebut,
          dateFin: filters.dateFin,
        });

    void Promise.allSettled([
      fabricationApi.findTemperatureHistory(filters),
      fabricationApi.findYieldAnalytics(filters),
      seasonalRequest,
    ]).then(([temperatureResult, yieldResult, seasonResult]) => {
      if (!active) return;

      const nextErrors = { ...EMPTY_ERRORS };
      if (temperatureResult.status === "fulfilled") {
        setTemperatures(temperatureResult.value);
      } else {
        setTemperatures([]);
        nextErrors.temperatures = errorMessage(temperatureResult.reason);
      }
      if (yieldResult.status === "fulfilled") {
        setRendements(yieldResult.value);
      } else {
        setRendements(null);
        nextErrors.rendements = errorMessage(yieldResult.reason);
      }
      if (seasonResult.status === "fulfilled") {
        setSaisons(seasonResult.value);
      } else {
        setSaisons(null);
        nextErrors.saisons = errorMessage(seasonResult.reason);
      }
      setErrors((current) => ({ ...current, ...nextErrors, anomalies: current.anomalies }));
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [filters, reloadKey]);

  useEffect(() => {
    let active = true;
    setIsLoadingAnomalies(true);
    setErrors((current) => ({ ...current, anomalies: null }));

    void fabricationApi.findAnomalies(filters, anomalyParameter)
      .then((data) => {
        if (active) setAnomalies(data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setAnomalies(null);
          setErrors((current) => ({ ...current, anomalies: errorMessage(reason) }));
        }
      })
      .finally(() => {
        if (active) setIsLoadingAnomalies(false);
      });

    return () => {
      active = false;
    };
  }, [filters, anomalyParameter, reloadKey]);

  return {
    filters,
    setFilters,
    anomalyParameter,
    setAnomalyParameter,
    recettes,
    recettesError,
    temperatures,
    rendements,
    saisons,
    anomalies,
    errors,
    isLoading,
    isLoadingAnomalies,
    retry: () => setReloadKey((key) => key + 1),
  };
}
