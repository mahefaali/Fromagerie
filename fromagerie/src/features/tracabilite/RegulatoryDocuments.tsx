import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { tracabiliteApi } from "./api";
import type { DocumentOption } from "./types";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function DocumentSelect({ label, options, value, onChange }: { label:string; options:DocumentOption[]; value:string; onChange:(value:string)=>void }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<select value={value} onChange={event=>onChange(event.target.value)} className="h-12 rounded-xl border border-[#c8bea6] bg-transparent px-3 font-normal">
    <option value="">Sélectionner…</option>{options.map(option=><option key={option.id} value={option.id}>{option.libelle}</option>)}
  </select></label>;
}

export default function RegulatoryDocuments() {
  const today = new Date().toISOString().slice(0,10);
  const [debut,setDebut]=useState(today.slice(0,8)+"01"); const [fin,setFin]=useState(today);
  const [fabrications,setFabrications]=useState<DocumentOption[]>([]); const [affinages,setAffinages]=useState<DocumentOption[]>([]); const [lotsLait,setLotsLait]=useState<DocumentOption[]>([]);
  const [fabricationId,setFabricationId]=useState(""); const [affinageId,setAffinageId]=useState(""); const [lotLaitId,setLotLaitId]=useState(""); const [loading,setLoading]=useState(false);
  useEffect(()=>{Promise.all([tracabiliteApi.optionsFabrications(),tracabiliteApi.optionsAffinages(),tracabiliteApi.optionsLotsLait()]).then(([f,a,l])=>{setFabrications(f);setAffinages(a);setLotsLait(l)}).catch(error=>toast.error(error instanceof Error?error.message:"Chargement impossible"))},[]);
  async function exportPdf(request:()=>Promise<Blob>,filename:string){setLoading(true);try{download(await request(),filename);toast.success("PDF généré")}catch(error){toast.error(error instanceof Error?error.message:"Génération impossible")}finally{setLoading(false)}}
  return <section className="space-y-5">
    <div className="rounded-2xl border border-[#d8d0bd] bg-[#f3eee2] p-5"><h2 className="flex items-center gap-2 text-xl font-semibold"><FileText/>Registre de traçabilité</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="grid gap-2 text-sm font-semibold">Date début<Input type="date" value={debut} onChange={e=>setDebut(e.target.value)}/></label><label className="grid gap-2 text-sm font-semibold">Date fin<Input type="date" value={fin} onChange={e=>setFin(e.target.value)}/></label><Button disabled={loading||!debut||!fin} className="self-end bg-[#28551c]" onClick={()=>void exportPdf(()=>tracabiliteApi.registrePdf(debut,fin),`registre-tracabilite-${debut}-${fin}.pdf`)}><Download/>Exporter le registre</Button></div></div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-5"><h3 className="mb-4 text-lg font-semibold">Fiche de fabrication</h3><DocumentSelect label="Fabrication" options={fabrications} value={fabricationId} onChange={setFabricationId}/><Button disabled={loading||!fabricationId} className="mt-4 w-full bg-[#28551c]" onClick={()=>void exportPdf(()=>tracabiliteApi.fabricationPdf(Number(fabricationId)),`fabrication-${fabrications.find(x=>x.id===Number(fabricationId))?.numeroLot??fabricationId}.pdf`)}><Download/>Exporter</Button></div>
      <div className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-5"><h3 className="mb-4 text-lg font-semibold">Fiche d’affinage</h3><DocumentSelect label="Lot d’affinage" options={affinages} value={affinageId} onChange={setAffinageId}/><Button disabled={loading||!affinageId} className="mt-4 w-full bg-[#28551c]" onClick={()=>void exportPdf(()=>tracabiliteApi.affinagePdf(Number(affinageId)),`affinage-${affinages.find(x=>x.id===Number(affinageId))?.numeroLot??affinageId}.pdf`)}><Download/>Exporter</Button></div>
      <div className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-5"><h3 className="mb-4 text-lg font-semibold">Analyses de lait</h3><DocumentSelect label="Lot de lait" options={lotsLait} value={lotLaitId} onChange={setLotLaitId}/><Button disabled={loading||!lotLaitId} className="mt-4 w-full bg-[#28551c]" onClick={()=>void exportPdf(()=>tracabiliteApi.analysesLaitPdf(Number(lotLaitId)),`analyses-lait-${lotsLait.find(x=>x.id===Number(lotLaitId))?.numeroLot??lotLaitId}.pdf`)}><Download/>Exporter</Button></div>
    </div>
  </section>;
}
