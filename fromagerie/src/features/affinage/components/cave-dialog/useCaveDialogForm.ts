import { useEffect, useState, type FormEvent } from "react";

import { capaciteFor, type Cave, type EtagereConfig } from "../../domain/cave";
import { buildCaveFromForm, defaultShelf, initialCaveForm, type CaveFormValues } from "./caveForm";

export function useCaveDialogForm(open: boolean, initial: Cave | null, onSave: (cave: Cave) => void) {
  const [values, setValues] = useState<CaveFormValues>(() => initialCaveForm(initial));

  useEffect(() => {
    if (open) setValues(initialCaveForm(initial));
  }, [open, initial]);

  const update = <K extends keyof CaveFormValues>(field: K, value: CaveFormValues[K]) => setValues((current) => ({ ...current, [field]: value }));
  const updateShelf = (index: number, patch: Partial<EtagereConfig>) => update("etageres", values.etageres.map((shelf, shelfIndex) => {
    if (shelfIndex !== index) return shelf;
    const structureChanged = patch.nbRangees !== undefined || patch.nbPositions !== undefined;
    return { ...shelf, ...patch, rangees: structureChanged ? undefined : shelf.rangees };
  }));
  const addShelf = () => update("etageres", [...values.etageres, { ...defaultShelf(), label: String(values.etageres.length + 1) }]);
  const removeShelf = (index: number) => {
    if (values.etageres.length <= 1) return;
    update("etageres", values.etageres.filter((_, shelfIndex) => shelfIndex !== index));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cave = buildCaveFromForm(values, initial);
    if (cave) onSave(cave);
  };
  const capacity = capaciteFor(values.etageres.map((shelf) => ({ ...shelf, nbRangees: Number(shelf.nbRangees) || 0, nbPositions: Number(shelf.nbPositions) || 0 })));

  return { values, update, updateShelf, addShelf, removeShelf, submit, capacity };
}
