import { ArrowUpRight } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { ProfitabilityGroup } from "../../profitability/api/profitabilityApi";
import { OWNER_CARD_CLASS, type ChartPoint, type CostItem } from "./ownerPerformance.utils";

const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const preciseMoney = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function KpiCard({ label, value, hint, evolution }: { label: string; value: string; hint: string; evolution?: number | null }) {
  return <Card className={`${OWNER_CARD_CLASS} gap-4 py-5`}><CardContent className="px-5">
    <p className="text-sm font-medium text-[#6f624f]">{label}</p>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#171b18]">{value}</p>
    <div className="mt-2 min-h-6">{evolution != null
      ? <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${evolution >= 0 ? "bg-[#dfe6d2] text-[#2b5b22]" : "bg-[#f3dcd2] text-[#a54127]"}`}><ArrowUpRight className={`mr-1 size-3.5 ${evolution < 0 ? "rotate-90" : ""}`} />{evolution >= 0 ? "+" : ""}{number.format(evolution)} %</span>
      : <span className="text-sm text-[#8b7c68]">{hint}</span>}</div>
  </CardContent></Card>;
}

export function CostAndMarginChart({ data }: { data: ChartPoint[] }) {
  return <Card className={OWNER_CARD_CLASS}><CardHeader><CardTitle className="text-lg">Coût au kg et marge</CardTitle><p className="text-sm text-[#786a56]">Évolution mensuelle</p></CardHeader><CardContent className="h-80 pb-5">{data.length === 0 ? <EmptyState label="Aucune évolution mensuelle disponible." /> : <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: "#7e705d", fontSize: 12 }} /><YAxis yAxisId="cost" axisLine={false} tickLine={false} width={52} tickFormatter={(value) => `${value} €`} tick={{ fill: "#7e705d", fontSize: 12 }} /><YAxis yAxisId="margin" orientation="right" axisLine={false} tickLine={false} width={58} tickFormatter={(value) => money.format(value)} tick={{ fill: "#7e705d", fontSize: 12 }} /><Tooltip formatter={(value, name) => [name === "Coût/kg" ? preciseMoney.format(Number(value)) : money.format(Number(value)), name]} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Line yAxisId="cost" type="monotone" dataKey="cout" name="Coût/kg" stroke="#789d5d" strokeWidth={3} dot={false} connectNulls /><Line yAxisId="margin" type="monotone" dataKey="marge" name="Marge" stroke="#c94b29" strokeWidth={3} dot={false} connectNulls /></LineChart></ResponsiveContainer>}</CardContent></Card>;
}

export function CostBreakdown({ items, total }: { items: CostItem[]; total: number }) {
  return <Card className={OWNER_CARD_CLASS}><CardHeader><CardTitle className="text-lg">Répartition des coûts</CardTitle></CardHeader><CardContent>{total <= 0 ? <div className="h-64"><EmptyState label="Aucun coût de lot sur cette période." /></div> : <><div className="mb-5 flex h-4 overflow-hidden rounded-full bg-[#e5ded2]" aria-label="Répartition proportionnelle des coûts">{items.map((item) => <span key={item.label} style={{ width: `${item.value / total * 100}%`, backgroundColor: item.color }} />)}</div><div className="space-y-3">{items.map((item) => <div key={item.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"><span className="flex items-center gap-3"><i className="size-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="text-[#786a56]">{number.format(item.value / total * 100)} %</span><strong className="min-w-20 text-right">{money.format(item.value)}</strong></div>)}</div><div className="mt-5 flex justify-between border-t border-[#d8cfc1] pt-4 text-sm font-semibold"><span>Coût total</span><span>{money.format(total)}</span></div></>}</CardContent></Card>;
}

export function ProfitabilityTable({ rows }: { rows: ProfitabilityGroup[] }) {
  return <Card className={OWNER_CARD_CLASS}><CardHeader><CardTitle className="text-lg">Rentabilité par fromage</CardTitle></CardHeader><CardContent className="overflow-x-auto">{rows.length === 0 ? <div className="h-40"><EmptyState label="Aucune livraison sur cette période." /></div> : <table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b border-[#d8cfc1] bg-[#f0eadf] text-left text-[#70634f]"><th className="px-3 py-4 font-medium">Type de fromage</th><th className="px-3 py-4 text-right font-medium">Coût / kg</th><th className="px-3 py-4 text-right font-medium">Prix moyen / unité</th><th className="px-3 py-4 text-right font-medium">Marge</th><th className="px-3 py-4 text-right font-medium">Unités livrées</th><th className="px-3 py-4 text-right font-medium">Rentabilité</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-[#d8cfc1] last:border-0"><td className="px-3 py-5 font-medium">{row.nom}</td><td className="px-3 py-5 text-right">{row.coutProductionParKg == null ? "—" : preciseMoney.format(row.coutProductionParKg)}</td><td className="px-3 py-5 text-right">{row.quantiteLivree ? preciseMoney.format(row.chiffreAffaires / row.quantiteLivree) : "—"}</td><td className="px-3 py-5 text-right font-semibold">{money.format(row.margeBrute)}</td><td className="px-3 py-5 text-right">{row.quantiteLivree}</td><td className="px-3 py-5 text-right"><ProfitabilityBadge value={row.tauxRentabilite} /></td></tr>)}</tbody></table>}</CardContent></Card>;
}

export function TopCheeses({ rows }: { rows: ProfitabilityGroup[] }) {
  return <Card className={OWNER_CARD_CLASS}><CardHeader><CardTitle className="text-lg">Top 3 des fromages les plus rentables</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <div className="h-40"><EmptyState label="Classement indisponible." /></div> : <div className="space-y-4">{rows.map((row, index) => <div key={row.id} className="rounded-xl border border-[#d8cfc1] bg-[#f8f3ea] p-4"><div className="flex items-center gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#28551f] font-semibold text-white">{index + 1}</span><strong className="min-w-0 flex-1 truncate text-base">{row.nom}</strong><span className="font-semibold">{number.format(row.tauxRentabilite)} %</span></div><p className="mt-2 pl-13 text-xs text-[#81725e]">Marge {money.format(row.margeBrute)} · coût {money.format(row.coutAttribue)}</p></div>)}</div>}</CardContent></Card>;
}

function ProfitabilityBadge({ value }: { value: number }) {
  const style = value >= 50 ? "bg-[#dce5d1] text-[#275c22]" : value >= 40 ? "bg-[#f1dfbd] text-[#875613]" : "bg-[#f2d8cc] text-[#c34625]";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style}`}><span className="size-1.5 rounded-full bg-current" />{number.format(value)} %</span>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center text-center text-sm text-[#897b68]">{label}</div>;
}
