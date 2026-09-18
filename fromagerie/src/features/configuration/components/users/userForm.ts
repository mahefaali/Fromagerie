import type { UserAccount } from "../../api/userApi";
import type { UserRole } from "../../../authentication/types/auth.types";

export interface UserForm {
  username: string;
  nom: string;
  role: UserRole;
  actif: boolean;
  credential: string;
}

export const emptyUserForm: UserForm = {
  username: "",
  nom: "",
  role: "FABRICATION",
  actif: true,
  credential: "",
};

export const roleLabels: Record<UserRole, string> = {
  PROPRIETAIRE: "Propriétaire",
  FABRICATION: "Fabrication",
  VENTE: "Vente",
};

export function formFromAccount(account: UserAccount): UserForm {
  return { username: account.username, nom: account.nom, role: account.role, actif: account.actif, credential: "" };
}

export function validateUserForm(form: UserForm, isEditing: boolean): string | null {
  if (!form.nom.trim() || (!isEditing && !form.username.trim())) return "Le nom et le username sont obligatoires";
  if (!isEditing && !form.credential.trim()) return "Le mot de passe ou PIN est obligatoire";
  return null;
}
