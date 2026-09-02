import { useEffect, useState } from "react";
import { ArrowRight, CircleDollarSign, Gauge, Scale, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { fabricationApi } from "../../fabrications/api/fabricationApi";
import { performanceApi, type PerformanceDashboard, type PerformanceIndicator } from "../api/performanceApi";

function iso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function firstDay(monthOffset = 0) {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
}
function lastDay() { const date = new Date(); return new Date(date.getFullYear(), date.getMonth() + 1, 0); }
function money(value: number | null) { return value == null ? "Non disponible" : `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`; }
function decimal(value: number | null, unit: string) { return value == null ? "Non disponible" : `${value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${unit}`; }
function monthLabel(year: number, month: number) { return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(new Date(year, month - 1)); }
function displayDate(value: string) { return new Intl.DateTimeFormat("fr-FR").format(new Date(`${value}T12:00:00`)); }

function Kpi({ label, indicator, format, evolutionUnit, icon: Icon, comparaison }: {
  label: string; indicator: PerformanceIndicator; format: (value: number | null) => string;
  evolutionUnit: string; icon: typeof Gauge; comparaison: string;
}) {
  const evolution = indicator.evolution;
  return <Card className="overflow-hidden rounded-3xl border-[#e4d7ca] bg-[#fffdf9] shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[0.16em] text-[#9a755e]">{label}</p><p className="mt-3 text-2xl font-bold text-[#31464d]">{format(indicator.valeur)}</p></div>
        <span className="rounded-2xl bg-[#f4e7df] p-3 text-[#c96543]"><Icon className="size-5" /></span>
      </div>
      <p className={`mt-3 text-xs ${evolution == null ? "text-[#8c7a6b]" : evolution >= 0 ? "text-[#39745c]" : "text-[#b14e3b]"}`}>
        {evolution == null ? comparaison : `${evolution >= 0 ? "+" : ""}${evolution.toLocaleString("fr-FR")} ${evolutionUnit} vs période précédente`}
      </p>
    </CardContent>
  </Card>;
}

export default function OwnerPerformanceDashboard() {
  const [dateDebut, setDateDebut] = useState(iso(firstDay()));
  const [dateFin, setDateFin] = useState(iso(lastDay()));
  const [fromageId, setFromageId] = useState("");
  const [fromages, setFromages] = useState<Array<{ id: number; nom: string }>>([]);
  const [data, setData] = useState<PerformanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fabricationApi.findRecettes().then((recipes) => {
      const uniques = new Map(recipes.map((recipe) => [recipe.fromageId, { id: recipe.fromageId, nom: recipe.fromageNom }]));
      setFromages([...uniques.values()].sort((a, b) => a.nom.localeCompare(b.nom)));
    }).catch(() => setFromages([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    performanceApi.dashboard({ dateDebut, dateFin, fromageId: fromageId ? Number(fromageId) : undefined })
      .then((response) => { if (active) setData(response); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Chargement des performances impossible."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dateDebut, dateFin, fromageId]);

  const chartData = data?.evolutionCouts.map((cost) => {
    const margin = data.evolutionMarges.find((item) => item.annee === cost.annee && item.mois === cost.mois);
    return { mois: monthLabel(cost.annee, cost.mois), cout: cost.coutMoyenKg, marge: margin?.margeBrute ?? null };
  }) ?? [];
  data?.evolutionMarges.forEach((margin) => {
    if (!chartData.some((item) => item.mois === monthLabel(margin.annee, margin.mois))) {
      chartData.push({ mois: monthLabel(margin.annee, margin.mois), cout: null, marge: margin.margeBrute });
    }
  });
  const empty = data && data.rendementMoyen.valeur == null && data.tauxPerte.valeur == null
    && data.coutMoyenKg.valeur == null && data.margeBrute.valeur == null
    && data.poidsMoyens.length === 0 && data.dureesAffinage.length === 0;
  const comparaison = data
    ? `Aucune donnée comparable du ${displayDate(data.periodePrecedente.dateDebut)} au ${displayDate(data.periodePrecedente.dateFin)}`
    : "Aucune donnée comparable sur la période précédente";

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f2e4d6_0,transparent_32%),#f7f4ef] px-4 py-6 text-[#3d312a] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[2rem] border border-[#dfd2c5] bg-[#fffaf4]/90 p-6 shadow-sm lg:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[#b27655]">Pilotage de la fromagerie</p>
        <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><h1 className="text-3xl font-bold tracking-tight text-[#31464d] sm:text-4xl">Vue stratégique</h1><p className="mt-2 max-w-2xl text-sm text-[#706053]">Rendement, pertes et rentabilité issus des fabrications, du stock et des livraisons réelles.</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-[#706053]">Du<input aria-label="Date de début" type="date" value={dateDebut} max={dateFin} onChange={(event) => setDateDebut(event.target.value)} className="mt-1 block rounded-xl border border-[#dfd2c5] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-[#706053]">Au<input aria-label="Date de fin" type="date" value={dateFin} min={dateDebut} onChange={(event) => setDateFin(event.target.value)} className="mt-1 block rounded-xl border border-[#dfd2c5] bg-white px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-[#706053]">Fromage<select aria-label="Fromage" value={fromageId} onChange={(event) => setFromageId(event.target.value)} className="mt-1 block w-full rounded-xl border border-[#dfd2c5] bg-white px-3 py-2 text-sm"><option value="">Tous</option>{fromages.map((cheese) => <option key={cheese.id} value={cheese.id}>{cheese.nom}</option>)}</select></label>
          </div>
        </div>
      </section>

      {error && <Card className="rounded-2xl border-[#efb4a1] bg-[#fff7f4]"><CardContent className="flex items-center justify-between gap-3 p-4"><p role="alert" className="text-sm text-[#a63d2f]">{error}</p><Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button></CardContent></Card>}
      {loading ? <Card className="rounded-2xl border-[#e4d7ca] bg-[#fffdf9]"><CardContent role="status" className="p-8 text-sm text-[#8c7a6b]">Calcul des indicateurs...</CardContent></Card> : empty ? <Card className="rounded-2xl border-[#e4d7ca] bg-[#fffdf9]"><CardContent className="p-8 text-center text-sm text-[#8c7a6b]">Aucune donnée exploitable sur cette période.</CardContent></Card> : data && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Rendement moyen" indicator={data.rendementMoyen} format={(v) => decimal(v, "%")} evolutionUnit="pt" icon={Gauge} comparaison={comparaison} />
          <Kpi label="Taux de perte" indicator={data.tauxPerte} format={(v) => decimal(v, "%")} evolutionUnit="pt" icon={TrendingUp} comparaison={comparaison} />
          <Kpi label="Coût moyen / kg" indicator={data.coutMoyenKg} format={money} evolutionUnit="%" icon={Scale} comparaison={comparaison} />
          <Kpi label="Marge brute" indicator={data.margeBrute} format={money} evolutionUnit="%" icon={CircleDollarSign} comparaison={comparaison} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <PerformanceChart title="Évolution du coût au kg" data={chartData} dataKey="cout" color="#c96543" unit="€" />
          <PerformanceChart title="Évolution de la marge brute" data={chartData} dataKey="marge" color="#3e7162" unit="€" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Summary title="Poids moyen par type" empty="Aucune fabrication sur cette période.">{data.poidsMoyens.map((item) => <MetricRow key={item.fromageId} name={item.fromageNom} value={decimal(item.poidsMoyenKg, "kg")} />)}</Summary>
          <Summary title="Affinage réel / prévu" empty="Aucune sortie d’affinage sur cette période.">{data.dureesAffinage.map((item) => <MetricRow key={item.fromageId} name={item.fromageNom} value={`${decimal(item.dureeReelleJours, "j")} / ${decimal(item.dureePrevueJours, "j")} (${item.ecartJours > 0 ? "+" : ""}${item.ecartJours} j)`} />)}</Summary>
        </div>
      </>}
      <div className="flex justify-end"><Button asChild className="rounded-xl bg-[#c96543] text-white hover:bg-[#ae5639]"><Link to="/rentabilite">Voir le détail de la rentabilité <ArrowRight className="ml-2 size-4" /></Link></Button></div>
    </div>
  </main>;
}

function PerformanceChart({ title, data, dataKey, color, unit }: { title: string; data: Array<{ mois: string; cout: number | null; marge: number | null }>; dataKey: "cout" | "marge"; color: string; unit: string }) {
  return <Card className="rounded-3xl border-[#e4d7ca] bg-[#fffdf9] shadow-sm"><CardHeader><CardTitle className="text-base text-[#31464d]">{title}</CardTitle></CardHeader><CardContent className="h-64 p-4 pt-0">{data.length === 0 ? <p className="pt-10 text-center text-sm text-[#8c7a6b]">Pas de donnée mensuelle.</p> : <ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid stroke="#eee4da" vertical={false} /><XAxis dataKey="mois" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} width={45} /><Tooltip formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} ${unit}`, title]} /><Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} connectNulls dot={{ r: 4 }} /></LineChart></ResponsiveContainer>}</CardContent></Card>;
}
function Summary({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) { const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children); return <Card className="rounded-3xl border-[#e4d7ca] bg-[#fffdf9]"><CardHeader><CardTitle className="text-base text-[#31464d]">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{hasChildren ? children : <p className="text-sm text-[#8c7a6b]">{empty}</p>}</CardContent></Card>; }
function MetricRow({ name, value }: { name: string; value: string }) { return <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f1ea] px-4 py-3 text-sm"><span className="font-semibold text-[#55463d]">{name}</span><span className="text-right text-[#8a654f]">{value}</span></div>; }
