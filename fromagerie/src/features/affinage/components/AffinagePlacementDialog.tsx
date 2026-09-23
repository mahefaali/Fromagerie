import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Droplets, Layers3, Thermometer, Warehouse } from "lucide-react";

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
  const [selectedCaveIds, setSelectedCaveIds] = useState<number[]>([]);
  const [rangeeByCave, setRangeeByCave] = useState<Record<number, string>>({});
  const [dateMiseEnCave, setDateMiseEnCave] = useState("");
  const [dateSortiePrevue, setDateSortiePrevue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wasOpen = useRef(false);

  const availableCaves = useMemo(
    () => caves.filter((cave) =>
      cave.active
      && cave.capaciteDisponible > 0
      && (mode !== "create" || (cave.ageMinJours <= 1 && cave.ageMaxJours >= 1))
      && !excludedCaveIds?.includes(cave.id)),
    [caves, excludedCaveIds, mode],
  );
  const selectedCave = caves.find((cave) => cave.id === Number(caveId));
  const selectedFabrication = fabrications.find((fabrication) => fabrication.id === Number(fabricationId));
  const preselectedFabrication = mode === "create" && fabrications.length === 1
    ? fabrications[0]
    : undefined;
  const compatibleCaves = useMemo(
    () => selectedCave
      ? availableCaves.filter((cave) => haveSameConditions(selectedCave, cave))
      : [],
    [availableCaves, selectedCave],
  );
  const compatibleCapacity = compatibleCaves.reduce(
    (total, cave) => total + cave.capaciteDisponible,
    0,
  );
  const selectedCaves = selectedCaveIds
    .map((id) => caves.find((cave) => cave.id === id))
    .filter((cave): cave is CaveApiResponse => cave !== undefined);
  const selectedCapacity = selectedCaves.reduce(
    (total, cave) => total + cave.capaciteDisponible,
    0,
  );
  const insufficientCompatibleCapacity = mode === "create"
    && selectedFabrication !== undefined
    && selectedCave !== undefined
    && compatibleCapacity < selectedFabrication.nombreFromages;
  const insufficientSelectedCapacity = mode === "create"
    && selectedFabrication !== undefined
    && selectedCapacity < selectedFabrication.nombreFromages;
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
    setSelectedCaveIds(firstCave ? [firstCave.id] : []);
    setRangeeByCave(firstCave && firstRangee ? { [firstCave.id]: String(firstRangee.id) } : {});
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

  const handleCreateCaveToggle = (cave: CaveApiResponse) => {
    const alreadySelected = selectedCaveIds.includes(cave.id);
    if (alreadySelected) {
      if (selectedCaveIds.length === 1) return;
      const remaining = selectedCaveIds.filter((id) => id !== cave.id);
      setSelectedCaveIds(remaining);
      setCaveId(String(remaining[0]));
      return;
    }

    const reference = selectedCaves[0];
    const firstRangee = cave.etageres.flatMap((etagere) => etagere.rangees)
      .find((rangee) => rangee.capaciteDisponible > 0);
    if (reference && !haveSameConditions(reference, cave)) {
      setSelectedCaveIds([cave.id]);
      setCaveId(String(cave.id));
      setRangeeId(firstRangee ? String(firstRangee.id) : "");
      setRangeeByCave(firstRangee ? { [cave.id]: String(firstRangee.id) } : {});
      return;
    }
    setSelectedCaveIds((ids) => [...ids, cave.id]);
    setRangeeByCave((values) => ({
      ...values,
      [cave.id]: firstRangee ? String(firstRangee.id) : "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!caveId || !rangeeId || insufficientCompatibleCapacity || insufficientSelectedCapacity || (mode === "create" && !fabricationId)) return;
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
        emplacementsInitiaux: selectedCaveIds.map((selectedId) => ({
          caveId: selectedId,
          rangeeDepartId: Number(rangeeByCave[selectedId]),
        })),
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
      <DialogContent className="flex max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-[#e2dacb]/60 bg-[#f5f2eb]/40 px-6 pb-5 pt-6 sm:px-8">
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#2c2825]">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-base text-[#716858]">
            {preselectedFabrication ? (
              <>
                Lot <span className="font-mono font-medium">{preselectedFabrication.numeroLot}</span>
                {" — "}{preselectedFabrication.fromageNom}
                {preselectedFabrication.recetteNom ? ` · ${preselectedFabrication.recetteNom}` : ""}
                {" · "}{preselectedFabrication.nombreFromages} emplacement
                {preselectedFabrication.nombreFromages > 1 ? "s" : ""} requis
              </>
            ) : (
              "Choisissez une cave et une rangée. La première position libre et les blocs suivants seront calculés automatiquement."
            )}
          </DialogDescription>
          {mode === "create" && selectedCave && selectedFabrication && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${insufficientCompatibleCapacity
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : insufficientSelectedCapacity
                ? "border-amber-300 bg-amber-50 text-amber-950"
                : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
              {insufficientCompatibleCapacity ? (
                <p role="alert">
                  Les places disponibles totales de toutes les caves compatibles ne peuvent pas accueillir ce lot de fabrication ({compatibleCapacity} place(s) pour {selectedFabrication.nombreFromages} fromages).
                </p>
              ) : insufficientSelectedCapacity ? (
                <p role="status">
                  Cette cave ne peut accueillir que {selectedCapacity} fromage{selectedCapacity > 1 ? "s" : ""} sur {selectedFabrication.nombreFromages}. Sélectionnez une autre cave ayant les mêmes conditions d'affinage pour accueillir le reste du lot.
                </p>
              ) : (
                <p>
                  {selectedCaves.length === 1
                    ? `Cette cave peut satisfaire tout le lot de ${selectedFabrication.nombreFromages} fromages.`
                    : `Les ${selectedCaves.length} caves sélectionnées peuvent satisfaire tout le lot de ${selectedFabrication.nombreFromages} fromages.`}
                </p>
              )}
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 pb-6 [scrollbar-color:#797979_transparent] [scrollbar-width:thin]">
          {mode === "create" && (
            <>
              {fabrications.length > 1 && (
                <div className="space-y-1.5">
                  <Label>Fabrication</Label>
                  <Select value={fabricationId} onValueChange={setFabricationId}>
                    <SelectTrigger className="h-12 rounded-xl border-[#ddd4c3] bg-white"><SelectValue placeholder="Choisir une fabrication" /></SelectTrigger>
                    <SelectContent>
                      {fabrications.map((fabrication) => (
                        <SelectItem key={fabrication.id} value={String(fabrication.id)}>
                          {fabrication.numeroLot} · {fabrication.fromageNom} ({fabrication.nombreFromages})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="entry-date">Mise en cave</Label>
                  <Input className="h-12 rounded-xl border-[#ddd4c3] bg-white" id="entry-date" type="date" value={dateMiseEnCave} onChange={(e) => setDateMiseEnCave(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exit-date">Sortie prévue</Label>
                  <Input className="h-12 rounded-xl border-[#ddd4c3] bg-white" id="exit-date" type="date" min={dateMiseEnCave} value={dateSortiePrevue} onChange={(e) => setDateSortiePrevue(e.target.value)} required />
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
              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium">Cave {mode === "move" ? "destination" : "d'affinage"}</legend>
                {availableCaves.map((cave) => {
                  const selected = mode === "create"
                    ? selectedCaveIds.includes(cave.id)
                    : caveId === String(cave.id);
                  const reference = selectedCaves[0];
                  const incompatible = mode === "create"
                    && reference !== undefined
                    && !selected
                    && !haveSameConditions(reference, cave);
                  const caveRangees = cave.etageres.flatMap((etagere) => etagere.rangees
                    .filter((rangee) => rangee.capaciteDisponible > 0)
                    .map((rangee) => ({ ...rangee, etagereNumero: etagere.numero })));
                  return (
                    <div
                      key={cave.id}
                      className={`w-full overflow-hidden rounded-3xl border text-left transition-all ${selected
                        ? "border-[#365314] bg-[#365314]/[0.035] shadow-sm ring-1 ring-[#365314]/10"
                        : incompatible
                          ? "border-[#e1dacd] bg-white/25 opacity-55 hover:border-[#83935f] hover:opacity-80"
                          : "border-[#e1dacd] bg-white/45 hover:border-[#83935f] hover:bg-white/70"}`}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => mode === "create"
                          ? handleCreateCaveToggle(cave)
                          : handleCaveChange(String(cave.id))}
                        className="w-full cursor-pointer rounded-3xl p-5 text-left"
                      >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-lg font-semibold text-[#29271f]">
                            <Warehouse className={`size-5 ${selected ? "text-[#365314]" : "text-[#788269]"}`} />
                            <span>{cave.nom}</span>
                          </div>
                          {cave.description && <p className="mt-1 text-sm text-[#756c5c]">{cave.description}</p>}
                        </div>
                        <span className="shrink-0 rounded-xl bg-[#e9e3d7] px-3 py-1 text-sm font-semibold text-[#3f3a31]">
                          {cave.capaciteDisponible}/{cave.capaciteTotale} libres
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <CaveMetric icon={<Thermometer className="size-3.5" />} label="Cible" value={`${cave.temperature} °C`} />
                        <CaveMetric icon={<Droplets className="size-3.5" />} label="Humidité" value={`${cave.humidite} %`} />
                        <CaveMetric icon={<Layers3 className="size-3.5" />} label="Étagères" value={String(cave.etageres.length)} />
                        <CaveMetric icon={<Warehouse className="size-3.5" />} label="Capacité" value={String(cave.capaciteTotale)} />
                      </div>
                      <p className="mt-3 text-xs text-[#746b5c]">
                        Affinage prévu : {cave.ageMinJours} à {cave.ageMaxJours} jours
                        {incompatible ? " · Cliquez pour choisir cette cave et changer de conditions" : ""}
                      </p>
                      </button>
                      {mode === "create" && selected && (
                        <div className="border-t border-[#d8d0c1] px-5 pb-5 pt-4">
                          <Label className="mb-2">Rangée de départ — {cave.nom}</Label>
                          <Select
                            value={rangeeByCave[cave.id] ?? ""}
                            onValueChange={(value) => setRangeeByCave((values) => ({ ...values, [cave.id]: value }))}
                          >
                            <SelectTrigger className="h-12 rounded-2xl border-[#d4cab9] bg-white">
                              <SelectValue placeholder="Choisir la rangée de départ" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {caveRangees.map((rangee) => (
                                <SelectItem className="rounded-xl" key={rangee.id} value={String(rangee.id)}>
                                  Étagère {rangee.etagereNumero} · Rangée {rangee.numero} · {rangee.capaciteDisponible} libre(s)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </fieldset>

              {mode !== "create" && <div className="space-y-1.5">
                <Label>Rangée de départ</Label>
                <Select value={rangeeId} onValueChange={setRangeeId}>
                  <SelectTrigger className="h-12 rounded-xl border-[#ddd4c3] bg-white"><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {rangees.map((rangee) => (
                      <SelectItem key={rangee.id} value={String(rangee.id)}>
                        Étagère {rangee.etagereNumero} · Rangée {rangee.numero}
                        {` · ${rangee.capaciteDisponible} libre(s)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>}
            </>
          )}

          </div>
          <DialogFooter className="border-t border-[#e2dacb]/60 bg-[#f5f2eb]/40 px-6 py-5 sm:px-8">
            <Button className="h-11 rounded-full border-[#ddd4c3] bg-[#fbf8f1] px-6 hover:bg-[#f1ece2]" type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button className="h-11 rounded-full bg-[#365314] px-6 text-white hover:bg-[#2d4511]" type="submit" disabled={isSubmitting || insufficientCompatibleCapacity || insufficientSelectedCapacity || selectedCaveIds.some((id) => !rangeeByCave[id]) || availableCaves.length === 0 || (mode === "create" && fabrications.length === 0)}>
              {isSubmitting ? "Enregistrement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CaveMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#ddd4c3] bg-[#f7f2e8] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-[#756c5c]">{icon}{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-[#29271f]">{value}</div>
    </div>
  );
}

function haveSameConditions(reference: CaveApiResponse, candidate: CaveApiResponse): boolean {
  return reference.temperature === candidate.temperature
    && reference.humidite === candidate.humidite
    && reference.ageMinJours === candidate.ageMinJours
    && reference.ageMaxJours === candidate.ageMaxJours;
}
