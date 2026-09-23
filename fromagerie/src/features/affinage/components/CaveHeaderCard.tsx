import { Package, Thermometer, Droplets, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../components/ui/card";
import { type Cave, capaciteFor } from "../domain/cave";

interface CaveHeaderCardProps {
  cave: Cave;
  canDelete: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CaveHeaderCard({
  cave,
  canDelete,
  canEdit,
  onEdit,
  onDelete,
}: CaveHeaderCardProps) {
  const capaciteMax = capaciteFor(cave.etageres);
  const occupationPct = capaciteMax
    ? Math.round((cave.capaciteOccupee / capaciteMax) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 space-y-0 p-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-lg">{cave.nom}</CardTitle>
          {cave.description && (
            <p className="mt-1 text-sm text-muted-foreground">{cave.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 size-4" />
              Modifier
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Supprimer la cave">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatItem
            icon={<Package className="size-4" />}
            label="Capacité"
            value={`${cave.capaciteOccupee} / ${capaciteMax}`}
            hint={`${cave.etageres.length} étagère${cave.etageres.length > 1 ? "s" : ""}`}
          />
          <StatItem
            icon={<Thermometer className="size-4" />}
            label="Température"
            value={`${cave.temperatureCible} °C`}
          />
          <StatItem
            icon={<Droplets className="size-4" />}
            label="Humidité"
            value={`${cave.humiditeCible} %`}
          />
          <StatItem
            icon={<MapPin className="size-4" />}
            label="Occupation"
            value={`${occupationPct} %`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
