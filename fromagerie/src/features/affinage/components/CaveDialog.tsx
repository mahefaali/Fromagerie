import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import type { Cave } from "../domain/cave";
import { CaveEnvironmentFields, CaveIdentityFields } from "./cave-dialog/CaveGeneralFields";
import { CaveShelfFields } from "./cave-dialog/CaveShelfFields";
import { useCaveDialogForm } from "./cave-dialog/useCaveDialogForm";

interface CaveDialogProps {
  open: boolean;
  initial: Cave | null;
  onOpenChange: (open: boolean) => void;
  onSave: (cave: Cave) => void;
}

export function CaveDialog({ open, initial, onOpenChange, onSave }: CaveDialogProps) {
  const form = useCaveDialogForm(open, initial, onSave);

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden">
      <DialogHeader><DialogTitle>{initial ? "Modifier la cave" : "Nouvelle cave"}</DialogTitle>
        <DialogDescription>Configurez chaque étagère avec ses propres rangées et positions.</DialogDescription>
      </DialogHeader>
      <form onSubmit={form.submit} className="flex min-h-0 flex-1 flex-col justify-between">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
          <CaveIdentityFields values={form.values} update={form.update} />
          <CaveShelfFields shelves={form.values.etageres} capacity={form.capacity} onAdd={form.addShelf} onRemove={form.removeShelf} onUpdate={form.updateShelf} />
          <CaveEnvironmentFields values={form.values} update={form.update} />
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="submit">{initial ? "Enregistrer" : "Créer"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
