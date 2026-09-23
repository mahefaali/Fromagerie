import { CalendarDays, Factory, Gauge, Milk, PackageCheck, Pencil, Scale, Trash2, User, Warehouse } from "lucide-react";

import { Button } from "../../../components/ui/button";
import type { FabricationListItem } from "../types/fabrication.types";
import { formatDateTime, formatNumber } from "../utils/fabricationFormatters";

interface FabricationCardProps {
  fabrication: FabricationListItem;
  onSelect: (id: number) => void;
  canStartAffinage: boolean;
  isPreparingAffinage: boolean;
  onStartAffinage: (fabrication: FabricationListItem) => void;
  onEdit: (fabrication: FabricationListItem) => void;
  onDelete: (fabrication: FabricationListItem) => void;
}

export function FabricationCard({
  fabrication,
  onSelect,
  canStartAffinage,
  isPreparingAffinage,
  onStartAffinage,
  onEdit,
  onDelete,
}: FabricationCardProps) {
  return (
    <li>
      <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border/70 bg-card/75 p-4 shadow-sm transition hover:border-primary/35 hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-[10rem] flex-1">
            <p className="break-all font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
              Lot {fabrication.numeroLot}
            </p>
            <h3 className="mt-1.5 break-words text-lg font-semibold text-foreground">{fabrication.fromageNom}</h3>
            <p className="mt-0.5 break-words text-xs text-muted-foreground sm:text-sm">Recette {fabrication.recetteNom}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {canStartAffinage && <>
              <Button type="button" variant="ghost" size="icon" aria-label={`Modifier le lot ${fabrication.numeroLot}`} className="size-10 sm:size-9" onClick={() => onEdit(fabrication)}>
                <Pencil className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={`Supprimer le lot ${fabrication.numeroLot}`} className="size-10 text-destructive hover:bg-destructive/10 hover:text-destructive sm:size-9" onClick={() => onDelete(fabrication)}>
                <Trash2 className="size-4" />
              </Button>
            </>}
            <div className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
              {formatNumber(fabrication.rendement)} %
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
          <Metric icon={<Milk />} label="Lait" value={`${formatNumber(fabrication.quantiteLait)} L`} />
          <Metric
            icon={<PackageCheck />}
            label="Fromages"
            value={formatNumber(fabrication.nombreFromages)}
          />
          <Metric
            icon={<Scale />}
            label="Poids obtenu"
            value={`${formatNumber(fabrication.poidsTotalFromages)} kg`}
          />
          <Metric
            icon={<Gauge />}
            label="Rendement"
            value={`${formatNumber(fabrication.rendement)} %`}
          />
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground sm:text-sm">
          <p className="flex min-w-0 items-center gap-2 break-words">
            <CalendarDays className="size-3.5 shrink-0 text-primary" />
            {formatDateTime(fabrication.dateHeureDebut)}
          </p>
          <p className="flex min-w-0 items-center gap-2 break-words">
            <User className="size-3.5 shrink-0 text-primary" />
            {fabrication.operateurNom}
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className={`min-h-11 w-full sm:min-h-10 ${canStartAffinage ? "" : "sm:col-span-2"}`}
            onClick={() => onSelect(fabrication.id)}
          >
            <Factory className="size-4" /> Voir le détail
          </Button>
          {canStartAffinage && (
            <Button
              type="button"
              className="min-h-11 w-full bg-emerald-800 text-white hover:bg-emerald-900 sm:min-h-10"
              disabled={isPreparingAffinage}
              onClick={() => onStartAffinage(fabrication)}
            >
              <Warehouse className="size-4" />
              {isPreparingAffinage ? "Chargement..." : "Passer en affinage"}
            </Button>
          )}
        </div>
      </article>
    </li>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-background/60 p-2.5">
      <div className="flex items-center gap-1 text-[11px] leading-tight text-muted-foreground">
        <span className="shrink-0 [&_svg]:size-3 [&_svg]:text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
