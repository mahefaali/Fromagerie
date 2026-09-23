import { Plus, Trash2 } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { NumericInput } from "../../../../components/ui/numeric-input";
import { Label } from "../../../../components/ui/label";
import type { EtagereConfig } from "../../domain/cave";

export function CaveShelfFields({ shelves, capacity, onAdd, onRemove, onUpdate }: {
  shelves: EtagereConfig[];
  capacity: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<EtagereConfig>) => void;
}) {
  return <div>
    <div className="mb-2 flex items-center justify-between"><Label className="text-xs uppercase tracking-wide text-muted-foreground">Étagères</Label>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus className="mr-1 size-3.5" /> Ajouter</Button>
    </div>
    <div className="space-y-2">{shelves.map((shelf, index) => <div key={`${index}-${shelf.label}`} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md border p-2.5">
      <ShelfField label="Réf"><Input aria-label={`Référence de l’étagère ${index + 1}`} value={shelf.label} onChange={(event) => onUpdate(index, { label: event.target.value })} maxLength={3} /></ShelfField>
      <ShelfField label="Rangées"><NumericInput aria-label={`Rangées de l’étagère ${index + 1}`} min={1} integer value={shelf.nbRangees} onValueChange={(value) => { if (value !== null) onUpdate(index, { nbRangees: value }); }} /></ShelfField>
      <ShelfField label="Positions"><NumericInput aria-label={`Positions de l’étagère ${index + 1}`} min={1} integer value={shelf.nbPositions} onValueChange={(value) => { if (value !== null) onUpdate(index, { nbPositions: value }); }} /></ShelfField>
      <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)} disabled={shelves.length <= 1} aria-label={`Supprimer l’étagère ${index + 1}`}><Trash2 className="size-4" /></Button>
    </div>)}</div>
    <p className="mt-2 text-xs text-muted-foreground">Capacité totale : <span className="font-semibold text-foreground">{capacity}</span> emplacements</p>
  </div>;
}

function ShelfField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>{children}</div>;
}
