import { useEffect, useState } from "react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./../../../components/ui/dialog";
import { type Emplacement } from "./../../../lib/production-store";

interface ContenuDialogProps {
  emplacement: Emplacement | null;
  onOpenChange: (open: boolean) => void;
  onSave: (contenu: string) => void;
}

export function ContenuDialog({
  emplacement,
  onOpenChange,
  onSave,
}: ContenuDialogProps) {
  const [contenu, setContenu] = useState("");

  useEffect(() => {
    if (emplacement) setContenu(emplacement.contenu ?? "");
  }, [emplacement]);

  return (
    <Dialog open={emplacement !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Emplacement{" "}
            {emplacement
              ? `${emplacement.etagere}-${emplacement.rangee}-${emplacement.position}`
              : ""}
          </DialogTitle>
          <DialogDescription>
            Assignez un lot ou un fromage à cet emplacement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="emp-contenu">Contenu</Label>
          <Input
            id="emp-contenu"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Ex: Camembert L-241107"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => onSave(contenu.trim())}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}