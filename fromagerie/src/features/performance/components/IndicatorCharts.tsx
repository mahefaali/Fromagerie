import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const cardClass = "rounded-2xl border-[#d9d0c1] bg-[#f5efe4] shadow-[0_1px_3px_rgba(67,52,33,0.12)]";

export function CostEvolutionChart({ data }: { data: Array<{ month: string; value: number | null }> }) {
  return <ChartCard title="Coût de production au kg" subtitle="Évolution mensuelle"><div className="h-72">{data.length > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c94b29" stopOpacity={0.28} /><stop offset="100%" stopColor="#c94b29" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${number.format(value)} €`} width={55} /><Tooltip formatter={(value) => [`${number.format(Number(value))} €/kg`, "Coût"]} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Area type="monotone" dataKey="value" stroke="#c94b29" strokeWidth={3} fill="url(#costFill)" connectNulls /></AreaChart></ResponsiveContainer> : <EmptyChart />}</div></ChartCard>;
}

export function MarginEvolutionChart({ data }: { data: Array<{ month: string; value: number }> }) {
  return <ChartCard title="Marge brute mensuelle" subtitle="Marge dégagée chaque mois"><div className="h-72">{data.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => money.format(value)} width={65} /><Tooltip formatter={(value) => [money.format(Number(value)), "Marge"]} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Bar dataKey="value" fill="#82a563" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}</div></ChartCard>;
}

export function AgingComparisonChart({ data }: { data: Array<{ name: string; expected: number; actual: number }> }) {
  return <ChartCard title="Affinage réel vs prévu" subtitle="Durée moyenne en jours par fromage"><div className="h-80">{data.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="#ddd5c8" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value} j`} width={48} /><Tooltip formatter={(value, name) => [`${number.format(Number(value))} j`, name]} contentStyle={{ borderRadius: 12, borderColor: "#d9d0c1", background: "#fffdf8" }} /><Legend /><Bar dataKey="expected" name="Prévu" fill="#4f8293" radius={[7, 7, 0, 0]} /><Bar dataKey="actual" name="Réel" fill="#d99536" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyChart />}</div></ChartCard>;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <Card className={cardClass}><CardHeader><CardTitle>{title}</CardTitle><p className="text-sm text-[#786a56]">{subtitle}</p></CardHeader><CardContent>{children}</CardContent></Card>;
}

function EmptyChart() {
  return <div className="flex h-full min-h-24 items-center justify-center text-sm text-[#806f59]">Aucune donnée disponible sur cette période.</div>;
}
