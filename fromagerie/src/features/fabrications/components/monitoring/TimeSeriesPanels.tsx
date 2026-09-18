import type { ReactNode } from "react";
import { ChartNoAxesCombined, Thermometer, TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TemperatureHistoryPoint, YieldAnalytics } from "../../types/fabrication.types";
import { formatDateTime, formatNumber } from "../../utils/fabricationFormatters";
import { AnalyticsCard, EmptyState, ErrorState } from "./AnalyticsPanelStates";
import { shortDate } from "./monitoring.utils";

interface ChartPoint { label: string; date: string; lot: string; fromage: string; value: number }
interface PanelProps<T> { data: T; error: string | null; onRetry: () => void }
interface Measurement { id: number; lot: string; date: string; fromage: string; value: string }

export function YieldStatistics({ data, error }: { data: YieldAnalytics | null; error: string | null }) {
  const stats = [
    { label: "Rendement moyen", value: data?.moyenne, icon: ChartNoAxesCombined, tone: "text-primary" },
    { label: "Rendement minimum", value: data?.minimum, icon: TrendingDown, tone: "text-amber-700" },
    { label: "Rendement maximum", value: data?.maximum, icon: TrendingUp, tone: "text-teal-700" },
  ];
  return <section className="grid gap-3 sm:grid-cols-3" aria-label="Statistiques de rendement">{stats.map(({ label, value, icon: Icon, tone }) => (
    <div key={label} className="flex min-h-28 items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-background/80 ${tone}`}><Icon className="size-5" /></span>
      <div><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <p className="mt-1 font-mono text-2xl font-semibold">{error || value == null ? "—" : `${formatNumber(value)} %`}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{error ? "Indisponible" : `${data?.nombreFabrications ?? 0} fabrication(s)`}</p>
      </div>
    </div>
  ))}</section>;
}

export function TemperaturePanel({ data, error, onRetry }: PanelProps<TemperatureHistoryPoint[]>) {
  const points: ChartPoint[] = data.map((item) => ({ label: shortDate(item.dateHeureDebut), date: formatDateTime(item.dateHeureDebut), lot: item.numeroLot, fromage: item.fromageNom, value: item.temperatureChauffage }));
  const rows = data.slice(-4).reverse().map((item) => ({ id: item.fabricationId, lot: item.numeroLot, date: formatDateTime(item.dateHeureDebut), fromage: item.fromageNom, value: `${formatNumber(item.temperatureChauffage)} °C` }));
  return <SeriesPanel title="Températures de chauffage" description="Mesures enregistrées pour chaque lot, exprimées en °C." icon={<Thermometer className="size-5" />}
    points={points} rows={rows} unit="°C" color="var(--chart-1)" emptyMessage="Aucun historique de température disponible pour cette période." error={error} onRetry={onRetry} />;
}

export function YieldPanel({ data, error, onRetry }: PanelProps<YieldAnalytics | null>) {
  const history = data?.historique ?? [];
  const points: ChartPoint[] = history.map((item) => ({ label: shortDate(item.dateHeureDebut), date: formatDateTime(item.dateHeureDebut), lot: item.numeroLot, fromage: item.fromageNom, value: item.rendement }));
  const rows = history.slice(-4).reverse().map((item) => ({ id: item.fabricationId, lot: item.numeroLot, date: formatDateTime(item.dateHeureDebut), fromage: item.fromageNom, value: `${formatNumber(item.rendement)} %` }));
  return <SeriesPanel title="Évolution du rendement" description="Rendement calculé par le backend et déjà exprimé en pourcentage." icon={<TrendingUp className="size-5" />}
    points={points} rows={rows} unit="%" color="var(--chart-2)" emptyMessage="Aucun rendement disponible pour cette période." error={error} onRetry={onRetry} />;
}

interface SeriesPanelProps { title: string; description: string; icon: ReactNode; points: ChartPoint[]; rows: Measurement[]; unit: string; color: string; emptyMessage: string; error: string | null; onRetry: () => void }

function SeriesPanel({ title, description, icon, points, rows, unit, color, emptyMessage, error, onRetry }: SeriesPanelProps) {
  return <AnalyticsCard title={title} description={description} icon={icon}>{error ? <ErrorState message={error} onRetry={onRetry} /> : points.length === 0
    ? <EmptyState message={emptyMessage} /> : <><TimeSeriesChart points={points} unit={unit} color={color} /><RecentMeasurements rows={rows} /></>}</AnalyticsCard>;
}

function TimeSeriesChart({ points, unit, color }: { points: ChartPoint[]; unit: string; color: string }) {
  return <div className="h-72 w-full min-w-[520px]" aria-label={`Graphique temporel en ${unit}`}><ResponsiveContainer width="100%" height="100%">
    <LineChart data={points} margin={{ top: 12, right: 18, bottom: 4, left: 0 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} minTickGap={28} />
      <YAxis axisLine={false} tickLine={false} width={54} tick={{ fontSize: 11 }} tickFormatter={(value: number) => `${formatNumber(value)}${unit}`} domain={["auto", "auto"]} />
      <Tooltip cursor={{ stroke: "var(--border)", strokeWidth: 1 }} contentStyle={{ borderRadius: 14, borderColor: "var(--border)", background: "var(--popover)", fontSize: 12 }}
        labelFormatter={(_label, payload) => { const point = payload[0]?.payload as ChartPoint | undefined; return point ? `${point.lot} · ${point.date}` : ""; }} formatter={(value) => [`${formatNumber(Number(value))} ${unit}`, "Valeur"]} />
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }} />
    </LineChart></ResponsiveContainer></div>;
}

function RecentMeasurements({ rows }: { rows: Measurement[] }) {
  return <div className="mt-4 border-t border-border/60 pt-3"><p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Dernières mesures</p><div className="space-y-2">{rows.map((row) => (
    <div key={row.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-background/55 px-3 py-2 text-xs sm:grid-cols-[1fr_1fr_auto]">
      <div><p className="font-mono font-medium text-foreground">{row.lot}</p><p className="text-muted-foreground sm:hidden">{row.fromage}</p></div>
      <p className="hidden self-center text-muted-foreground sm:block">{row.fromage} · {row.date}</p><p className="self-center font-mono font-semibold text-foreground">{row.value}</p>
    </div>
  ))}</div></div>;
}
