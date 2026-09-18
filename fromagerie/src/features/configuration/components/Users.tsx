import { Plus } from "lucide-react";

import { DeactivateUserDialog } from "./users/DeactivateUserDialog";
import { UserAccountSheet } from "./users/UserAccountSheet";
import { UsersTable } from "./users/UsersTable";
import { useUsers } from "./users/useUsers";

export default function UsersSection() {
  const users = useUsers();

  return <>
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-secondary">Comptes utilisateur</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Liste des utilisateurs</h2>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={users.showInactive} onChange={(event) => users.setShowInactive(event.target.checked)} className="size-4 accent-primary" />
        Afficher uniquement les désactivés
      </label>
      <button type="button" onClick={users.startAdd} className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-3 text-sm font-bold uppercase tracking-[0.06em] text-primary-foreground transition hover:bg-primary/90" aria-label="Ajouter un compte">
        <Plus className="size-4" />
      </button>
    </div>
    <UsersTable accounts={users.accounts} loading={users.loading} onEdit={users.startEdit} onRequestDelete={users.setDeleteTarget} onReactivate={users.reactivate} />
    <UserAccountSheet open={users.formOpen} account={users.editingAccount} form={users.form} saving={users.saving} onOpenChange={users.setFormOpen} onFormChange={users.setForm} onSubmit={users.submit} />
    <DeactivateUserDialog account={users.deleteTarget} onCancel={() => users.setDeleteTarget(null)} onConfirm={users.confirmDelete} />
  </>;
}
