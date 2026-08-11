import { Package, Thermometer, Droplets, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../components/ui/card";
import { type Cave, capaciteFor } from "./../../../lib/production-store";

interface CaveHeaderCardProps {
  cave: Cave;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CaveHeaderCard({
  cave,
  canDelete,
  onEdit,
  onDelete,
}: CaveHeaderCardProps) {
  const capaciteMax = capaciteFor(cave.etageres);
  const occupation = cave.emplacements.filter((e) => e.contenu).length;
  const occupationPct = capaciteMax
    ? Math.min(100, Math.round((occupation / capaciteMax) * 100))
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-xl">{cave.nom}</CardTitle>
          {cave.description && (
            <p className="mt-1 text-sm text-muted-foreground">{cave.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 size-4" />
            Modifier
          </Button>
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Supprimer la cave">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatItem
            icon={<Package className="size-4" />}
            label="Capacité"
            value={`${occupation} / ${capaciteMax}`}
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
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${occupationPct}%` }}
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
    <div className="rounded-md border border-border bg-card/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}