import type { ReactNode } from "react";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { UserAccount } from "../../api/userApi";
import { roleLabels } from "./userForm";

interface UsersTableProps {
  accounts: UserAccount[];
  loading: boolean;
  onEdit: (account: UserAccount) => void;
  onRequestDelete: (account: UserAccount) => void;
  onReactivate: (account: UserAccount) => void;
}

export function UsersTable(props: UsersTableProps) {
  return <div className="overflow-x-auto"><table className="min-w-full border-separate border-spacing-0 text-left">
    <thead><tr>
      {["Nom", "Rôle", "Statut"].map((label) => <th key={label} className="border-b border-border px-4 py-4 font-mono text-xs uppercase tracking-[0.22em] text-secondary">{label}</th>)}
      <th className="border-b border-border px-4 py-4"><span className="sr-only">Actions</span></th>
    </tr></thead>
    <tbody>{props.loading ? <MessageRow>Chargement des utilisateurs...</MessageRow> : props.accounts.length === 0 ? <MessageRow>Aucun utilisateur trouvé.</MessageRow> : props.accounts.map((account) => <AccountRow key={account.id} account={account} onEdit={props.onEdit} onRequestDelete={props.onRequestDelete} onReactivate={props.onReactivate} />)}</tbody>
  </table></div>;
}

function MessageRow({ children }: { children: string }) {
  return <tr><td colSpan={4} className="px-4 py-8 text-sm text-muted-foreground">{children}</td></tr>;
}

function AccountRow({ account, onEdit, onRequestDelete, onReactivate }: Omit<UsersTableProps, "accounts" | "loading"> & { account: UserAccount }) {
  return <tr>
    <td className="px-4 py-4 font-mono text-sm text-foreground">{account.nom}</td>
    <td className="px-4 py-4 font-mono text-sm text-foreground">{roleLabels[account.role]}</td>
    <td className="px-4 py-4 font-mono text-sm text-foreground">{account.actif ? "Actif" : "Suspendu"}</td>
    <td className="whitespace-nowrap px-4 py-4 text-right">
      <ActionButton label={`Éditer ${account.nom}`} onClick={() => onEdit(account)}><Pencil className="size-4" /></ActionButton>
      {account.role !== "PROPRIETAIRE" && (account.actif
        ? <ActionButton label={`Désactiver ${account.nom}`} destructive onClick={() => onRequestDelete(account)}><Trash2 className="size-4" /></ActionButton>
        : <ActionButton label={`Réactiver ${account.nom}`} onClick={() => onReactivate(account)}><RotateCcw className="size-4" /></ActionButton>)}
    </td>
  </tr>;
}

function ActionButton({ label, destructive = false, onClick, children }: { label: string; destructive?: boolean; onClick: () => void; children: ReactNode }) {
  const tone = destructive ? "bg-destructive/5 text-destructive hover:bg-destructive/10" : "bg-background text-foreground hover:bg-primary/5";
  return <button type="button" onClick={onClick} className={`ml-2 inline-flex items-center justify-center rounded-sm border border-border p-2 ${tone}`} aria-label={label}>{children}</button>;
}
