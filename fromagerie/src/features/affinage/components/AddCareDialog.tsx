import { useState, useEffect } from "react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./../../../components/ui/dialog";

export interface CareData {
  type: string;
  notes: string;
  date: string;
  rindState?: string;
}

export interface AddCareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitCare: (careData: CareData) => Promise<void>;
}

function localDateToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AddCareDialog({
  open,
  onOpenChange,
  onSubmitCare,
}: AddCareDialogProps) {
  const [typeSoin, setTypeSoin] = useState("Retournement");
  const [date, setDate] = useState("");
  const [etatCroute, setEtatCroute] = useState("");
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const today = localDateToday();

  // Réinitialisation des champs à l'ouverture
  useEffect(() => {
    if (open) {
      setDate(localDateToday());
      setTypeSoin("Retournement");
      setEtatCroute("");
      setObservations("");
      setIsSubmitting(false);
      setDateError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (date !== localDateToday()) {
      setDateError("La date du soin doit correspondre à la date du jour.");
      return;
    }

    setDateError(null);
    setIsSubmitting(true);
    try {
      await onSubmitCare({
        type: typeSoin,
        notes: observations.trim(),
        date,
        rindState: etatCroute.trim(),
      });
      onOpenChange(false);
    } catch {
      // Le parent affiche l'erreur et la boîte reste ouverte pour permettre une correction.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-[#FCFAF7] p-6 text-foreground border-none shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-bold text-foreground">
            Ajouter un soin
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enregistrez un retournement, un lavage ou une observation de croûte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Type de soin */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Type de soin</Label>
            <Select value={typeSoin} onValueChange={setTypeSoin}>
              <SelectTrigger className="h-11 rounded-xl border-border bg-white/60">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Retournement">Retournement</SelectItem>
                <SelectItem value="Lavage">Lavage / Frottage</SelectItem>
                <SelectItem value="Brossage">Brossage</SelectItem>
                <SelectItem value="Observation">Observation croûte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="space-y-1.5">
              <Label htmlFor="care-date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="care-date"
                type="date"
                value={date}
                min={today}
                max={today}
                readOnly
                aria-invalid={dateError !== null}
                aria-describedby={dateError ? "care-date-error" : undefined}
                onChange={(event) => {
                  setDate(event.target.value);
                  setDateError(null);
                }}
                className="h-11 rounded-xl border-border bg-white/60 pr-8"
                required
              />
              {dateError && (
                <p id="care-date-error" role="alert" className="text-sm text-destructive">
                  {dateError}
                </p>
              )}
            </div>

          </div>

          {/* État de croûte (optionnel) */}
          <div className="space-y-1.5">
            <Label htmlFor="care-croute" className="text-sm font-medium">
              État de croûte <span className="text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <Input
              id="care-croute"
              placeholder="Ex : fleur blanche régulière, humide, tachée..."
              value={etatCroute}
              onChange={(e) => setEtatCroute(e.target.value)}
              className="h-11 rounded-xl border-border bg-white/60 placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <Label htmlFor="care-obs" className="text-sm font-medium">
              Observations
            </Label>
            <Textarea
              id="care-obs"
              rows={3}
              placeholder="Notes, remarques particulières..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="rounded-xl border-border bg-white/60 placeholder:text-muted-foreground/60 resize-none"
            />
          </div>

          {/* Boutons d'action */}
          <DialogFooter className="flex items-center justify-end gap-2 pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl px-4 text-foreground hover:bg-black/5"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-[#2A481B] px-6 text-white hover:bg-[#203714]"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
