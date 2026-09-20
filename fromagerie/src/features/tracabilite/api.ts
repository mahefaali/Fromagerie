import { apiBlobRequest, apiRequest } from "../../services/http/apiClient";
import type { AnalyseLait, AnalyseLaitRequest, CommandeTracabilite, DocumentOption, LotLait, LotLaitRequest, Tracabilite, TracabiliteDescendante } from "./types";
import type { FabricationListItem } from "../fabrications/types/fabrication.types";
import type { AffinageListItem } from "../affinage/types/affinage.types";
export const tracabiliteApi={
 rechercherCommande:(numeroCommande:string)=>apiRequest<CommandeTracabilite>(`/api/tracabilite/ascendante/commande?numeroCommande=${encodeURIComponent(numeroCommande)}`),
 retracerLivraison:(ligneId:number)=>apiRequest<Tracabilite>(`/api/tracabilite/ascendante/livraison/${ligneId}`),
 rechercherLot:(numeroLot:string)=>apiRequest<TracabiliteDescendante>(`/api/tracabilite/descendante/${encodeURIComponent(numeroLot)}`),
 lots:()=>apiRequest<LotLait[]>("/api/lots-lait"),
 creerLot:(body:LotLaitRequest)=>apiRequest<LotLait>("/api/lots-lait",{method:"POST",json:body}),
 modifierLot:(id:number,body:LotLaitRequest)=>apiRequest<LotLait>(`/api/lots-lait/${id}`,{method:"PUT",json:body}),
 ajouterAnalyse:(id:number,body:AnalyseLaitRequest)=>apiRequest<AnalyseLait>(`/api/lots-lait/${id}/analyses`,{method:"POST",json:body}),
 optionsFabrications:async():Promise<DocumentOption[]>=>(await apiRequest<FabricationListItem[]>("/api/fabrications")).map(x=>({id:x.id,numeroLot:x.numeroLot,libelle:`${x.numeroLot} · ${x.fromageNom}`})),
 optionsAffinages:async():Promise<DocumentOption[]>=>(await apiRequest<AffinageListItem[]>("/api/affinages")).map(x=>({id:x.id,numeroLot:x.numeroLot,libelle:`${x.numeroLot} · ${x.fromageNom}`})),
 optionsLotsLait:async():Promise<DocumentOption[]>=>(await apiRequest<LotLait[]>("/api/lots-lait")).map(x=>({id:x.id,numeroLot:x.numeroLot,libelle:`${x.numeroLot} · ${x.typeTraite.toLowerCase()}`})),
 registrePdf:(debut:string,fin:string)=>apiBlobRequest(`/api/documents/registre-tracabilite?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`),
 fabricationPdf:(id:number)=>apiBlobRequest(`/api/documents/fabrications/${id}`),
 affinagePdf:(id:number)=>apiBlobRequest(`/api/documents/affinages/${id}`),
 analysesLaitPdf:(id:number)=>apiBlobRequest(`/api/documents/lots-lait/${id}/analyses`),
};
