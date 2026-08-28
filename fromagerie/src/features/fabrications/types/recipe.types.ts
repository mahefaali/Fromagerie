export type UniteMesure = "L" | "ML" | "KG" | "G" | "UNITE";

export interface RecetteListItem {
  id: number;
  nom: string;
  varianteKey: string;
  fromageId: number;
  fromageNom: string;
  version: number;
  active: boolean;
  coutMatiereEstime: number;
}

export interface RecetteIngredient {
  id: number;
  matierePremiereId: number;
  matierePremiereNom: string;
  quantite: number;
  unite: UniteMesure;
  coutUnitaireReference: number;
  coutEstime: number;
}

export interface RecetteDetail {
  id: number;
  nom: string;
  varianteKey: string;
  version: number;
  active: boolean;
  dateCreation: string;
  fromageId: number;
  fromageNom: string;
  coutMatiereEstime: number;
  frequenceRetournementJours?: number | null;
  ingredients: RecetteIngredient[];
}

export interface RecetteHistoryItem {
  id: number;
  version: number;
  nom: string;
  dateCreation: string;
  active: boolean;
  coutMatiereEstime: number;
}

export interface RecetteIngredientRequest {
  matierePremiereId: number;
  quantite: number;
  unite: UniteMesure;
}

export interface CreateRecetteRequest {
  nom: string;
  fromageId: number;
  recetteDeBase: boolean;
  frequenceRetournementJours?: number | null;
  ingredients: RecetteIngredientRequest[];
}

export interface CreateRecetteVersionRequest {
  nom: string;
  frequenceRetournementJours?: number | null;
  ingredients: RecetteIngredientRequest[];
}

export interface MatierePremiere {
  id: number;
  nom: string;
  uniteReference: UniteMesure;
  coutUnitaire: number;
  actif: boolean;
}

export interface FromageOption {
  id: number;
  nom: string;
  description: string | null;
}

export interface CreateFromageRequest {
  nom: string;
  description: string;
}

export interface CreateMatierePremiereRequest {
  nom: string;
  uniteReference: UniteMesure;
  coutUnitaire: number;
  actif: boolean;
}

export interface RecetteFilters {
  fromageId?: number;
  active?: boolean;
  nom?: string;
}
