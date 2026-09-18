import type { Saison, TypeOperationEnergie, TypeOperationMainOeuvre, UniteCalculEnergie } from "../../api/costsApi";

export const EMPTY_TARIF = { saison: "SECHE" as Saison, prixParLitre: "", dateDebutValidite: "", dateFinValidite: "", actif: true };
export const EMPTY_EMBALLAGE = { nom: "", coutUnitaire: "", unite: "", actif: true };
export const EMPTY_CONFIGURATION_EMBALLAGE = { fromageId: "", emballageId: "", quantiteParUnite: "" };
export const EMPTY_ENERGIE = { typeOperation: "CHAUFFE" as TypeOperationEnergie, coutStandard: "", uniteCalcul: "PAR_HEURE" as UniteCalculEnergie, dateDebutValidite: "", dateFinValidite: "", actif: true };
export const EMPTY_MAIN_OEUVRE = { typeOperation: "FABRICATION" as TypeOperationMainOeuvre, dureeStandardMinutes: "", coutHoraire: "", dateDebutValidite: "", dateFinValidite: "", actif: true };
export const EMPTY_EQUIPEMENT = { nom: "", description: "", actif: true };
export const EMPTY_AMORTISSEMENT = { equipementId: "", coutParFabrication: "", dateDebutValidite: "", dateFinValidite: "", actif: true };

export const MAIN_OEUVRE_LABELS: Record<TypeOperationMainOeuvre, string> = {
  FABRICATION: "Fabrication",
  RETOURNEMENT: "Retournement",
  LAVAGE: "Lavage",
  PREPARATION_VENTE: "Préparation vente",
};

export const isSaison = (value: string): value is Saison => value === "SECHE" || value === "HUMIDE";
export const isTypeOperationEnergie = (value: string): value is TypeOperationEnergie =>
  value === "CHAUFFE" || value === "AFFINAGE_CAVE" || value === "CHAMBRE_FROIDE";
export const isUniteCalculEnergie = (value: string): value is UniteCalculEnergie =>
  value === "PAR_HEURE" || value === "PAR_FROMAGE_PAR_JOUR" || value === "PAR_FABRICATION";
