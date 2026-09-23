import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { PaginationControls } from "../../../components/ui/pagination-controls";
import type { LotProductionCost } from "../api/profitabilityApi";
import { COST_DEFINITIONS, type CostCategory, type MonthlyProductionCost } from "./productionCosts.utils";

const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const preciseMoney = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const cardClass = "rounded-xl border-[#d9d0c1] bg-[#f5efe4] shadow-[0_1px_3px_rgba(67,52,33,0.12)]";

export function ProductionCostMetrics({ categories, lotCount }: { categories: CostCategory[]; lotCount: number }) {
  const total = categories.reduce((sum, category) => sum + category.value, 0);
  const metrics = [
    { label: "Coût total de la période", value: money.format(total), hint: `${lotCount} lot${lotCount > 1 ? "s" : ""} finalisé${lotCount > 1 ? "s" : ""}` },
    { label: "Coût matière", value: money.format(categories[0].value + categories[1].value), hint: "Lait + ingrédients" },
    { label: "Main-d’œuvre", value: money.format(categories[4].value), hint: "Fabrication, affinage, vente" },
    { label: "Énergie", value: money.format(categories[3].value), hint: "Chauffe, caves, froid" },
    { label: "Emballage", value: money.format(categories[2].value), hint: "Conditionnement des fromages" },
  ];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{metrics.map((metric) => <Card key={metric.label} className={`${cardClass} gap-1 py-2.5`}><CardContent className="min-w-0 px-3"><p className="text-xs leading-tight text-[#70634f]">{metric.label}</p><p className="mt-1 text-lg font-semibold sm:text-xl">{metric.value}</p><p className="mt-0.5 truncate text-[11px] text-[#806f59]" title={metric.hint}>{metric.hint}</p></CardContent></Card>)}</div>;
}

