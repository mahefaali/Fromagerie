export type TypeTraite = "MATIN" | "SOIR";
export interface AnalyseLait { id:number; dateAnalyse:string; typeAnalyse:string; resultat:string; unite:string|null; observation:string|null }
export interface LotLait { id:number; numeroLot:string; dateTraite:string; typeTraite:TypeTraite; quantite:number; quantiteDisponible:number; coutUnitaire:number|null; observations:string|null; analyses:AnalyseLait[] }
export interface LotLaitRequest { numeroLot:string; dateTraite:string; typeTraite:TypeTraite; quantite:number; coutUnitaire:number; observations:string|null }
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
export interface TracabiliteDescendante {
 fabricationId:number; numeroLot:string; fromage:string; dateFabrication:string;
 quantiteProduite:number; quantiteLivree:number; quantiteNonVendue:number; quantiteDisponible:number; quantitePerdue:number;
 clientsLivres:{clientId:number;client:string;quantiteLivree:number}[];
 pertes:{id:number;quantite:number;type:string;motif:string;date:string}[];
 localisationsActuelles:{nature:"AFFINAGE"|"STOCK_FINI"|"DERNIERE_DESTINATION_CONNUE";libelle:string;quantite:number;numeroLivraison:string|null;dateLivraison:string|null}[];
}
export interface DocumentOption { id:number; numeroLot:string; libelle:string }
