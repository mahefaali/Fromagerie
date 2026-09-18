import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { LotLaitRequest, TypeTraite } from "../types";
import { localDateTimeNow, milkLotFieldClass } from "./milkLotFormStyles";

interface MilkLotCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: LotLaitRequest) => Promise<void>;
}

export function MilkLotCreateDialog({ open, onOpenChange, onCreate }: MilkLotCreateDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      await onCreate({
        numeroLot: String(form.get("numeroLot")),
        dateTraite: String(form.get("dateTraite")),
        typeTraite: String(form.get("typeTraite")) as TypeTraite,
        quantite: Number(form.get("quantite")),
        observations: String(form.get("observations") || "") || null,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-xl rounded-[28px] border border-[#d8d0bd] bg-[#fffdf8] p-5 shadow-2xl sm:rounded-[32px] sm:p-7">
      <DialogHeader><DialogTitle>Créer un lot de lait</DialogTitle><DialogDescription>Renseignez les informations de la traite et la quantité de lait collectée.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Numéro du lot" htmlFor="milk-lot-number"><Input id="milk-lot-number" required name="numeroLot" placeholder="Ex. LAIT-2026-001" autoFocus className={milkLotFieldClass} /></Field>
          <Field label="Date et heure de traite" htmlFor="milk-lot-date"><Input id="milk-lot-date" required name="dateTraite" type="datetime-local" defaultValue={localDateTimeNow()} className={milkLotFieldClass} /></Field>
          <Field label="Type de traite" htmlFor="milk-lot-type"><select id="milk-lot-type" name="typeTraite" className={`w-full min-w-0 ${milkLotFieldClass}`}><option value="MATIN">Traite du matin</option><option value="SOIR">Traite du soir</option></select></Field>
          <Field label="Quantité collectée (L)" htmlFor="milk-lot-quantity"><Input id="milk-lot-quantity" required name="quantite" type="number" min="0.01" step="0.01" placeholder="Ex. 250" className={milkLotFieldClass} /></Field>
        </div>
        <Field label="Observations" htmlFor="milk-lot-observations"><Input id="milk-lot-observations" name="observations" placeholder="Observations facultatives" className={milkLotFieldClass} /></Field>
        <DialogFooter className="gap-3 pt-2"><Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)} className="min-h-12 rounded-full border-2 border-[#9b8e75] px-6">Annuler</Button><Button disabled={submitting} className="min-h-12 rounded-full bg-[#28551c] px-6 shadow-md hover:bg-[#1f4316]">{submitting ? "Enregistrement…" : "Enregistrer le lot"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor} className="font-semibold text-[#514936]">{label}</Label>{children}</div>;
}
