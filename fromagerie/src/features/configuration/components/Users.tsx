import React, { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import { userApi, type UserAccount } from "../api/userApi";
import type { UserRole } from "../../authentication/types/auth.types";

const roleLabels: Record<UserRole, string> = {
  PROPRIETAIRE: "Propriétaire",
  FABRICATION: "Fabrication",
  VENTE: "Vente",
};

const emptyForm = {
  username: "",
  nom: "",
  role: "FABRICATION" as UserRole,
  actif: true,
  credential: "",
};

type UserForm = typeof emptyForm;

function AccountRow({
  account,
  onEdit,
  onRequestDelete,
  onReactivate,
}: {
  account: UserAccount;
  onEdit: (account: UserAccount) => void;
  onRequestDelete: (account: UserAccount) => void;
  onReactivate: (account: UserAccount) => void;
}) {
  return (
    <tr>
      <td className="px-4 py-4 font-mono text-sm text-foreground">{account.nom}</td>
      <td className="px-4 py-4 font-mono text-sm text-foreground">{roleLabels[account.role]}</td>
      <td className="px-4 py-4 font-mono text-sm text-foreground">{account.actif ? "Actif" : "Suspendu"}</td>
      <td className="px-4 py-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onEdit(account)}
          className="mr-2 inline-flex items-center justify-center rounded-sm border border-border bg-background p-2 text-foreground hover:bg-primary/5"
          aria-label={`Éditer ${account.nom}`}
        >
          <Pencil className="size-4" />
        </button>
        {account.role !== "PROPRIETAIRE" && (account.actif ? (
          <button
            type="button"
            onClick={() => onRequestDelete(account)}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-destructive/5 p-2 text-destructive hover:bg-destructive/10"
            aria-label={`Désactiver ${account.nom}`}
          >
            <Trash2 className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onReactivate(account)}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-primary/5 p-2 text-primary hover:bg-primary/10"
            aria-label={`Réactiver ${account.nom}`}
          >
            <RotateCcw className="size-4" />
          </button>
        ))}
      </td>
    </tr>
  );
}

