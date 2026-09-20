import { FlaskConical } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { LotLait } from "../types";

interface MilkLotCardProps { lot: LotLait; canAddAnalysis: boolean; onAddAnalysis: (lotId: number) => void }

export function MilkLotCard({ lot, canAddAnalysis, onAddAnalysis }: MilkLotCardProps) {
  return <article className="min-w-0 rounded-2xl border border-[#d8d0bd] bg-[#f3eee2] p-4 shadow-sm sm:rounded-[20px] sm:p-6">
    <div className="flex min-w-0 flex-col items-start gap-3 min-[480px]:flex-row min-[480px]:justify-between">
      <div className="min-w-0"><p className="text-xs uppercase text-[#756a57]">Traite du {lot.typeTraite.toLowerCase()}</p><h2 className="mt-1 break-all font-mono text-lg font-bold sm:text-xl">{lot.numeroLot}</h2></div>
      <span className="shrink-0 whitespace-nowrap rounded-full bg-[#dfe5cb] px-3 py-1 text-sm font-semibold text-[#28551c]">{lot.quantiteDisponible} L disponibles</span>
    </div>
    <p className="mt-4 break-words text-sm sm:text-base">{new Date(lot.dateTraite).toLocaleString("fr-FR")} · {lot.quantite} L collectés · {lot.coutUnitaire == null ? "Coût historique non déterminé" : `${lot.coutUnitaire.toFixed(4)} €/L`}</p>
    <div className="mt-4 min-w-0 border-t border-[#d8d0bd] pt-4"><p className="mb-2 font-semibold">{lot.analyses.length} analyse(s)</p>{lot.analyses.map((analysis) => <p key={analysis.id} className="break-words text-sm">{analysis.typeAnalyse} — <b>{analysis.resultat} {analysis.unite}</b></p>)}{canAddAnalysis && <Button variant="outline" size="sm" className="mt-3 min-h-11 w-full rounded-full min-[480px]:w-auto" onClick={() => onAddAnalysis(lot.id)}><FlaskConical />Ajouter une analyse</Button>}</div>
  </article>;
}
