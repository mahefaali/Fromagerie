import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./../../../components/ui/dialog";
import {
  buildEmplacements,
  capaciteFor,
  newId,
  type Cave,
  type EtagereConfig,
} from "../../../services/production-store";

interface CaveDialogProps {
  open: boolean;
  initial: Cave | null;
  onOpenChange: (open: boolean) => void;
  onSave: (cave: Cave) => void;
}

export function CaveDialog({ open, initial, onOpenChange, onSave }: CaveDialogProps) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [etageres, setEtageres] = useState<EtagereConfig[]>([
    { label: "1", nbRangees: 2, nbPositions: 4 },
  ]);
  const [temperature, setTemperature] = useState<number>(12);
  const [humidite, setHumidite] = useState<number>(90);
  const [ageMinJours, setAgeMinJours] = useState<number>(1);
  const [ageMaxJours, setAgeMaxJours] = useState<number>(30);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open) {
      setNom(initial?.nom ?? "");
      setDescription(initial?.description ?? "");
      setEtageres(
        initial?.etageres.map((e) => ({ ...e })) ?? [
          { label: "1", nbRangees: 2, nbPositions: 4 },
        ]
      );
      setTemperature(initial?.temperatureCible ?? 12);
      setHumidite(initial?.humiditeCible ?? 90);
      setAgeMinJours(initial?.ageMinJours ?? 1);
      setAgeMaxJours(initial?.ageMaxJours ?? 30);
      setActive(initial?.active ?? true);
    }
  }, [open, initial]);

  const capacite = capaciteFor(
    etageres.map((e) => ({
      ...e,
      nbRangees: Number(e.nbRangees) || 0,
      nbPositions: Number(e.nbPositions) || 0,
    }))
  );

  const updateEtagere = (i: number, patch: Partial<EtagereConfig>) => {
    setEtageres((prev) => prev.map((e, idx) => {
      if (idx !== i) return e;
      const structureChanged = patch.nbRangees !== undefined || patch.nbPositions !== undefined;
      return { ...e, ...patch, rangees: structureChanged ? undefined : e.rangees };
    }));
  };

  const addEtagere = () => {
    setEtageres((prev) => [
      ...prev,
      { label: String(prev.length + 1), nbRangees: 2, nbPositions: 4 },
    ]);
  };

  const removeEtagereAt = (i: number) => {
    setEtageres((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    const cleaned = etageres
      .filter((e) => e.label.trim())
      .map((e) => ({
        label: e.label.trim().toUpperCase(),
        nbRangees: Math.max(1, Number(e.nbRangees) || 1),
        nbPositions: Math.max(1, Number(e.nbPositions) || 1),
        rangees: e.rangees,
      }));

    if (cleaned.length === 0 || ageMaxJours <= ageMinJours) return;

    onSave({
      id: initial?.id ?? newId(),
      nom: nom.trim(),
      description: description.trim(),
      etageres: cleaned,
      temperatureCible: Number(temperature) || 0,
      humiditeCible: Number(humidite) || 0,
      ageMinJours: Number(ageMinJours) || 0,
      ageMaxJours: Number(ageMaxJours) || 0,
      active,
      capaciteOccupee: initial?.capaciteOccupee ?? 0,
      capaciteDisponible: initial?.capaciteDisponible ?? capacite,
      emplacements: buildEmplacements(cleaned, initial?.emplacements ?? []),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier la cave" : "Nouvelle cave"}</DialogTitle>
          <DialogDescription>
            Configurez chaque étagère avec ses propres rangées et positions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col justify-between">
          <div className="min-h-0 flex-1 overflow-y-auto pr-2 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cave-nom">Nom</Label>
              <Input
                id="cave-nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Cave d'affinage principale"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="cave-desc">Description</Label>
              <Textarea
                id="cave-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Cave voûtée en pierre..."
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Étagères
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addEtagere}>
                  <Plus className="mr-1 size-3.5" /> Ajouter
                </Button>
              </div>

              <div className="space-y-2">
                {etageres.map((et, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md border p-2.5"
                  >
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase">Réf</Label>
                      <Input
                        value={et.label}
                        onChange={(e) => updateEtagere(i, { label: e.target.value })}
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase">
                        Rangées
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={et.nbRangees}
                        onChange={(e) => updateEtagere(i, { nbRangees: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase">
                        Positions
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={et.nbPositions}
                        onChange={(e) =>
                          updateEtagere(i, { nbPositions: Number(e.target.value) })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEtagereAt(i)}
                      disabled={etageres.length <= 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Capacité totale : <span className="font-semibold text-foreground">{capacite}</span>{" "}
                emplacements
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cave-temp">Température (°C)</Label>
                <Input
                  id="cave-temp"
                  type="number"
                  step="0.01"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cave-hum">Humidité (%)</Label>
                <Input
                  id="cave-hum"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={humidite}
                  onChange={(e) => setHumidite(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="cave-age-min">Âge minimum (jours)</Label>
                <Input
                  id="cave-age-min"
                  type="number"
                  min={0}
                  value={ageMinJours}
                  onChange={(e) => setAgeMinJours(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cave-age-max">Âge maximum (jours)</Label>
                <Input
                  id="cave-age-max"
                  type="number"
                  min={1}
                  value={ageMaxJours}
                  onChange={(e) => setAgeMaxJours(Number(e.target.value))}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Cave active
            </label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{initial ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
