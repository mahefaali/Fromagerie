import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";

type UserAccount = {
  id: string;
  name: string;
  role: string;
  status: string;
  credential?: string;
};

const initialAccounts: UserAccount[] = [
  { id: "1", name: "Jean Dupont", role: "Propriétaire", status: "Actif" },
  { id: "2", name: "Luc Martin", role: "Employé", status: "Actif" },
  { id: "3", name: "Sophie Bernard", role: "Employé", status: "Suspendu" },
];

function AccountRow({ account, onEdit, onRequestDelete }: { account: UserAccount; onEdit: (id: string) => void; onRequestDelete: (id: string) => void }) {
  return (
    <tr>
      <td className="px-4 py-4 font-mono text-sm text-foreground">{account.name}</td>
      <td className="px-4 py-4 font-mono text-sm text-foreground">{account.role}</td>
      <td className="px-4 py-4 font-mono text-sm text-foreground">{account.status}</td>
      <td className="px-4 py-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onEdit(account.id)}
          className="mr-2 inline-flex items-center justify-center rounded-sm border border-border bg-background p-2 text-foreground hover:bg-primary/5"
          aria-label="Éditer"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onRequestDelete(account.id)}
          className="inline-flex items-center justify-center rounded-sm border border-border bg-destructive/5 p-2 text-destructive hover:bg-destructive/10"
          aria-label="Supprimer"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

export default function UsersSection() {
  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "Employé", status: "Actif", credential: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const startAdd = () => {
    setEditingId(null);
    setForm({ name: "", role: "Employé", status: "Actif", credential: "" });
    setModalOpen(true);
  };

  const startEdit = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    setEditingId(id);
    setForm({ name: acc.name, role: acc.role, status: acc.status, credential: acc.credential ?? "" });
    setModalOpen(true);
  };

  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", role: "Employé", status: "Actif", credential:"" });
    }
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return setConfirmOpen(false);
    handleDelete(deleteTargetId);
    setDeleteTargetId(null);
    setConfirmOpen(false);
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
    setConfirmOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name.trim()) return alert("Le nom est requis");

    if (editingId) {
      setAccounts((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      setEditingId(null);
    } else {
      const id = String(Date.now());
      setAccounts((prev) => [{ id, ...form }, ...prev]);
    }

    setForm({ name: "", role: "Employé", status: "Actif", credential: "" });
    setModalOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-secondary">Comptes utilisateur</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Liste des utilisateurs</h2>
        </div>

        <div className="flex items-center gap-3">
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
                <SheetTitle>{editingId ? "Modifier un compte" : "Ajouter un compte"}</SheetTitle>
                <SheetDescription className="mt-1">Remplissez les informations du compte.</SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-xs text-secondary mb-1">Nom</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-secondary mb-1">Rôle</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm">
                    <option>Propriétaire</option>
                    <option>Employé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-secondary mb-1">{form.role === "Propriétaire" ? "Mot de passe" : "PIN"}</label>
                  <input
                    type={form.role === "Propriétaire" ? "password" : "text"}
                    value={form.credential}
                    onChange={(e) => setForm((f) => ({ ...f, credential: e.target.value }))}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                    placeholder={form.role === "Propriétaire" ? "Mot de passe" : "PIN"}
                  />
                </div>

                <div>
                  <label className="block text-xs text-secondary mb-1">Statut</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm">
                    <option>Actif</option>
                    <option>Suspendu</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => handleSubmit()} className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Enregistrer</button>
                  <button type="button" onClick={() => setModalOpen(false)} className="rounded-sm border border-border px-4 py-2 text-sm">Annuler</button>
                </div>
              </form>

              <SheetFooter />
            </SheetContent>
          </Sheet>
        </div>
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
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} onEdit={startEdit} onRequestDelete={requestDelete} />
            ))}
          </tbody>
        </table>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
          <div className="relative z-10 w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-black">Voulez-vous vraiment supprimer ce compte ? Cette action est irréversible.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={cancelDelete} className="rounded-sm border border-border px-4 py-2 text-sm">Annuler</button>
              <button onClick={confirmDelete} className="rounded-sm bg-destructive px-4 py-2 text-sm font-bold text-white">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
