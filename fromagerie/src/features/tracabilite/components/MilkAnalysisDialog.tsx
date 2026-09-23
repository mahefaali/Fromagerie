import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { AnalyseLaitRequest } from "../types";
import { localDateTimeNow, milkLotFieldClass } from "./milkLotFormStyles";

interface MilkAnalysisDialogProps { lotId: number | null; onClose: () => void; onCreate: (lotId: number, request: AnalyseLaitRequest) => Promise<void> }

export function MilkAnalysisDialog({ lotId, onClose, onCreate }: MilkAnalysisDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lotId === null) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      await onCreate(lotId, { dateAnalyse: String(form.get("dateAnalyse")), typeAnalyse: String(form.get("typeAnalyse")), resultat: String(form.get("resultat")), unite: String(form.get("unite") || "") || null, observation: null });
      onClose();
    } finally { setSubmitting(false); }
  }
  return <Dialog open={lotId !== null} onOpenChange={(open) => !open && !submitting && onClose()}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Nouvelle analyse</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="analysis-date">Date de l’analyse</Label><Input id="analysis-date" required name="dateAnalyse" type="datetime-local" defaultValue={localDateTimeNow()} className={milkLotFieldClass} /></div>
    <div className="space-y-2"><Label htmlFor="analysis-type">Type d’analyse</Label><Input id="analysis-type" required name="typeAnalyse" className={milkLotFieldClass} /></div>
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_130px]"><div className="space-y-2"><Label htmlFor="analysis-result">Résultat</Label><Input id="analysis-result" required name="resultat" className={milkLotFieldClass} /></div><div className="space-y-2"><Label htmlFor="analysis-unit">Unité (facultative)</Label><Input id="analysis-unit" name="unite" className={milkLotFieldClass} /></div></div>
    <DialogFooter className="gap-3"><Button type="button" variant="outline" disabled={submitting} className="min-h-11 rounded-full" onClick={onClose}>Annuler</Button><Button disabled={submitting} className="min-h-11 rounded-full bg-[#28551c]">{submitting ? "Enregistrement…" : "Enregistrer"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
