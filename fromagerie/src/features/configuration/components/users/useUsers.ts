import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { userApi, type UserAccount } from "../../api/userApi";
import { emptyUserForm, formFromAccount, validateUserForm, type UserForm } from "./userForm";

export function useUsers() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserForm>({ ...emptyUserForm });
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const users = await userApi.findAll(showInactive);
      setAccounts(showInactive ? users.filter((user) => !user.actif) : users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement des utilisateurs impossible");
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => { void loadAccounts(); }, [loadAccounts]);

  const closeForm = () => {
    setFormOpen(false);
    setEditingAccount(null);
    setForm({ ...emptyUserForm });
  };

  const startAdd = () => {
    setEditingAccount(null);
    setForm({ ...emptyUserForm });
    setFormOpen(true);
  };

  const startEdit = (account: UserAccount) => {
    setEditingAccount(account);
    setForm(formFromAccount(account));
    setFormOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateUserForm(form, editingAccount !== null);
    if (validationError) { toast.error(validationError); return; }
    setSaving(true);
    try {
      if (editingAccount) {
        const updated = await userApi.update(editingAccount.id, { nom: form.nom, role: form.role, actif: form.actif, credential: form.credential || undefined });
        setAccounts((current) => current.map((account) => account.id === updated.id ? updated : account));
        toast.success("Utilisateur modifié");
      } else {
        const created = await userApi.create(form);
        setAccounts((current) => [...current, created].sort((a, b) => a.nom.localeCompare(b.nom)));
        toast.success("Utilisateur ajouté");
      }
      closeForm();
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
      setAccounts((current) => showInactive ? current.map((account) => account.id === deleteTarget.id ? { ...account, actif: false } : account) : current.filter((account) => account.id !== deleteTarget.id));
      toast.success("Utilisateur désactivé");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
    }
  };

  const reactivate = async (account: UserAccount) => {
    try {
      const updated = await userApi.reactivate(account.id);
      setAccounts((current) => showInactive ? current.filter((item) => item.id !== updated.id) : current.map((item) => item.id === updated.id ? updated : item));
      toast.success("Utilisateur réactivé");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Réactivation impossible");
    }
  };

  return { accounts, loading, saving, editingAccount, form, formOpen, deleteTarget, showInactive, setForm, setFormOpen, setDeleteTarget, setShowInactive, startAdd, startEdit, submit, confirmDelete, reactivate };
}
