import { useEffect, useEffectEvent, useState } from "react";
import { Filter } from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { performanceApi, type PerformanceDashboard } from "../../features/performance/api/performanceApi";
import { IndicatorsDashboard } from "../../features/performance/components/IndicatorsDashboard";
import { ProductionCostsDashboard } from "../../features/profitability/components/ProductionCostsDashboard";
import { ProfitabilityDashboard } from "../../features/profitability/components/ProfitabilityDashboard";
import { profitabilityApi, type LotProductionCost, type ProfitabilityAnalysis } from "../../features/profitability/api/profitabilityApi";
import { orderApi, type ClientOption } from "../../features/stocks/api/stockApi";

type Period = "month" | "previous-month" | "three-months" | "six-months" | "year" | "custom";
interface Option { id: number; nom: string }

function iso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function datesFor(period: Exclude<Period, "custom">) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  if (period === "previous-month") return [iso(new Date(year, month - 1, 1)), iso(new Date(year, month, 0))];
  if (period === "three-months") return [iso(new Date(year, month - 2, 1)), iso(today)];
  if (period === "six-months") return [iso(new Date(year, month - 5, 1)), iso(today)];
  if (period === "year") return [iso(new Date(year, 0, 1)), iso(today)];
  return [iso(new Date(year, month, 1)), iso(today)];
}

export default function ProfitabilityPage() {
  const initialDates = datesFor("year");
  const [period, setPeriod] = useState<Period>("year");
  const [dateDebut, setDateDebut] = useState(initialDates[0]);
  const [dateFin, setDateFin] = useState(initialDates[1]);
  const [fromageId, setFromageId] = useState("all");
  const [fromages, setFromages] = useState<Option[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [analysis, setAnalysis] = useState<ProfitabilityAnalysis | null>(null);
  const [performance, setPerformance] = useState<PerformanceDashboard | null>(null);
  const [lots, setLots] = useState<LotProductionCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedFromageId = fromageId === "all" ? undefined : Number(fromageId);

  const load = async () => {
    setLoading(true);
    setError(null);
    const results = await Promise.allSettled([
      profitabilityApi.analyse({ dateDebut, dateFin, fromageId: selectedFromageId }),
      profitabilityApi.lots(),
      performanceApi.dashboard({ dateDebut, dateFin, fromageId: selectedFromageId }),
    ]);
    const [analysisResult, lotsResult, performanceResult] = results;
    if (analysisResult.status === "fulfilled") setAnalysis(analysisResult.value);
    if (lotsResult.status === "fulfilled") setLots(lotsResult.value);
    if (performanceResult.status === "fulfilled") setPerformance(performanceResult.value);
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected").map((result) => result.reason instanceof Error ? result.reason.message : "Chargement impossible");
    if (failures.length) setError(failures.join(" "));
    setLoading(false);
  };
  const loadData = useEffectEvent(load);

  useEffect(() => {
    Promise.all([orderApi.findFromages(), orderApi.findClients()]).then(([cheeses, customers]) => { setFromages(cheeses); setClients(customers); }).catch(() => setError("Impossible de charger les listes de filtres."));
  }, []);
  useEffect(() => { void loadData(); }, [dateDebut, dateFin, fromageId]);

  const changePeriod = (value: Period) => {
    setPeriod(value);
    if (value !== "custom") {
      const [start, end] = datesFor(value);
      setDateDebut(start);
      setDateFin(end);
    }
  };
  return <section className="mx-auto max-w-7xl space-y-7 pb-8 text-[#251f19]">
    <header><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a45d3f]">Pilotage économique</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Coûts & Rentabilité</h1><p className="mt-2 text-sm text-[#756650]">Comprendre ce que coûte la production, ce que rapportent les fromages et les clients.</p></header>

    <Card className="rounded-2xl border-[#d9d0c1] bg-[#f5efe4] py-0"><CardContent className={`grid gap-4 p-5 lg:items-end ${period === "custom" ? "lg:grid-cols-[auto_1.2fr_0.7fr_0.7fr_1.2fr]" : "lg:grid-cols-[auto_1fr_1fr]"}`}><div className="flex items-center gap-2 pb-2 text-sm font-medium text-[#6f624f]"><Filter className="size-5" />Filtres</div><label className="text-xs font-semibold text-[#766955]">Période<Select value={period} onValueChange={(value) => changePeriod(value as Period)}><SelectTrigger className="mt-1.5 h-14 rounded-xl border-[#ddd4c6] bg-[#f8f3ea] text-base"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="month">Ce mois</SelectItem><SelectItem value="previous-month">Mois précédent</SelectItem><SelectItem value="three-months">3 derniers mois</SelectItem><SelectItem value="six-months">6 derniers mois</SelectItem><SelectItem value="year">Cette année</SelectItem><SelectItem value="custom">Période personnalisée</SelectItem></SelectContent></Select></label>{period === "custom" && <><label className="text-xs font-semibold text-[#766955]">Du<input aria-label="Date de début" type="date" value={dateDebut} max={dateFin} onChange={(event) => setDateDebut(event.target.value)} className="mt-1.5 block h-14 w-full rounded-xl border border-[#ddd4c6] bg-[#f8f3ea] px-3 text-base font-normal" /></label><label className="text-xs font-semibold text-[#766955]">Au<input aria-label="Date de fin" type="date" value={dateFin} min={dateDebut} max={iso(new Date())} onChange={(event) => setDateFin(event.target.value)} className="mt-1.5 block h-14 w-full rounded-xl border border-[#ddd4c6] bg-[#f8f3ea] px-3 text-base font-normal" /></label></>}<label className="text-xs font-semibold text-[#766955]">Type de fromage<Select value={fromageId} onValueChange={setFromageId}><SelectTrigger className="mt-1.5 h-14 rounded-xl border-[#ddd4c6] bg-[#f8f3ea] text-base"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les fromages</SelectItem>{fromages.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nom}</SelectItem>)}</SelectContent></Select></label></CardContent></Card>

    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{error}</div>}

    <Tabs defaultValue="costs" className="space-y-7"><TabsList className="inline-flex h-auto w-max min-w-full justify-start gap-1.5 bg-[#EAE0D0] p-1 sm:min-w-0"><TabsTrigger value="costs">Coûts de production</TabsTrigger><TabsTrigger value="profitability">Rentabilité</TabsTrigger><TabsTrigger value="indicators">Indicateurs</TabsTrigger></TabsList>
      <TabsContent value="costs">{loading && lots.length === 0 ? <Loading /> : <ProductionCostsDashboard lots={lots} dateDebut={dateDebut} dateFin={dateFin} fromageId={selectedFromageId} />}</TabsContent>
      <TabsContent value="profitability">{loading && !analysis ? <Loading /> : <ProfitabilityDashboard analysis={analysis} clients={clients} />}</TabsContent>
      <TabsContent value="indicators">{loading && !performance ? <Loading /> : <IndicatorsDashboard data={performance} />}</TabsContent>
    </Tabs>
  </section>;
}

function Loading() { return <Card className="rounded-2xl border-[#d9d0c1] bg-[#f5efe4]"><CardContent role="status" className="p-8 text-sm text-[#806f59]">Calcul des données économiques…</CardContent></Card>; }
