export type AccessMode = "Propriétaire" | "Employé";

export interface LoginFormValues {
  accessMode: AccessMode | "";
  username: string;
  password: string;
}

export interface DemoAccount {
  label: string;
  accessMode: AccessMode;
  username: string;
  credential: string;
  credentialLabel: "Mot de passe" | "PIN";
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = import.meta.env.DEV ? [
  { label: "Propriétaire démo", accessMode: "Propriétaire", username: "gilles.demo", credential: "DemoFromagerie2026!", credentialLabel: "Mot de passe" },
  { label: "Fabrication démo", accessMode: "Employé", username: "jean.demo", credential: "1234", credentialLabel: "PIN" },
  { label: "Vente démo", accessMode: "Employé", username: "nathalie.demo", credential: "5678", credentialLabel: "PIN" },
] : [];

export const ACCESS_LEVELS = [
  { label: "Propriétaire", sublabel: "Mot de passe", value: "Propriétaire" as const },
  { label: "Employé", sublabel: "Code PIN", value: "Employé" as const },
];

export function validateCredential(value: string, values: LoginFormValues): true | string {
  if (!value) return values.accessMode === "Employé" ? "Code PIN requis" : "Mot de passe requis";
  if (values.accessMode === "Employé") return /^\d{4}$/.test(value) || "Le code PIN doit contenir exactement 4 chiffres";
  if (values.accessMode === "Propriétaire") return value.length >= 8 || "Le mot de passe doit contenir au moins 8 caractères";
  return true;
}
