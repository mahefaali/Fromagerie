import { useMemo } from "react";
import { X } from "lucide-react";
import { Badge } from "./../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../components/ui/card";
import { caveActions, type Cave, type Emplacement } from "./../../../lib/production-store";

interface CaveGridPlanProps {
  cave: Cave;
  onSelectSlot: (slot: Emplacement) => void;
}

export function CaveGridPlan({ cave, onSelectSlot }: CaveGridPlanProps) {
  const plan = useMemo(() => {
    const order = new Map(cave.etageres.map((e, i) => [e.label, i]));
    const byEtagere = new Map<string, Map<number, Emplacement[]>>();

    for (const e of cave.emplacements) {
      if (!byEtagere.has(e.etagere)) byEtagere.set(e.etagere, new Map());
      const rMap = byEtagere.get(e.etagere)!;
      if (!rMap.has(e.rangee)) rMap.set(e.rangee, []);
      rMap.get(e.rangee)!.push(e);
    }

    return [...byEtagere.entries()]
      .sort(([a], [b]) => (order.get(a) ?? 999) - (order.get(b) ?? 999) || a.localeCompare(b))
      .map(([etagere, rMap]) => ({
        etagere,
        rangees: [...rMap.entries()]
          .sort(([a], [b]) => a - b)
          .map(([rangee, positions]) => ({
            rangee,
            positions: positions.sort((a, b) => a.position - b.position),
          })),
      }));
  }, [cave]);

  if (plan.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Aucun emplacement. Modifiez la cave pour ajouter des étagères.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">Plan de la cave</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Cliquez sur un emplacement pour lui assigner un contenu.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {plan.map(({ etagere, rangees }) => {
          const cfg = cave.etageres.find((e) => e.label === etagere);

          return (
            <div key={etagere}>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  Étagère {etagere}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {cfg
                    ? `${cfg.nbRangees} rangée${cfg.nbRangees > 1 ? "s" : ""} × ${cfg.nbPositions} position${cfg.nbPositions > 1 ? "s" : ""}`
                    : `${rangees.reduce((n, r) => n + r.positions.length, 0)} positions`}
                </span>
              </div>

              <div className="space-y-2">
                {rangees.map(({ rangee, positions }) => (
                  <div
                    key={rangee}
                    className="flex items-start gap-3 rounded-md border border-border bg-card/50 p-3"
                  >
                    <div className="w-16 shrink-0 pt-1 text-xs font-medium text-muted-foreground">
                      Rangée {rangee}
                    </div>
                    <div className="flex flex-1 flex-wrap gap-2">
                      {positions.map((p) => (
                        <div
                          key={p.id}
                          className={`group relative flex min-w-[110px] flex-col rounded-md border px-3 py-2 text-xs transition-colors ${
                            p.contenu
                              ? "border-primary/40 bg-primary/10 text-foreground"
                              : "border-dashed border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectSlot(p)}
                            className="flex flex-col items-start text-left"
                          >
                            <span className="font-mono text-[10px] opacity-70">
                              {p.etagere}-{p.rangee}-{p.position}
                            </span>
                            <span className="mt-0.5 truncate">{p.contenu ?? "Libre"}</span>
                          </button>

                          {p.contenu && (
                            <button
                              type="button"
                              onClick={() => caveActions.setContenu(cave.id, p.id, undefined)}
                              className="absolute -right-1 -top-1 hidden size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-destructive group-hover:flex"
                              aria-label="Vider la position"
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}