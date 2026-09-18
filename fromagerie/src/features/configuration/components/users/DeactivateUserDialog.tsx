import type { UserAccount } from "../../api/userApi";

export function DeactivateUserDialog({ account, onCancel, onConfirm }: { account: UserAccount | null; onCancel: () => void; onConfirm: () => Promise<void> }) {
  if (!account) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="deactivate-user-title">
    <button type="button" className="absolute inset-0 bg-black/40" onClick={onCancel} aria-label="Fermer la confirmation" />
    <div className="relative z-10 w-full max-w-md rounded-md bg-white p-6 shadow-lg">
      <h3 id="deactivate-user-title" className="text-lg font-semibold text-foreground">Confirmer la désactivation</h3>
      <p className="mt-2 text-sm text-black">Voulez-vous vraiment désactiver le compte de {account.nom} ? Ses historiques seront conservés.</p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-sm border border-border px-4 py-2 text-sm">Annuler</button>
        <button type="button" onClick={() => void onConfirm()} className="rounded-sm bg-destructive px-4 py-2 text-sm font-bold text-white">Désactiver</button>
      </div>
    </div>
  </div>;
}
