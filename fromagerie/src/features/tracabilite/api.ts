import { apiRequest } from "../../services/http/apiClient";
import type { AnalyseLait, AnalyseLaitRequest, CommandeTracabilite, LotLait, LotLaitRequest, Tracabilite } from "./types";
export const tracabiliteApi={
 rechercherCommande:(numeroCommande:string)=>apiRequest<CommandeTracabilite>(`/api/tracabilite/ascendante/commande?numeroCommande=${encodeURIComponent(numeroCommande)}`),
 retracerLivraison:(ligneId:number)=>apiRequest<Tracabilite>(`/api/tracabilite/ascendante/livraison/${ligneId}`),
 lots:()=>apiRequest<LotLait[]>("/api/lots-lait"),
 creerLot:(body:LotLaitRequest)=>apiRequest<LotLait>("/api/lots-lait",{method:"POST",json:body}),
 modifierLot:(id:number,body:LotLaitRequest)=>apiRequest<LotLait>(`/api/lots-lait/${id}`,{method:"PUT",json:body}),
 ajouterAnalyse:(id:number,body:AnalyseLaitRequest)=>apiRequest<AnalyseLait>(`/api/lots-lait/${id}/analyses`,{method:"POST",json:body}),
};