export default function UsersSection() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const users = await userApi.findAll(showInactive);
      setAccounts(showInactive ? users.filter((user) => !user.actif) : users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement des utilisateurs impossible");
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const startAdd = () => {
    setEditingAccount(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const startEdit = (account: UserAccount) => {
    setEditingAccount(account);
    setForm({
      username: account.username,
      nom: account.nom,
      role: account.role,
      actif: account.actif,
      credential: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nom.trim() || (!editingAccount && !form.username.trim())) {
      toast.error("Le nom et le username sont obligatoires");
      return;
    }
    if (!editingAccount && !form.credential.trim()) {
      toast.error("Le mot de passe ou PIN est obligatoire");
      return;
    }

    setSaving(true);
    try {
      if (editingAccount) {
        const updated = await userApi.update(editingAccount.id, {
          nom: form.nom,
          role: form.role,
          actif: form.actif,
          credential: form.credential || undefined,
        });
        setAccounts((current) => current.map((account) => account.id === updated.id ? updated : account));
        toast.success("Utilisateur modifié");
      } else {
        const created = await userApi.create({
          username: form.username,
          nom: form.nom,
          credential: form.credential,
          role: form.role,
          actif: form.actif,
        });
        setAccounts((current) => [...current, created].sort((a, b) => a.nom.localeCompare(b.nom)));
        toast.success("Utilisateur ajouté");
      }
      setModalOpen(false);
      setEditingAccount(null);
      setForm({ ...emptyForm });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userApi.deactivate(deleteTarget.id);
      setAccounts((current) => showInactive
        ? current.map((account) => account.id === deleteTarget.id ? { ...account, actif: false } : account)
        : current.filter((account) => account.id !== deleteTarget.id));
      toast.success("Utilisateur désactivé");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
    }
  };

  const reactivate = async (account: UserAccount) => {
    try {
      const updated = await userApi.reactivate(account.id);
      setAccounts((current) => showInactive
        ? current.filter((item) => item.id !== updated.id)
        : current.map((item) => item.id === updated.id ? updated : item));
      toast.success("Utilisateur réactivé");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Réactivation impossible");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-secondary">Comptes utilisateur</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Liste des utilisateurs</h2>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
            className="size-4 accent-primary"
          />
          Afficher uniquement les désactivés
        </label>

        <Sheet open={modalOpen} onOpenChange={setModalOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-3 text-sm font-bold uppercase tracking-[0.06em] text-primary-foreground transition hover:bg-primary/90"
              aria-label="Ajouter un compte"
            >
              <Plus className="size-4" />
            </button>
          </SheetTrigger>

          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{editingAccount ? "Modifier un compte" : "Ajouter un compte"}</SheetTitle>
              <SheetDescription className="mt-1">Remplissez les informations du compte.</SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              <div>
                <label htmlFor="user-username" className="mb-1 block text-xs text-secondary">Username</label>
                <input
                  id="user-username"
                  value={form.username}
                  disabled={Boolean(editingAccount)}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="user-name" className="mb-1 block text-xs text-secondary">Nom</label>
                <input
                  id="user-name"
                  value={form.nom}
                  onChange={(event) => setForm((current) => ({ ...current, nom: event.target.value }))}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="user-role" className="mb-1 block text-xs text-secondary">Rôle</label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="PROPRIETAIRE">Propriétaire</option>
                  <option value="FABRICATION">Fabrication</option>
                  <option value="VENTE">Vente</option>
                </select>
              </div>

              <div>
                <label htmlFor="user-credential" className="mb-1 block text-xs text-secondary">
                  {form.role === "PROPRIETAIRE" ? "Mot de passe" : "PIN (4 chiffres)"}
                </label>
                <input
                  id="user-credential"
                  type={form.role === "PROPRIETAIRE" ? "password" : "text"}
                  value={form.credential}
                  onChange={(event) => setForm((current) => ({ ...current, credential: event.target.value }))}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  placeholder={editingAccount ? "Laisser vide pour conserver" : undefined}
                  inputMode={form.role === "PROPRIETAIRE" ? undefined : "numeric"}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label htmlFor="user-status" className="mb-1 block text-xs text-secondary">Statut</label>
                <select
                  id="user-status"
                  value={form.actif ? "ACTIF" : "SUSPENDU"}
                  onChange={(event) => setForm((current) => ({ ...current, actif: event.target.value === "ACTIF" }))}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="ACTIF">Actif</option>
                  <option value="SUSPENDU">Suspendu</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-sm border border-border px-4 py-2 text-sm">Annuler</button>
              </div>
            </form>

            <SheetFooter />
          </SheetContent>
        </Sheet>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="border-b border-border px-4 py-4 font-mono text-xs uppercase tracking-[0.22em] text-secondary">Nom</th>
              <th className="border-b border-border px-4 py-4 font-mono text-xs uppercase tracking-[0.22em] text-secondary">Rôle</th>
              <th className="border-b border-border px-4 py-4 font-mono text-xs uppercase tracking-[0.22em] text-secondary">Statut</th>
              <th className="border-b border-border px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-sm text-muted-foreground">Chargement des utilisateurs...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-sm text-muted-foreground">Aucun utilisateur trouvé.</td></tr>
            ) : accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onEdit={startEdit}
                onRequestDelete={setDeleteTarget}
                onReactivate={reactivate}
              />
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">Confirmer la désactivation</h3>
            <p className="mt-2 text-sm text-black">Voulez-vous vraiment désactiver le compte de {deleteTarget.nom} ? Ses historiques seront conservés.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-sm border border-border px-4 py-2 text-sm">Annuler</button>
              <button type="button" onClick={() => void confirmDelete()} className="rounded-sm bg-destructive px-4 py-2 text-sm font-bold text-white">Désactiver</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