export function CostBreakdown({ categories, hasOtherPeriods }: { categories: CostCategory[]; hasOtherPeriods: boolean }) {
  const total = categories.reduce((sum, category) => sum + category.value, 0);
  return <div className="grid gap-3 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.8fr)]"><Card className={cardClass}><CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">Répartition des coûts</CardTitle></CardHeader><CardContent className="px-4 pb-4">{total === 0 ? <Empty hasOtherPeriods={hasOtherPeriods} /> : <><div className="mb-3 flex h-3 overflow-hidden rounded-full bg-[#e1d9cd]">{categories.map((category) => <span key={category.label} style={{ width: `${category.value / total * 100}%`, background: category.color }} />)}</div><div className="space-y-2">{categories.map((category) => <div key={category.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs sm:text-sm"><span className="flex items-center gap-2"><i className="size-3 rounded-full" style={{ background: category.color }} />{category.label}</span><span className="text-[#776954]">{number.format(category.value / total * 100)} %</span><strong className="min-w-20 text-right">{money.format(category.value)}</strong></div>)}</div><div className="mt-3 flex justify-between border-t border-[#d8cfc1] pt-3 text-sm font-semibold"><span>Coût total</span><span>{money.format(total)}</span></div></>}</CardContent></Card>
    <Card className={cardClass}><CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">Poids de chaque poste</CardTitle><p className="text-xs text-[#786a56]">Montants de la période par catégorie</p></CardHeader><CardContent className="h-60 px-3 pb-4 sm:h-64">{total === 0 ? <Empty /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={categories} margin={{ left: 4, right: 4 }}><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} interval={0} tick={{ fill: "#776954", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#776954", fontSize: 11 }} /><Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Bar dataKey="value" name="Montant" fill="#28551f" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>}</CardContent></Card></div>;
}

export function MonthlyCostChart({ data }: { data: MonthlyProductionCost[] }) {
  return <Card className={cardClass}><CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">Évolution mensuelle des coûts</CardTitle><p className="text-xs text-[#786a56]">Coût total et coût au kg</p></CardHeader><CardContent className="h-64 px-3 pb-4 sm:h-72">{data.length === 0 ? <Empty /> : <ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="mois" axisLine={false} tickLine={false} /><YAxis yAxisId="total" axisLine={false} tickLine={false} tickFormatter={(value) => money.format(value)} width={65} /><YAxis yAxisId="kg" orientation="right" axisLine={false} tickLine={false} tickFormatter={(value) => `${number.format(value)} €`} width={55} /><Tooltip formatter={(value, name) => [name === "Coût total" ? money.format(Number(value)) : preciseMoney.format(Number(value)), name]} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Line yAxisId="total" dataKey="total" name="Coût total" stroke="#28551f" strokeWidth={3} dot={false} /><Line yAxisId="kg" dataKey="coutKg" name="Coût au kg" stroke="#c94b29" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>}</CardContent></Card>;
}

export function CategoryDetails({ categories, lots }: { categories: CostCategory[]; lots: LotProductionCost[] }) {
  return <Card className={cardClass}><CardHeader><CardTitle>Détail par catégorie</CardTitle></CardHeader><CardContent className="space-y-5">{categories.map((category) => <section key={category.label}><div className="flex items-center justify-between border-b border-[#d8cfc1] pb-2 font-semibold"><span>{category.label}</span><span>{money.format(category.value)}</span></div>{lots.length > 0 && <div className="mt-2 space-y-1">{lots.filter((lot) => Number(lot[category.key]) > 0).map((lot) => <div key={lot.id} className="flex justify-between gap-4 py-1 text-sm text-[#756650]"><span>{lot.numeroLot} · {lot.fromageNom}</span><span>{preciseMoney.format(Number(lot[category.key]))}</span></div>)}</div>}</section>)}</CardContent></Card>;
}

export function LotCostCards({ lots, onSelect }: { lots: LotProductionCost[]; onSelect: (lot: LotProductionCost) => void }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(lots.length / 6));
  const visibleLots = useMemo(() => {
    const start = (page - 1) * 6;
    return lots.slice(start, start + 6);
  }, [lots, page]);

  useEffect(() => {
    setPage(1);
  }, [lots]);

  return <Card className={cardClass}>
    <CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">Coût par lot</CardTitle></CardHeader>
    <CardContent className="px-4 pb-4">{lots.length === 0 ? <div className="h-32"><Empty /></div> : <div className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">{visibleLots.map((lot) => <button key={lot.id} type="button" onClick={() => onSelect(lot)} className="rounded-xl border border-[#ddd4c6] bg-[#fffdf8] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c94b29] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c94b29]"><div className="flex items-center justify-between"><strong>{lot.numeroLot}</strong><ChevronRight className="size-4 text-[#776954]" /></div><p className="mt-1 text-xs text-[#756650]">{lot.fromageNom}</p><div className="mt-3 flex flex-wrap items-end justify-between gap-2"><strong className="text-lg sm:text-xl">{money.format(lot.coutTotal)}</strong><span className="text-xs text-[#756650]">{number.format(lot.poidsTotal)} kg · {preciseMoney.format(lot.coutParKg)}/kg</span></div></button>)}</div>
      <div className="flex justify-end"><PaginationControls page={page} pageCount={pageCount} onPageChange={setPage} label="Pagination des coûts par lot" /></div>
    </div>}</CardContent>
  </Card>;
}

export function LotCostDialog({ lot, onClose }: { lot: LotProductionCost | null; onClose: () => void }) {
  return <Dialog open={lot !== null} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="rounded-xl"><DialogHeader><DialogTitle>Coût du lot {lot?.numeroLot}</DialogTitle></DialogHeader>{lot && <div className="grid grid-cols-2 gap-2 text-sm">{COST_DEFINITIONS.map((definition) => <div key={definition.label} className="rounded-lg bg-[#f7f3ec] p-2.5"><p className="text-[#8a7565]">{definition.label}</p><p className="mt-1 font-semibold">{preciseMoney.format(Number(lot[definition.key]))}</p></div>)}<div className="col-span-2 rounded-xl bg-[#28551f] p-3 text-white"><p>Coût total</p><p className="mt-1 text-xl font-semibold">{preciseMoney.format(lot.coutTotal)}</p></div></div>}</DialogContent></Dialog>;
}

function Empty({ hasOtherPeriods = false }: { hasOtherPeriods?: boolean }) {
  return <div className="flex h-full min-h-24 items-center justify-center px-4 text-center text-sm text-[#806f59]">{hasOtherPeriods ? "Aucun coût finalisé pour ces filtres. Élargissez la période ou choisissez un autre fromage." : "Aucun coût définitif n’a encore été calculé pour un lot."}</div>;
}
