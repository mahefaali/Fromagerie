import type { ReactNode } from "react";
import { CloudRain, Sun } from "lucide-react";

import { Badge } from "../../../../components/ui/badge";
import type { SeasonYieldStatistics } from "../../types/fabrication.types";
import type { useFabricationAnalytics } from "../../hooks/useFabricationAnalytics";
import { formatNumber } from "../../utils/fabricationFormatters";
import { AnalyticsCard, EmptyState, ErrorState } from "./AnalyticsPanelStates";

export function SeasonPanel({ data, fromageSelected, error, onRetry }: {
  data: ReturnType<typeof useFabricationAnalytics>["saisons"];
  fromageSelected: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return <AnalyticsCard title="Comparaison saisonnière" description="Périodes sèche et humide déterminées par la configuration du serveur." icon={<Sun className="size-5" />}>
    {error ? <ErrorState message={error} onRetry={onRetry} /> : !fromageSelected
      ? <EmptyState message="Sélectionnez un fromage pour comparer ses rendements saisonniers." /> : !data
        ? <EmptyState message="Données insuffisantes pour la comparaison." /> : <div className="space-y-4">
          <Badge variant="outline" className="w-fit">{data.fromageNom}</Badge>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <SeasonCard label="Saison sèche" icon={<Sun className="size-5 text-amber-700" />} statistics={data.saisonSeche} />
            <SeasonCard label="Saison humide" icon={<CloudRain className="size-5 text-teal-700" />} statistics={data.saisonHumide} />
          </div>
        </div>}
  </AnalyticsCard>;
}

function SeasonCard({ label, icon, statistics }: { label: string; icon: ReactNode; statistics: SeasonYieldStatistics }) {
  return <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
    <div className="flex items-center gap-2">{icon}<h4 className="font-semibold">{label}</h4></div>
    {!statistics.donneesDisponibles ? <p className="mt-4 text-sm text-muted-foreground">Aucune donnée pour cette saison.</p> : <dl className="mt-4 grid grid-cols-3 gap-2">
      <SeasonValue label="Moyenne" value={statistics.moyenne} /><SeasonValue label="Minimum" value={statistics.minimum} /><SeasonValue label="Maximum" value={statistics.maximum} />
    </dl>}
    <p className="mt-3 text-xs text-muted-foreground">{statistics.nombreFabrications} fabrication(s)</p>
  </div>;
}

function SeasonValue({ label, value }: { label: string; value: number | null }) {
  return <div><dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 font-mono text-sm font-semibold">{value == null ? "—" : `${formatNumber(value)} %`}</dd></div>;
}
