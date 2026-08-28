import { useMemo } from "react";
import { Badge } from "./../../../components/ui/badge";
import { Button } from "./../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../components/ui/card";
import { type Cave, type Emplacement } from "../../../services/production-store";
import type { CaveOccupation } from "../types/cave.types";

interface CaveGridPlanProps {
  cave: Cave;
  occupations: CaveOccupation[];
  isLoadingOccupations: boolean;
  occupationError: string | null;
  onRetryOccupations: () => void | Promise<void>;
}

export function CaveGridPlan({
  cave,
  occupations,
  isLoadingOccupations,
  occupationError,
  onRetryOccupations,
}: CaveGridPlanProps) {
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
  const occupationsByPosition = useMemo(() => {
    const result = new Map<string, CaveOccupation>();
    for (const occupation of occupations) {
      for (let position = occupation.positionDebut; position <= occupation.positionFin; position++) {
        result.set(`${occupation.etagereNumero}-${occupation.rangeeNumero}-${position}`, occupation);
      }
    }
    return result;
  }, [occupations]);

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
          Les places occupées affichent leur numéro de lot; les places disponibles conservent leur numéro physique.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingOccupations ? (
          <p role="status" aria-live="polite" className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Chargement de l’occupation de la cave...
          </p>
        ) : occupationError ? (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{occupationError}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void onRetryOccupations()}>
              Réessayer
            </Button>
          </div>
        ) : plan.map(({ etagere, rangees }) => {
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
                      {positions.map((p) => {
                        const positionCode = `${p.etagere}-${p.rangee}-${p.position}`;
                        const occupation = occupationsByPosition.get(positionCode);

                        return (
                          <div
                            key={p.id}
                            aria-label={occupation
                              ? `Position ${positionCode}, lot ${occupation.numeroLot}`
                              : `Position ${positionCode}, libre`}
                            className={occupation
                              ? "flex min-h-14 min-w-[90px] flex-col justify-center rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-foreground"
                              : "flex min-h-14 min-w-[90px] flex-col justify-center rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground"}
                          >
                            {occupation ? (
                              <>
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">Lot</span>
                                <span className="font-mono text-[11px] font-semibold">{occupation.numeroLot}</span>
                              </>
                            ) : (
                              <>
                                <span className="font-mono text-[10px] opacity-70">{positionCode}</span>
                                <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-emerald-700">Libre</span>
                              </>
                            )}
                          </div>
                        );
                      })}
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
