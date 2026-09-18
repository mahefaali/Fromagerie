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
      <article className="flex h-full flex-col rounded-3xl border border-border/70 bg-card/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Lot {fabrication.numeroLot}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{fabrication.fromageNom}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Recette {fabrication.recetteNom}</p>
          </div>
          <div className="flex items-center gap-1">
            {canStartAffinage && <>
              <Button type="button" variant="ghost" size="icon" aria-label={`Modifier le lot ${fabrication.numeroLot}`} onClick={() => onEdit(fabrication)}>
                <Pencil className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={`Supprimer le lot ${fabrication.numeroLot}`} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(fabrication)}>
                <Trash2 className="size-4" />
              </Button>
            </>}
            <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              {formatNumber(fabrication.rendement)} %
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

        <div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            {formatDateTime(fabrication.dateHeureDebut)}
          </p>
          <p className="flex items-center gap-2">
            <User className="size-4 shrink-0 text-primary" />
            {fabrication.operateurNom}
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={`min-h-11 w-full ${canStartAffinage ? "" : "sm:col-span-2"}`}
            onClick={() => onSelect(fabrication.id)}
          >
            <Factory className="size-4" /> Voir le détail
          </Button>
          {canStartAffinage && (
            <Button
              type="button"
              size="lg"
              className="min-h-11 w-full bg-emerald-800 text-white hover:bg-emerald-900"
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
    <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="[&_svg]:size-3.5 [&_svg]:text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
