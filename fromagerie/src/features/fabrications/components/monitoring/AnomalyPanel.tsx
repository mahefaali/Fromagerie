import { AlertTriangle } from "lucide-react";

import { Badge } from "../../../../components/ui/badge";
import type { useFabricationAnalytics } from "../../hooks/useFabricationAnalytics";
import type { FabricationAnomaly } from "../../types/fabrication.types";
import { formatDateTime, formatNumber } from "../../utils/fabricationFormatters";
import { AnalyticsCard, EmptyState, ErrorState, PanelLoadingState } from "./AnalyticsPanelStates";
import { baselineLabel, directionLabel, parameterLabel } from "./monitoring.utils";

export function AnomalyPanel({ data, error, isLoading, onRetry }: {
  data: ReturnType<typeof useFabricationAnalytics>["anomalies"];
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}) {
  return <AnalyticsCard title="Anomalies détectées" description="Signaux IQR calculés par rapport aux fabrications historiques comparables." icon={<AlertTriangle className="size-5" />}>
    {isLoading ? <PanelLoadingState /> : error ? <ErrorState message={error} onRetry={onRetry} /> : !data
      ? <EmptyState message="Aucune donnée d’analyse disponible." /> : <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant={data.anomalies.length > 0 ? "destructive" : "outline"}>{data.anomalies.length} lot(s) signalé(s)</Badge>
          <span className="text-muted-foreground">Baseline minimale : {data.minimumEchantillons} échantillons</span>
        </div>
        {data.donneesInsuffisantes.length > 0 && <div className="rounded-2xl border border-amber-600/25 bg-amber-500/[0.06] p-3 text-sm">
          <p className="font-medium">Pas encore assez de données pour détecter des anomalies fiables.</p>
          <p className="mt-1 text-xs text-muted-foreground">{data.donneesInsuffisantes.length} fabrication(s) n’ont pas une baseline historique suffisante.</p>
        </div>}
        {data.anomalies.length === 0 ? <EmptyState message={data.donneesInsuffisantes.length > 0
          ? "Aucune conclusion supplémentaire ne peut être tirée pour ce périmètre." : "Aucune anomalie détectée pour ce périmètre."} />
          : <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">{data.anomalies.map((anomaly) => <AnomalyCard key={anomaly.fabricationId} anomaly={anomaly} />)}</div>}
      </div>}
  </AnalyticsCard>;
}

function AnomalyCard({ anomaly }: { anomaly: FabricationAnomaly }) {
  return <article className="rounded-2xl border border-destructive/20 bg-destructive/[0.035] p-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-mono text-sm font-semibold">Lot {anomaly.numeroLot}</p>
      <p className="mt-1 text-xs text-muted-foreground">{anomaly.fromageNom} · {formatDateTime(anomaly.dateHeureDebut)}</p></div>
      <Badge variant="outline" className="border-destructive/30 text-destructive">{baselineLabel(anomaly.baselineUtilisee)}</Badge>
    </div>
    <div className="mt-3 space-y-2">{anomaly.anomalies.map((detail) => <div key={detail.parametre} className="rounded-xl bg-background/65 p-3">
      <div className="flex flex-wrap items-center gap-2"><Badge variant={detail.direction === "BASSE" ? "secondary" : "destructive"}>{parameterLabel(detail.parametre)} {directionLabel(detail.direction)}</Badge>
        <span className="font-mono text-sm font-semibold">{formatNumber(detail.valeur)} {detail.parametre === "RENDEMENT" ? "%" : "°C"}</span>
      </div>
      <p className="mt-2 text-sm">{detail.message}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">Intervalle attendu : {formatNumber(detail.borneBasse)} à {formatNumber(detail.borneHaute)}</p>
    </div>)}</div>
  </article>;
}
