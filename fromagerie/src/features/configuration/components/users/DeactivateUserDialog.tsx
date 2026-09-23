import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../../components/ui/alert-dialog";
import type { UserAccount } from "../../api/userApi";

interface DeactivateUserDialogProps {
  account: UserAccount | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeactivateUserDialog({ account, onCancel, onConfirm }: DeactivateUserDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={account !== null} onOpenChange={(open) => { if (!open && !submitting) onCancel(); }}>
      {account && (
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-[#e2dacb] bg-[#fcfbfa] text-[#2c2825] shadow-2xl sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-left text-base font-bold">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="size-5" /></span>
              Confirmer la désactivation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-sm text-gray-600">
              Voulez-vous vraiment désactiver le compte de <strong className="text-[#2c2825]">{account.nom}</strong> ? Ses historiques seront conservés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} className="min-h-11 rounded-xl border-[#e2dacb] bg-white text-[#2c2825]">Annuler</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={(event) => { event.preventDefault(); void confirm(); }} className="min-h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              {submitting ? "Désactivation..." : "Désactiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
