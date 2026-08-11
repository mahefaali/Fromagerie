import { useState } from "react";
import { MapPin, Calendar, CalendarCheck, Clock, Plus, Warehouse, RotateCw } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Card, CardHeader } from "./../../../components/ui/card";
import { Progress } from "./../../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./../../../components/ui/alert-dialog";

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
  flipFrequencyDays?: number;
}

interface AffinageLotHeaderProps {
  lot: LotAffinageDetail;
  onAddCare: () => void;
  onUpdateFlipFrequency?: (days: number) => void;
}

export function AffinageLotHeader({
  lot,
  onAddCare,
  onUpdateFlipFrequency,
}: AffinageLotHeaderProps) {
  const [pendingFrequency, setPendingFrequency] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const progressPercent = Math.min(
    100,
    Math.round((lot.daysElapsed / Math.max(1, lot.totalDays)) * 100)
  );

  const currentFrequency = lot.flipFrequencyDays ?? 1;

  const handleSelectChange = (val: string) => {
    const newFreq = Number(val);
    if (newFreq !== currentFrequency) {
      setPendingFrequency(newFreq);
      setConfirmOpen(true);
    }
  };

  const handleConfirm = () => {
    const nextFreq = pendingFrequency;

    setConfirmOpen(false);
    setPendingFrequency(null);

    if (nextFreq !== null) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
        onUpdateFlipFrequency?.(nextFreq);
      }, 50);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingFrequency(null);
  };

  const getFrequencyLabel = (days: number) => {
    return days === 1 ? "Tous les jours" : `Tous les ${days} jours`;
  };

  return (
    <Card className="w-full min-w-0 max-w-full overflow-hidden">
      <CardHeader className="p-3.5 sm:p-5 md:p-6 space-y-4 min-w-0">

        {/* En-tête : Passer en ligne uniquement à partir du breakpoint `md` (768px+) */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-w-0">
          <div className="min-w-0 space-y-1 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground break-words">
              {lot.recipeName}
              {lot.variant && (
                <span className="font-normal text-muted-foreground"> · {lot.variant}</span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              Lot <span className="font-mono font-medium">{lot.batchCode}</span> · {lot.pieceCount} pièce(s) ·
              Opérateur : {lot.operator}
            </p>
          </div>

          <Button
            onClick={onAddCare}
            className="w-full md:w-auto shrink-0 justify-center bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <Plus className="mr-1.5 size-4" /> Ajouter un soin
          </Button>
        </div>

        {/* Métriques / KPIs avec sécurisation min-w-0 et overflow-hidden */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3 w-full min-w-0">
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

          {/* Carte Retournement : s'adapte à la grille */}
          <div className="col-span-2 sm:col-span-1 xl:col-span-1 group relative min-w-0 w-full overflow-hidden rounded-lg border border-emerald-200/80 bg-emerald-50/30 p-2.5 transition-all hover:border-emerald-500/50 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/30 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between gap-1 text-xs font-medium text-emerald-800 dark:text-emerald-400 min-w-0">
              <span className="flex items-center gap-1.5 min-w-0 truncate">
                <RotateCw className="size-3.5 shrink-0 text-emerald-600 transition-transform group-hover:rotate-45 dark:text-emerald-400" />
                <span className="truncate">Retournement</span>
              </span>
            </div>

            <div className="min-w-0 w-full max-w-full overflow-hidden">
              <Select
                key={`select-${lot.id}-${currentFrequency}`}
                value={String(currentFrequency)}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="h-8 w-full max-w-full border border-emerald-300/60 bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-950 shadow-sm hover:border-emerald-400 hover:bg-white focus:ring-1 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-200 justify-between gap-1 min-w-0 overflow-hidden">
                  <span className="truncate min-w-0">
                    <SelectValue placeholder="Choisir..." />
                  </span>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="1">Tous les jours</SelectItem>
                  <SelectItem value="2">Tous les 2 jours</SelectItem>
                  <SelectItem value="3">Tous les 3 jours</SelectItem>
                  <SelectItem value="7">Tous les 7 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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

      {/* Modal de confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Changer la fréquence de retournement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de modifier la fréquence de retournement du lot{" "}
              <strong className="font-mono">{lot.batchCode}</strong> de{" "}
              <strong>{getFrequencyLabel(currentFrequency)}</strong> à{" "}
              <strong>
                {pendingFrequency ? getFrequencyLabel(pendingFrequency) : ""}
              </strong>
              . Voulez-vous vraiment appliquer cette modification ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-emerald-800 hover:bg-emerald-900">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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