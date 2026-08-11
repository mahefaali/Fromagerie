import { useMemo, useState } from "react";
import { Warehouse, Thermometer, Droplets } from "lucide-react";

import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Badge } from "./../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./../../../components/ui/dialog";
import { type Cave, type Fabrication } from "./../../../lib/production-store";

interface ChooseCaveDialogProps {
  fabrication: Fabrication | null;
  caves: Cave[];
  onClose: () => void;
  onConfirm: (caveId: string, affinageDays: number) => void;
}

export function ChooseCaveDialog({
  fabrication,
  caves,
  onClose,
  onConfirm,
}: ChooseCaveDialogProps) {
  const [selectedCaveId, setSelectedCaveId] = useState<string>("");
  const [days, setDays] = useState<number>(21);

  const neededSlots = Math.max(1, fabrication?.yieldPieces ?? 1);

  const caveOptions = useMemo(() => {
    return caves.map((c) => {
      const total = c.emplacements.length;
      const free = c.emplacements.filter((e) => !e.contenu).length;
      return {
        cave: c,
        total,
        free,
        isEligible: free >= neededSlots,
      };
    });
  }, [caves, neededSlots]);

  const handleClose = () => {
    setSelectedCaveId("");
    setDays(21);
    onClose();
  };

  return (
    <Dialog open={Boolean(fabrication)} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Choisir une cave pour l'affinage</DialogTitle>
          <DialogDescription>
            {fabrication && (
              <>
                Lot <span className="font-mono">{fabrication.batchCode}</span> —{" "}
                {fabrication.recipeName}
                {fabrication.variant && fabrication.variant !== "Nature"
                  ? ` (${fabrication.variant})`
                  : ""}{" "}
                • {neededSlots} emplacement{neededSlots > 1 ? "s" : ""} requis
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-3">
          {caveOptions.every((opt) => !opt.isEligible) && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Aucune cave n'a assez d'espace libre pour ce lot ({neededSlots} emplacement
              {neededSlots > 1 ? "s" : ""} requis).
            </div>
          )}

          {caveOptions.map(({ cave, total, free, isEligible }) => {
            const isSelected = selectedCaveId === cave.id;

            return (
              <button
                key={cave.id}
                type="button"
                disabled={!isEligible}
                onClick={() => setSelectedCaveId(cave.id)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  !isEligible
                    ? "cursor-not-allowed opacity-50"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Warehouse className="size-4 text-primary" />
                      <span className="font-semibold">{cave.nom}</span>
                    </div>
                    {cave.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{cave.description}</p>
                    )}
                  </div>
                  <Badge variant={isEligible ? "secondary" : "outline"}>
                    {free}/{total} libres
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <div className="rounded-md border bg-card/50 px-2 py-1.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Thermometer className="size-3" /> Cible
                    </div>
                    <div className="font-semibold">{cave.temperatureCible}°C</div>
                  </div>
                  <div className="rounded-md border bg-card/50 px-2 py-1.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Droplets className="size-3" /> Humidité
                    </div>
                    <div className="font-semibold">{cave.humiditeCible}%</div>
                  </div>
                  <div className="rounded-md border bg-card/50 px-2 py-1.5">
                    <div className="text-muted-foreground">Étagères</div>
                    <div className="font-semibold">{cave.etageres.length}</div>
                  </div>
                  <div className="rounded-md border bg-card/50 px-2 py-1.5">
                    <div className="text-muted-foreground">Capacité</div>
                    <div className="font-semibold">{total}</div>
                  </div>
                </div>

                {!isEligible && (
                  <p className="mt-2 text-xs text-destructive">
                    Espace insuffisant ({free} libre{free > 1 ? "s" : ""} sur {neededSlots}{" "}
                    requis).
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-3">
          <Label htmlFor="affinage-days" className="text-sm">
            Durée d'affinage souhaitée (jours)
          </Label>
          <Input
            id="affinage-days"
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-40"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            disabled={!selectedCaveId || days < 1}
            onClick={() => onConfirm(selectedCaveId, days)}
          >
            Confirmer l'affinage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}