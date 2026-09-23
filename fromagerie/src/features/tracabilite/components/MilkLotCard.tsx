import { FlaskConical } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { LotLait } from "../types";

interface MilkLotCardProps { lot: LotLait; canAddAnalysis: boolean; onAddAnalysis: (lotId: number) => void }

export function MilkLotCard({ lot, canAddAnalysis, onAddAnalysis }: MilkLotCardProps) {
  return <article className="flex min-w-0 flex-col rounded-xl border border-[#d8d0bd] bg-[#f3eee2] p-3 shadow-sm">
    <div className="flex min-w-0 flex-col items-start gap-2 min-[480px]:flex-row min-[480px]:justify-between">
      <div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-[#756a57]">Traite du {lot.typeTraite.toLowerCase()}</p><h2 className="mt-0.5 break-all font-mono text-base font-bold sm:text-lg">{lot.numeroLot}</h2></div>
      {lot.quantiteDisponible <= 0 ? <span className="shrink-0 whitespace-nowrap rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Épuisé</span> : <span className="shrink-0 whitespace-nowrap rounded-full bg-[#dfe5cb] px-2.5 py-1 text-xs font-semibold text-[#28551c]">{lot.quantiteDisponible} L disponibles</span>}
    </div>
    <p className="mt-2.5 break-words text-xs leading-5 text-[#4f493f]">{new Date(lot.dateTraite).toLocaleString("fr-FR")} · {lot.quantite} L collectés · {lot.coutUnitaire == null ? "Coût historique non déterminé" : `${lot.coutUnitaire.toFixed(4)} €/L`}</p>
    <div className="mt-2.5 flex min-w-0 flex-1 flex-col border-t border-[#d8d0bd] pt-2.5"><p className="mb-1.5 text-sm font-semibold">{lot.analyses.length} analyse(s)</p>{lot.analyses.map((analysis) => <p key={analysis.id} className="break-words text-xs leading-5">{analysis.typeAnalyse} — <b>{analysis.resultat} {analysis.unite}</b></p>)}{canAddAnalysis && <Button variant="outline" size="sm" className="mt-auto min-h-9 w-full rounded-full px-3 text-xs" onClick={() => onAddAnalysis(lot.id)}><FlaskConical />Ajouter une analyse</Button>}</div>
  </article>;
}
