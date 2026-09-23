import { ClipboardList, Plus } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

export interface AffinageLotItem {
  id: string;
  batchCode: string;
  recipeName: string;
  variant?: string;
  daysRemaining: number;
  totalDays: number;
}

interface AffinageLotListProps {
  lots: AffinageLotItem[];
  selectedId: string | null;
  onSelectLot: (id: string) => void;
  onCreateLot?: () => void;
}

export function AffinageLotList({
  lots,
  selectedId,
  onSelectLot,
  onCreateLot,
}: AffinageLotListProps) {
  return (
    <Card className="w-full min-w-0 p-3 sm:p-4 space-y-3 border shadow-sm">
      {/* En-tête de la liste */}
      <div className="flex items-center justify-between gap-2 font-semibold text-sm text-foreground">
        <span className="flex min-w-0 items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground shrink-0" />
          <span className="truncate">Lots en affinage ({lots.length})</span>
        </span>
        {onCreateLot && (
          <Button size="icon" className="size-8 shrink-0" onClick={onCreateLot} aria-label="Mettre un lot en affinage">
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {/* Sur mobile et tablette, les lots restent sur une rangée défilable.
          À partir de xl, ils deviennent la barre latérale verticale. */}
      <div className="-mx-1 flex min-w-0 snap-x gap-2 overflow-x-auto px-1 pb-2 xl:mx-0 xl:grid xl:grid-cols-1 xl:overflow-visible xl:px-0 xl:pb-0">
        {lots.map((lot) => {
          const isSelected = lot.id === selectedId;

          return (
            <button
              key={lot.id}
              type="button"
              onClick={() => onSelectLot(lot.id)}
              className={`w-[min(72vw,15rem)] min-w-0 shrink-0 snap-start overflow-hidden rounded-lg border p-2.5 text-left sm:w-[13.75rem] xl:w-full transition-all duration-150 flex items-center justify-between gap-2.5 ${
                isSelected
                  ? "border-primary/80 bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs sm:text-sm truncate text-foreground">
                  {lot.recipeName}
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground truncate font-mono">
                  {lot.batchCode}
                  {lot.variant && lot.variant !== "Nature" ? (
                    <span className="font-sans font-normal"> · {lot.variant}</span>
                  ) : null}
                </div>
              </div>

              {lot.daysRemaining !== undefined && (
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="shrink-0 font-medium text-[11px] px-2 py-0.5"
                >
                  {lot.daysRemaining}j
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
