import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../../../../components/ui/sheet";
import type { UserAccount } from "../../api/userApi";
import type { UserRole } from "../../../authentication/types/auth.types";
import type { UserForm } from "./userForm";

interface UserAccountSheetProps {
  open: boolean;
  account: UserAccount | null;
  form: UserForm;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: Dispatch<SetStateAction<UserForm>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function UserAccountSheet(props: UserAccountSheetProps) {
  const { open, account, form, saving, onOpenChange, onFormChange, onSubmit } = props;
  const update = <K extends keyof UserForm>(field: K, value: UserForm[K]) => {
    onFormChange((current) => ({ ...current, [field]: value }));
  };

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right">
    <SheetHeader><SheetTitle>{account ? "Modifier un compte" : "Ajouter un compte"}</SheetTitle><SheetDescription className="mt-1">Remplissez les informations du compte.</SheetDescription></SheetHeader>
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <Field label="Username" htmlFor="user-username"><input id="user-username" value={form.username} disabled={Boolean(account)} onChange={(event) => update("username", event.target.value)} className={inputClass} autoComplete="username" /></Field>
      <Field label="Nom" htmlFor="user-name"><input id="user-name" value={form.nom} onChange={(event) => update("nom", event.target.value)} className={inputClass} /></Field>
      <Field label="Rôle" htmlFor="user-role"><select id="user-role" value={form.role} onChange={(event) => update("role", event.target.value as UserRole)} className={inputClass}>
        <option value="PROPRIETAIRE">Propriétaire</option><option value="FABRICATION">Fabrication</option><option value="VENTE">Vente</option>
      </select></Field>
      <Field label={form.role === "PROPRIETAIRE" ? "Mot de passe" : "PIN (4 chiffres)"} htmlFor="user-credential"><input id="user-credential" type={form.role === "PROPRIETAIRE" ? "password" : "text"} value={form.credential} onChange={(event) => update("credential", event.target.value)} className={inputClass} placeholder={account ? "Laisser vide pour conserver" : undefined} inputMode={form.role === "PROPRIETAIRE" ? undefined : "numeric"} autoComplete="new-password" /></Field>
      <Field label="Statut" htmlFor="user-status"><select id="user-status" value={form.actif ? "ACTIF" : "SUSPENDU"} onChange={(event) => update("actif", event.target.value === "ACTIF")} className={inputClass}>
        <option value="ACTIF">Actif</option><option value="SUSPENDU">Suspendu</option>
      </select></Field>
      <div className="flex gap-2"><button type="submit" disabled={saving} className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">{saving ? "Enregistrement..." : "Enregistrer"}</button>
        <button type="button" onClick={() => onOpenChange(false)} className="rounded-sm border border-border px-4 py-2 text-sm">Annuler</button></div>
    </form><SheetFooter />
  </SheetContent></Sheet>;
}

const inputClass = "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm disabled:opacity-60";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-1 block text-xs text-secondary">{label}</label>{children}</div>;
}
