import { MapPin, Calendar, CalendarCheck, Clock, Plus, Warehouse, MoveRight, Boxes, PackageCheck } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Card, CardHeader } from "./../../../components/ui/card";
import { Progress } from "./../../../components/ui/progress";

export interface LotAffinageDetail {
  id: string;
  batchCode: string;
  recipeName: string;
  variant?: string;
  pieceCount: number;
  operator: string;
  location: string;
  entryDate: string;
  expectedExitDate: string;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  caveTargetInfo: string;
  quantityRemaining: number;
  quantityPlaced: number;
}

interface AffinageLotHeaderProps {
  lot: LotAffinageDetail;
  onAddCare: () => void;
  onPlaceRemaining: () => void;
  onMove: () => void;
  onRelease: () => void;
  canRelease: boolean;
}

export function AffinageLotHeader({
  lot,
  onAddCare,
  onPlaceRemaining,
  onMove,
  onRelease,
  canRelease,
}: AffinageLotHeaderProps) {
  const progressPercent = Math.min(
    100,
    Math.round((lot.daysElapsed / Math.max(1, lot.totalDays)) * 100)
  );

  return (
    <Card className="w-full min-w-0 max-w-full overflow-hidden">
      <CardHeader className="min-w-0 space-y-3 p-3.5 sm:p-4">

        {/* L’en-tête reste empilé sur tablette afin de laisser toute la largeur aux actions */}
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 space-y-1 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground break-words">
              {lot.recipeName}
              {lot.variant && (
                <span className="font-normal text-muted-foreground"> · {lot.variant}</span>
              )}
            </h2>
            <p className="break-words text-xs text-muted-foreground">
              Lot <span className="font-mono font-medium">{lot.batchCode}</span> · {lot.pieceCount} pièce(s) ·
              Opérateur : {lot.operator}
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:w-auto xl:justify-end">
            {lot.quantityRemaining > 0 && (
              <Button variant="outline" onClick={onPlaceRemaining} className="w-full sm:w-auto">
                <Boxes className="size-4" /> Placer le reste ({lot.quantityRemaining})
              </Button>
            )}
            {lot.quantityPlaced > 0 && (
              <Button variant="outline" onClick={onMove} className="w-full sm:w-auto">
                <MoveRight className="size-4" /> Déplacer
              </Button>
            )}
            {canRelease && (
              <Button onClick={onRelease} className="w-full bg-[#c86343] text-white hover:bg-[#ad5035] sm:w-auto">
                <PackageCheck className="size-4" /> Sortir vers le stock
              </Button>
            )}
            <Button onClick={onAddCare} className="w-full bg-emerald-800 text-white hover:bg-emerald-900 sm:w-auto">
              <Plus className="size-4" /> Ajouter un soin
            </Button>
          </div>
        </div>

        {/* Métriques / KPIs avec sécurisation min-w-0 et overflow-hidden */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 w-full min-w-0">
          <KpiCard
            icon={<MapPin className="size-3.5 shrink-0 text-muted-foreground" />}
            label="Localisation"
            value={lot.location}
          />
          <KpiCard
            icon={<Calendar className="size-3.5 shrink-0 text-muted-foreground" />}
            label="Mise en cave"
            value={lot.entryDate}
          />
          <KpiCard
            icon={<CalendarCheck className="size-3.5 shrink-0 text-muted-foreground" />}
            label="Sortie prévue"
            value={lot.expectedExitDate}
          />
          <KpiCard
            icon={<Clock className="size-3.5 shrink-0 text-muted-foreground" />}
            label="Jours restants"
            value={`${lot.daysRemaining} j`}
            highlight
          />
        </div>

        {/* Barre de progression */}
        <div className="space-y-1.5 pt-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progression de l'affinage</span>
            <span className="font-medium text-foreground">
              {lot.daysElapsed}/{lot.totalDays} j
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Info Cible Cave */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground min-w-0">
          <Warehouse className="size-4 shrink-0" />
          <span className="truncate">{lot.caveTargetInfo}</span>
        </div>
      </CardHeader>
    </Card>
  );
}

function KpiCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 w-full overflow-hidden rounded-lg border p-2.5 sm:p-3 transition-colors ${highlight
          ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50"
          : "bg-card"
        }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 font-semibold text-xs sm:text-sm truncate text-foreground">{value}</div>
    </div>
  );
}
