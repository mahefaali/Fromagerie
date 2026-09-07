import { useEffect, useMemo, useState } from "react";

import { fabricationApi } from "../../fabrications/api/fabricationApi";
import {
  profitabilityApi,
  type LotProductionCost,
  type ProfitabilityAnalysis,
} from "../../profitability/api/profitabilityApi";
import { performanceApi, type PerformanceDashboard } from "../api/performanceApi";
import {
  calculateCosts,
  createChartData,
  getMostProfitable,
  getPeriodDates,
  toIsoDate,
  type Period,
} from "../components/ownerPerformance.utils";

type CheeseOption = { id: number; nom: string };

export function useOwnerPerformanceDashboard() {
  const today = useMemo(() => new Date(), []);
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState(() => toIsoDate(getPeriodDates("month", today).start));
  const [customEnd, setCustomEnd] = useState(() => toIsoDate(today));
  const [fromageId, setFromageId] = useState("all");
  const [fromages, setFromages] = useState<CheeseOption[]>([]);
  const [performance, setPerformance] = useState<PerformanceDashboard | null>(null);
  const [profitability, setProfitability] = useState<ProfitabilityAnalysis | null>(null);
  const [lots, setLots] = useState<LotProductionCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const dates = useMemo(
    () => period === "custom" ? null : getPeriodDates(period, today),
    [period, today],
  );
  const dateDebut = period === "custom" ? customStart : toIsoDate(dates!.start);
  const dateFin = period === "custom" ? customEnd : toIsoDate(dates!.end);
  const selectedFromageId = fromageId === "all" ? undefined : Number(fromageId);

  useEffect(() => {
    let active = true;
    fabricationApi.findRecettes()
      .then((recipes) => {
        if (!active) return;
        const unique = new Map(
          recipes.map((recipe) => [recipe.fromageId, { id: recipe.fromageId, nom: recipe.fromageNom }]),
        );
        setFromages([...unique.values()].sort((a, b) => a.nom.localeCompare(b.nom)));
      })
      .catch(() => { if (active) setFromages([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      performanceApi.dashboard({ dateDebut, dateFin, fromageId: selectedFromageId }),
      profitabilityApi.analyse({ dateDebut, dateFin, fromageId: selectedFromageId }),
      profitabilityApi.lots(),
    ])
      .then(([performanceData, profitabilityData, lotData]) => {
        if (!active) return;
        setPerformance(performanceData);
        setProfitability(profitabilityData);
        setLots(lotData);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Impossible de charger la vue d’ensemble.");
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [dateDebut, dateFin, selectedFromageId, reloadKey]);

  const costs = useMemo(
    () => calculateCosts(lots, dateDebut, dateFin, selectedFromageId),
    [lots, dateDebut, dateFin, selectedFromageId],
  );
  const chartData = useMemo(() => createChartData(performance), [performance]);
  const rows = useMemo(() => profitability?.parFromage ?? [], [profitability]);
  const top = useMemo(() => getMostProfitable(rows), [rows]);
  const periodHint = period === "custom"
    ? `du ${formatDate(dateDebut)} au ${formatDate(dateFin)}`
    : new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(dates!.end);

  return {
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    fromageId,
    setFromageId,
    fromages,
    dateDebut,
    dateFin,
    costs,
    chartData,
    rows,
    top,
    summary: profitability?.synthese,
    performance,
    periodHint,
    loading,
    error,
    retry: () => setReloadKey((key) => key + 1),
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(`${value}T12:00:00`));
}
