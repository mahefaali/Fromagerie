import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { PerformanceDashboard } from "../api/performanceApi";
import { AgingComparisonChart, CostEvolutionChart, MarginEvolutionChart } from "./IndicatorCharts";
import { average, mergeIndicatorDetails, monthLabel, type IndicatorDetail } from "./indicatorsDashboard.utils";

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const cardClass = "rounded-2xl border-[#d9d0c1] bg-[#f5efe4] shadow-[0_1px_3px_rgba(67,52,33,0.12)]";

export function IndicatorsDashboard({ data }: { data: PerformanceDashboard | null }) {
  const weightAverage = average(data?.poidsMoyens.map((item) => item.poidsMoyenKg) ?? []);
  const agingGap = average(data?.dureesAffinage.map((item) => item.ecartJours) ?? []);
  const costs = data?.evolutionCouts.map((item) => ({ month: monthLabel(item.annee, item.mois), value: item.coutMoyenKg })) ?? [];
  const margins = data?.evolutionMarges.map((item) => ({ month: monthLabel(item.annee, item.mois), value: item.margeBrute })) ?? [];
  const aging = data?.dureesAffinage.map((item) => ({ name: item.fromageNom, expected: item.dureePrevueJours, actual: item.dureeReelleJours })) ?? [];
  const details = mergeIndicatorDetails(data);

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Rendement moyen" value={format(data?.rendementMoyen.valeur, "%", "Non disponible")} hint="Poids de fromage obtenu / volume de lait" />
        <Kpi label="Taux de perte" value={format(data?.tauxPerte.valeur, "%", "Non disponible")} hint="Pertes rapportées aux entrées" evolution={data?.tauxPerte.evolution} suffix="pt" reverseTrend />
        <Kpi label="Poids moyen" value={format(weightAverage, "kg", "Non disponible")} hint="Par pièce et par type de fromage" />
        <Kpi label="Écart d’affinage" value={agingGap == null ? "Non disponible" : `${agingGap >= 0 ? "+" : ""}${number.format(agingGap)} j`} hint="Durée réelle par rapport au prévu" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CostEvolutionChart data={costs} />
        <MarginEvolutionChart data={margins} />
      </div>
      <AgingComparisonChart data={aging} />
      <IndicatorDetailsTable details={details} />
    </div>
  );
}

function Kpi({ label, value, hint, evolution, suffix, reverseTrend = false }: { label: string; value: string; hint: string; evolution?: number | null; suffix?: string; reverseTrend?: boolean }) {
  const positive = evolution != null && (reverseTrend ? evolution <= 0 : evolution >= 0);
  return (
    <Card className={`${cardClass} gap-3 py-5`}>
      <CardContent className="px-5">
        <p className="text-sm font-medium text-[#70634f]">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        {evolution == null ? (
          <p className="mt-2 min-h-5 text-xs text-[#806f59]">{hint}</p>
        ) : (
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? "bg-[#dce5d1] text-[#275c22]" : "bg-[#f2d8cc] text-[#c34625]"}`}>
            {evolution > 0 ? "+" : ""}{number.format(evolution)} {suffix}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function IndicatorDetailsTable({ details }: { details: IndicatorDetail[] }) {
  return (
    <Card className={cardClass}>
      <CardHeader><CardTitle>Détail par fromage</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        {details.length > 0 ? (
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-[#d8cfc1] text-left text-[#70634f]"><th className="px-3 py-4 font-medium">Fromage</th><th className="px-3 py-4 text-right font-medium">Rendement</th><th className="px-3 py-4 text-right font-medium">Poids moyen</th><th className="px-3 py-4 text-right font-medium">Taux de perte</th><th className="px-3 py-4 text-right font-medium">Affinage prévu</th><th className="px-3 py-4 text-right font-medium">Affinage réel</th></tr></thead>
            <tbody>{details.map((item) => <tr key={item.id} className="border-b border-[#d8cfc1] last:border-0"><td className="px-3 py-5 font-medium">{item.name}</td><td className="px-3 py-5 text-right">{format(item.yield, "%")}</td><td className="px-3 py-5 text-right">{format(item.weight, "kg")}</td><td className="px-3 py-5 text-right">{format(item.loss, "%")}</td><td className="px-3 py-5 text-right">{format(item.expected, "j")}</td><td className="px-3 py-5 text-right font-medium">{format(item.actual, "j")}{item.gap != null && <span className="ml-1 text-xs text-[#806f59]">({item.gap >= 0 ? "+" : ""}{number.format(item.gap)})</span>}</td></tr>)}</tbody>
          </table>
        ) : (
          <div className="flex min-h-24 items-center justify-center text-sm text-[#806f59]">Aucune donnée disponible sur cette période.</div>
        )}
      </CardContent>
    </Card>
  );
}

function format(value: number | null | undefined, unit: string, fallback = "—") {
  return value == null ? fallback : `${number.format(value)} ${unit}`;
}
