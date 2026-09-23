import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import type { ClientOption } from "../../stocks/api/stockApi";
import type { ProfitabilityAnalysis } from "../api/profitabilityApi";

const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const preciseMoney = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const cardClass = "rounded-2xl border-[#d9d0c1] bg-[#f5efe4] shadow-[0_1px_3px_rgba(67,52,33,0.12)]";

function ratio(margin: number, revenue: number) { return revenue > 0 ? margin / revenue * 100 : 0; }
function perKg(value: number, weight?: number) { return weight && weight > 0 ? value / weight : 0; }

export function ProfitabilityDashboard({ analysis, clients }: { analysis: ProfitabilityAnalysis | null; clients: ClientOption[] }) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const summary = analysis?.synthese;
  const cheeses = analysis?.parFromage ?? [];
  const customers = analysis?.parClient ?? [];
  const selectedClient = customers.find((client) => client.id === selectedClientId);
  const clientInfo = clients.find((client) => client.id === selectedClientId);
  const selectedCrossRows = analysis?.croisee.filter((row) => row.clientId === selectedClientId) ?? [];
  const chartData = cheeses.map((cheese) => ({
    name: cheese.nom,
    cost: cheese.coutProductionParKg ?? 0,
    price: perKg(cheese.chiffreAffaires, cheese.poidsLivreKg),
    margin: perKg(cheese.margeBrute, cheese.poidsLivreKg),
  }));
  const ranking = [...cheeses].sort((a, b) => perKg(b.margeBrute, b.poidsLivreKg) - perKg(a.margeBrute, a.poidsLivreKg));

  return <div className="space-y-7">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Chiffre d’affaires" value={money.format(summary?.chiffreAffaires ?? 0)} hint={`${summary?.quantiteLivree ?? 0} unités livrées`} />
      <SummaryCard label="Coûts de production" value={money.format(summary?.coutAttribue ?? 0)} hint="Coûts attribués aux ventes" />
      <SummaryCard label="Marge brute" value={money.format(summary?.margeBrute ?? 0)} hint="Sur la période" />
      <SummaryCard label="Rentabilité" value={`${number.format(ratio(summary?.margeBrute ?? 0, summary?.chiffreAffaires ?? 0))} %`} hint="Marge / chiffre d’affaires" />
    </div>

    <Card className={cardClass}><CardHeader><CardTitle>Comparaison par fromage</CardTitle><p className="text-sm text-[#786a56]">Coût, prix de vente moyen et marge au kilo</p></CardHeader><CardContent className="h-96">{chartData.length === 0 ? <Empty /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, left: 4, right: 4 }}><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#766955", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${number.format(value)} €`} /><Tooltip formatter={(value) => preciseMoney.format(Number(value))} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Legend /><Bar dataKey="cost" name="Coût / kg" fill="#c94b29" radius={[6, 6, 0, 0]} /><Bar dataKey="price" name="Prix moyen / kg" fill="#28551f" radius={[6, 6, 0, 0]} /><Bar dataKey="margin" name="Marge / kg" fill="#82a563" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>}</CardContent></Card>

    <Card className={cardClass}><CardHeader><CardTitle>Rentabilité par type de fromage</CardTitle></CardHeader><CardContent className="overflow-x-auto">{cheeses.length === 0 ? <Empty /> : <table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-[#d8cfc1] text-left text-[#70634f]"><th className="px-3 py-4 font-medium">Type de fromage</th><th className="px-3 py-4 text-right font-medium">Coût / kg</th><th className="px-3 py-4 text-right font-medium">Prix moyen / kg</th><th className="px-3 py-4 text-right font-medium">Marge / kg</th><th className="px-3 py-4 text-right font-medium">kg vendus</th><th className="px-3 py-4 text-right font-medium">Rentabilité</th></tr></thead><tbody>{cheeses.map((cheese) => <tr key={cheese.id} className="border-b border-[#d8cfc1] last:border-0"><td className="px-3 py-5 font-medium">{cheese.nom}</td><td className="px-3 py-5 text-right">{preciseMoney.format(cheese.coutProductionParKg ?? 0)}</td><td className="px-3 py-5 text-right">{preciseMoney.format(perKg(cheese.chiffreAffaires, cheese.poidsLivreKg))}</td><td className="px-3 py-5 text-right font-semibold">{preciseMoney.format(perKg(cheese.margeBrute, cheese.poidsLivreKg))}</td><td className="px-3 py-5 text-right">{number.format(cheese.poidsLivreKg ?? 0)} kg</td><td className="px-3 py-5 text-right"><RateBadge value={ratio(cheese.margeBrute, cheese.chiffreAffaires)} /></td></tr>)}</tbody></table>}</CardContent></Card>

    <Card className={cardClass}><CardHeader><CardTitle>Rentabilité par client</CardTitle><p className="text-sm text-[#786a56]">Cliquez sur une ligne pour ouvrir le détail du client</p></CardHeader><CardContent className="overflow-x-auto">{customers.length === 0 ? <Empty /> : <table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-[#d8cfc1] text-left text-[#70634f]"><th className="px-3 py-4 font-medium">Client</th><th className="px-3 py-4 text-right font-medium">Chiffre d’affaires</th><th className="px-3 py-4 text-right font-medium">Coût associé</th><th className="px-3 py-4 text-right font-medium">Marge</th><th className="px-3 py-4 text-right font-medium">Unités livrées</th><th className="px-3 py-4 text-right font-medium">Rentabilité</th><th /></tr></thead><tbody>{customers.map((customer) => { const info = clients.find((item) => item.id === customer.id); return <tr key={customer.id} tabIndex={0} role="button" onClick={() => setSelectedClientId(customer.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedClientId(customer.id); }} className="cursor-pointer border-b border-[#d8cfc1] transition last:border-0 hover:bg-[#eee6d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9b8b72]"><td className="px-3 py-4"><strong className="block">{customer.nom}</strong><span className="text-xs text-[#806f59]">{formatClientType(info?.typeClient)}</span></td><td className="px-3 py-4 text-right">{money.format(customer.chiffreAffaires)}</td><td className="px-3 py-4 text-right text-[#756650]">{money.format(customer.coutAttribue)}</td><td className="px-3 py-4 text-right font-semibold">{money.format(customer.margeBrute)}</td><td className="px-3 py-4 text-right">{customer.quantiteLivree}</td><td className="px-3 py-4 text-right"><RateBadge value={ratio(customer.margeBrute, customer.chiffreAffaires)} /></td><td className="px-2"><ChevronRight className="size-4 text-[#756650]" /></td></tr>; })}</tbody></table>}</CardContent></Card>

    <Card className={cardClass}><CardHeader><CardTitle>Meilleures marges</CardTitle><p className="text-sm text-[#786a56]">Classement des fromages sur la période</p></CardHeader><CardContent className="space-y-3">{ranking.length === 0 ? <Empty /> : ranking.map((cheese, index) => <div key={cheese.id} className="flex items-center gap-4 rounded-xl border border-[#d8cfc1] bg-[#f8f3ea] px-4 py-4"><span className="flex size-9 items-center justify-center rounded-full bg-[#eee7dc] font-semibold">{index + 1}</span><strong className="min-w-0 flex-1 truncate">{cheese.nom}</strong><span className="text-[#756650]">{preciseMoney.format(perKg(cheese.margeBrute, cheese.poidsLivreKg))}/kg</span><strong>{number.format(ratio(cheese.margeBrute, cheese.chiffreAffaires))} %</strong></div>)}</CardContent></Card>

    <Dialog open={selectedClientId !== null} onOpenChange={(open) => !open && setSelectedClientId(null)}><DialogContent className="max-w-2xl rounded-2xl"><DialogHeader><DialogTitle>{selectedClient?.nom ?? "Détail du client"}</DialogTitle></DialogHeader>{selectedClient && <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-3"><DialogMetric label="Chiffre d’affaires" value={money.format(selectedClient.chiffreAffaires)} /><DialogMetric label="Marge" value={money.format(selectedClient.margeBrute)} /><DialogMetric label="Rentabilité" value={`${number.format(ratio(selectedClient.margeBrute, selectedClient.chiffreAffaires))} %`} /></div>{clientInfo && <p className="text-sm text-[#756650]">{formatClientType(clientInfo.typeClient)}{clientInfo.telephone ? ` · ${clientInfo.telephone}` : ""}</p>}<div><h3 className="mb-2 font-semibold">Détail par fromage</h3>{selectedCrossRows.map((row) => <div key={row.fromageId} className="flex justify-between border-b border-[#e1d9cd] py-2 text-sm last:border-0"><span>{row.fromageNom} · {row.quantiteLivree} unités</span><strong>{money.format(row.margeBrute)}</strong></div>)}</div></div>}</DialogContent></Dialog>
  </div>;
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) { return <Card className={`${cardClass} gap-2 py-4`}><CardContent className="px-4"><p className="text-sm font-medium text-[#70634f]">{label}</p><p className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{value}</p><p className="mt-1 min-h-5 text-xs text-[#806f59]">{hint}</p></CardContent></Card>; }
function RateBadge({ value }: { value: number }) { const style = value >= 45 ? "bg-[#dce5d1] text-[#275c22]" : value >= 35 ? "bg-[#f1dfbd] text-[#875613]" : "bg-[#f2d8cc] text-[#c34625]"; return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style}`}><i className="size-1.5 rounded-full bg-current" />{number.format(value)} %</span>; }
function DialogMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f5efe4] p-3"><p className="text-xs text-[#806f59]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function formatClientType(value?: string) { return value ? value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : "Client"; }
function Empty() { return <p className="py-10 text-center text-sm text-[#806f59]">Aucune donnée disponible sur cette période.</p>; }
