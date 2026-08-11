import {
  CalendarDays,
  Milk,
  User,
  Thermometer,
  Trash2,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Snowflake,
  Factory,
} from "lucide-react";

import { Button } from "./../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../components/ui/card";
import { Badge } from "./../../../components/ui/badge";
import { type Fabrication, type FabricationStatus } from "./../../../lib/production-store";

export const STATUS_ORDER: readonly FabricationStatus[] = [
  "planifiee",
  "en_cours",
  "affinage",
  "terminee",
] as const;

export const STATUS_META: Record<
  FabricationStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string; dot: string }
> = {
  planifiee: {
    label: "Planifiée",
    icon: Clock3,
    badgeClass: "bg-muted text-foreground",
    dot: "bg-muted-foreground",
  },
  en_cours: {
    label: "En caillage",
    icon: FlaskConical,
    badgeClass: "bg-accent text-accent-foreground",
    dot: "bg-accent",
  },
  affinage: {
    label: "Affinage",
    icon: Snowflake,
    badgeClass: "bg-secondary text-secondary-foreground",
    dot: "bg-secondary",
  },
  terminee: {
    label: "Terminée",
    icon: CheckCircle2,
    badgeClass: "bg-primary text-primary-foreground",
    dot: "bg-primary",
  },
};

interface FabricationCardProps {
  lot: Fabrication;
  onSelectDetails: (lot: Fabrication) => void;
  onAdvanceStatus: (lot: Fabrication) => void;
  onRemove: (id: string) => void;
}

export function FabricationCard({
  lot,
  onSelectDetails,
  onAdvanceStatus,
  onRemove,
}: FabricationCardProps) {
  const meta = STATUS_META[lot.status];
  const Icon = meta.icon;

  const currentStatusIndex = STATUS_ORDER.indexOf(lot.status);
  const nextStatus = STATUS_ORDER[currentStatusIndex + 1];

  return (
    <li className="relative pl-10 md:pl-12">
      <span
        className={`absolute left-0 top-4 flex size-8 items-center justify-center rounded-full border-2 border-background shadow-sm ${meta.dot}`}
        aria-hidden
      >
        <Icon className="size-4 text-primary-foreground" />
      </span>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                {lot.recipeName}
                {lot.variant && lot.variant !== "Nature" && (
                  <span className="font-normal text-muted-foreground"> — {lot.variant}</span>
                )}
              </CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{lot.batchCode}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {new Date(lot.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <Badge className={meta.badgeClass}>{meta.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricItem icon={<Milk className="size-4" />} label="Lait" value={`${lot.milkLiters} L`} />
            <MetricItem icon={<Factory className="size-4" />} label="Pièces" value={String(lot.yieldPieces)} />
            <MetricItem icon={<Thermometer className="size-4" />} label="Temp." value={`${lot.temperatureC}°C`} />
            <MetricItem icon={<User className="size-4" />} label="Opérateur" value={lot.operator} />
          </div>

          {lot.notes && (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {lot.notes}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelectDetails(lot)}>
              Voir détails
            </Button>

            {nextStatus && (
              <Button variant="outline" size="sm" onClick={() => onAdvanceStatus(lot)}>
                Passer à « {STATUS_META[nextStatus].label} »
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(lot.id)}
              className="text-destructive hover:text-destructive"
              aria-label="Supprimer la fabrication"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

function MetricItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card/50 px-3 py-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}