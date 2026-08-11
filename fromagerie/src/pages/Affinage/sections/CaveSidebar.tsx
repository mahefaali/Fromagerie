import { Warehouse, Plus, Thermometer, Droplets } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { type Cave, capaciteFor } from "../../../lib/production-store";

interface CaveSidebarProps {
  caves: Cave[];
  selectedId: string;
  onSelectCave: (id: string) => void;
  onCreateClick: () => void;
}

export function CaveSidebar({
  caves,
  selectedId,
  onSelectCave,
  onCreateClick,
}: CaveSidebarProps) {
  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Caves</h2>
        </div>
        <Button size="sm" onClick={onCreateClick} aria-label="Créer une nouvelle cave">
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {caves.map((cave) => {
          const cap = capaciteFor(cave.etageres);
          const occ = cave.emplacements.filter((e) => e.contenu).length;
          const isActive = cave.id === selectedId;

          return (
            <button
              key={cave.id}
              type="button"
              onClick={() => onSelectCave(cave.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{cave.nom}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {occ} / {cap} emplacements
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