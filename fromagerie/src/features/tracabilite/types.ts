export type TypeTraite = "MATIN" | "SOIR";
export interface AnalyseLait { id:number; dateAnalyse:string; typeAnalyse:string; resultat:string; unite:string|null; observation:string|null }
export interface LotLait { id:number; numeroLot:string; dateTraite:string; typeTraite:TypeTraite; quantite:number; quantiteDisponible:number; observations:string|null; analyses:AnalyseLait[] }
export interface LotLaitRequest { numeroLot:string; dateTraite:string; typeTraite:TypeTraite; quantite:number; observations:string|null }
export interface AnalyseLaitRequest { dateAnalyse:string; typeAnalyse:string; resultat:string; unite:string|null; observation:string|null }
export interface CommandeTracabilite {
 commandeId:number; numeroCommande:string; client:string; dateCommande:string;
 produitsLivres:{ligneLivraisonId:number;numeroLivraison:string|null;dateLivraison:string;fromage:string;quantiteLivree:number;numeroLotFabrication:string}[];
}
export interface Tracabilite {
 fabrication:{id:number;numeroLot:string;dateFabrication:string;fromage:string;recette:string;quantiteLait:number;temperatureLait:number;origineHistorique:"TRAITE_MATIN"|"TRAITE_SOIR"|"MELANGE";operateurId:number|null;operateurNom:string};
 affinage:{id:number;dateMiseEnCave:string;dateSortiePrevue:string;statut:string}|null;
 stock:{id:number;dateEntree:string;quantiteInitiale:number;statut:string}|null;
 ventes:{ligneLivraisonId:number;numeroLivraison:string|null;dateLivraison:string;client:string;quantiteLivree:number}[];
 lotsLait:{id:number;numeroLot:string;dateTraite:string;typeTraite:TypeTraite;quantiteUtilisee:number;analyses:AnalyseLait[]}[];
 laitDetailleDisponible:boolean;
}
