import { Warehouse, Plus, Thermometer, Droplets } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { type Cave, capaciteFor } from "../domain/cave";

interface CaveSidebarProps {
  caves: Cave[];
  selectedId: string;
  onSelectCave: (id: string) => void;
  onCreateClick: () => void;
  canManage: boolean;
}

export function CaveSidebar({
  caves,
  selectedId,
  onSelectCave,
  onCreateClick,
  canManage,
}: CaveSidebarProps) {
  return (
    <aside className="min-w-0 space-y-3 xl:sticky xl:top-4 xl:self-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Caves</h2>
        </div>
        {canManage && (
          <Button size="sm" onClick={onCreateClick} aria-label="Créer une nouvelle cave">
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 xl:mx-0 xl:block xl:space-y-2 xl:overflow-visible xl:px-0 xl:pb-0">
        {caves.map((cave) => {
          const cap = capaciteFor(cave.etageres);
          const isActive = cave.id === selectedId;

          return (
            <button
              key={cave.id}
              type="button"
              onClick={() => onSelectCave(cave.id)}
              className={`w-[min(74vw,230px)] shrink-0 snap-start rounded-lg border p-3 text-left transition-colors sm:w-[220px] xl:w-full ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{cave.nom}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cave.capaciteOccupee} / {cap} emplacements
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Thermometer className="size-3" />
                    {cave.temperatureCible}°
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Droplets className="size-3" />
                    {cave.humiditeCible}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
