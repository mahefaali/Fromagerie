import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
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
  return <Dialog open={lotId !== null} onOpenChange={(open) => !open && !submitting && onClose()}><DialogContent className="w-[calc(100%-2rem)] max-w-xl rounded-[28px] bg-[#fffdf8]"><DialogHeader><DialogTitle>Nouvelle analyse</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-4"><Input required name="dateAnalyse" type="datetime-local" defaultValue={localDateTimeNow()} className={milkLotFieldClass} /><Input required name="typeAnalyse" placeholder="Type d’analyse" className={milkLotFieldClass} /><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_130px]"><Input required name="resultat" placeholder="Résultat" className={milkLotFieldClass} /><Input name="unite" placeholder="Unité" className={milkLotFieldClass} /></div><DialogFooter className="gap-3"><Button type="button" variant="outline" disabled={submitting} className="min-h-11 rounded-full" onClick={onClose}>Annuler</Button><Button disabled={submitting} className="min-h-11 rounded-full bg-[#28551c]">{submitting ? "Enregistrement…" : "Enregistrer"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
