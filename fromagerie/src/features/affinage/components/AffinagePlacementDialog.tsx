import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Warehouse } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { FabricationListItem } from "../../fabrications/types/fabrication.types";
import type { CaveApiResponse } from "../types/cave.types";
import type { CreateAffinageRequest, PlacementRequest } from "../types/affinage.types";

export type PlacementDialogMode = "create" | "remaining" | "move";

interface AffinagePlacementDialogProps {
  open: boolean;
  mode: PlacementDialogMode;
  fabrications: FabricationListItem[];
  caves: CaveApiResponse[];
  excludedCaveIds?: number[];
  quantity?: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: CreateAffinageRequest | PlacementRequest) => Promise<void>;
}

export function AffinagePlacementDialog({
  open,
  mode,
  fabrications,
  caves,
  excludedCaveIds,
  quantity,
  onOpenChange,
  onSubmit,
}: AffinagePlacementDialogProps) {
  const [fabricationId, setFabricationId] = useState("");
  const [caveId, setCaveId] = useState("");
  const [rangeeId, setRangeeId] = useState("");
  const [dateMiseEnCave, setDateMiseEnCave] = useState("");
  const [dateSortiePrevue, setDateSortiePrevue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wasOpen = useRef(false);

  const availableCaves = useMemo(
    () => caves.filter((cave) =>
      cave.active
      && cave.capaciteDisponible > 0
      && !excludedCaveIds?.includes(cave.id)),
    [caves, excludedCaveIds],
  );
  const selectedCave = caves.find((cave) => cave.id === Number(caveId));
  const rangees = useMemo(() => selectedCave?.etageres.flatMap((etagere) =>
    etagere.rangees
      .filter((rangee) => rangee.capaciteDisponible > 0)
      .map((rangee) => ({ ...rangee, etagereNumero: etagere.numero }))) ?? [], [selectedCave]);
  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (wasOpen.current) return;
    wasOpen.current = true;

    const today = new Date();
    const expected = new Date(today);
    expected.setDate(expected.getDate() + 30);
    setFabricationId(fabrications[0] ? String(fabrications[0].id) : "");
    const firstCave = availableCaves[0];
    const firstRangee = firstCave?.etageres.flatMap((etagere) => etagere.rangees)
      .find((rangee) => rangee.capaciteDisponible > 0);
    setCaveId(firstCave ? String(firstCave.id) : "");
    setRangeeId(firstRangee
      ? String(firstRangee.id)
      : "");
    setDateMiseEnCave(today.toISOString().slice(0, 10));
    setDateSortiePrevue(expected.toISOString().slice(0, 10));
  }, [open, fabrications, availableCaves]);

  const handleCaveChange = (value: string) => {
    const cave = caves.find((item) => item.id === Number(value));
    const firstAvailableRangee = cave?.etageres.flatMap((etagere) => etagere.rangees)
      .find((rangee) => rangee.capaciteDisponible > 0);
    setCaveId(value);
    setRangeeId(firstAvailableRangee
      ? String(firstAvailableRangee.id)
      : "");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caveId || !rangeeId || (mode === "create" && !fabricationId)) return;
    const placement: PlacementRequest = {
      caveId: Number(caveId),
      rangeeDepartId: Number(rangeeId),
    };
    setIsSubmitting(true);
    try {
      await onSubmit(mode === "create" ? {
        fabricationId: Number(fabricationId),
        dateMiseEnCave,
        dateSortiePrevue,
        emplacementInitial: placement,
      } : placement);
      onOpenChange(false);
    } catch {
      // Le parent affiche l'erreur et conserve les choix saisis.
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "create"
    ? "Mettre un lot en affinage"
    : mode === "move"
      ? "Confirmer le déplacement"
      : "Placer le reste du lot";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choisissez une cave et une rangée. La première position libre et les blocs suivants seront calculés automatiquement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <>
              <div className="space-y-1.5">
                <Label>Fabrication</Label>
                <Select value={fabricationId} onValueChange={setFabricationId}>
                  <SelectTrigger><SelectValue placeholder="Choisir une fabrication" /></SelectTrigger>
                  <SelectContent>
                    {fabrications.map((fabrication) => (
                      <SelectItem key={fabrication.id} value={String(fabrication.id)}>
                        {fabrication.numeroLot} · {fabrication.fromageNom} ({fabrication.nombreFromages})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="entry-date">Mise en cave</Label>
                  <Input id="entry-date" type="date" value={dateMiseEnCave} onChange={(e) => setDateMiseEnCave(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exit-date">Sortie prévue</Label>
                  <Input id="exit-date" type="date" min={dateMiseEnCave} value={dateSortiePrevue} onChange={(e) => setDateSortiePrevue(e.target.value)} required />
                </div>
              </div>
            </>
          )}

          {quantity !== undefined && (
            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              Quantité concernée : <strong>{quantity} fromage(s)</strong>
            </p>
          )}

          {availableCaves.length === 0 ? (
            <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-5 text-amber-950">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2">
                  <Warehouse className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    {mode === "remaining" ? "Il n'y a plus d'autre cave libre" : "Il n'y a plus de cave libre"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                    Attendez la prochaine sortie d'affinage des autres lots avant de placer ces fromages.
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-800">
                    <Clock3 className="size-3.5" /> Le lot restera disponible pour un prochain placement.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Cave {mode === "move" ? "destination" : ""}</Label>
                <Select value={caveId} onValueChange={handleCaveChange}>
                  <SelectTrigger><SelectValue placeholder="Choisir une cave" /></SelectTrigger>
                  <SelectContent>
                    {availableCaves.map((cave) => (
                      <SelectItem key={cave.id} value={String(cave.id)}>
                        {cave.nom} · {cave.capaciteDisponible} place(s) disponible(s)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Rangée de départ</Label>
                <Select value={rangeeId} onValueChange={setRangeeId}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {rangees.map((rangee) => (
                      <SelectItem key={rangee.id} value={String(rangee.id)}>
                        Étagère {rangee.etagereNumero} · Rangée {rangee.numero}
                        {` · ${rangee.capaciteDisponible} libre(s)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting || availableCaves.length === 0 || (mode === "create" && fabrications.length === 0)}>
              {isSubmitting ? "Enregistrement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
