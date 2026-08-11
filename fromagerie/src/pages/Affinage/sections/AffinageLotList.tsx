import { ClipboardList } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
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
}

export function AffinageLotList({
  lots,
  selectedId,
  onSelectLot,
}: AffinageLotListProps) {
  return (
    <Card className="w-full min-w-0 p-3 sm:p-4 space-y-3 border shadow-sm">
      {/* En-tête de la liste */}
      <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
        <ClipboardList className="size-4 text-muted-foreground shrink-0" />
        <span className="truncate">Lots en affinage ({lots.length})</span>
      </div>

      {/* 
        Disposition en Grille : 
        - Mobile (< 640px) : 1 colonne 
        - Tablette (640px - 1023px) : 2 colonnes (optimise l'espace vertical)
        - Desktop (>= 1024px) : 1 colonne (format barre latérale)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 w-full min-w-0">
        {lots.map((lot) => {
          const isSelected = lot.id === selectedId;

          return (
            <button
              key={lot.id}
              type="button"
              onClick={() => onSelectLot(lot.id)}
              className={`w-full min-w-0 overflow-hidden rounded-lg border p-2.5 sm:p-3 text-left transition-all duration-150 flex items-center justify-between gap-2.5 ${
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