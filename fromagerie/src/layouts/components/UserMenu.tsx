import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { useAuth } from "../../features/authentication/hooks/useAuth";

const roleLabels = {
  PROPRIETAIRE: "Propriétaire",
  FABRICATION: "Fabrication",
  VENTE: "Vente",
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (!user) return null;

  const firstName = user.nom.trim().split(/\s+/)[0] || user.username;
  const initial = firstName.charAt(0).toLocaleUpperCase("fr");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      setLogoutConfirmationOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Déconnexion impossible. Réessayez.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Menu de ${user.nom}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#355B12]/30 bg-[#355B12] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#29470e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355B12] focus-visible:ring-offset-2"
        >
          {initial}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[#e2dacb] bg-[#fffcf7] p-1.5 text-[#2c2825] shadow-[0_12px_32px_rgba(44,40,37,0.16)]"
      >
        <div className="border-b border-[#e2dacb] px-3.5 py-3.5">
          <p className="truncate text-base font-semibold leading-6">{user.nom}</p>
          <p className="truncate text-sm text-[#706960]">{user.username}</p>
        </div>
        <div className="py-1.5">
          <button
            type="button"
            onClick={() => { setOpen(false); setProfileOpen(true); }}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-left text-sm transition-colors hover:bg-[#f2ebdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355B12]"
          >
            <UserRound className="size-4 shrink-0" /> Voir mon profil
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setLogoutError(null); setLogoutConfirmationOpen(true); }}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-left text-sm text-[#b3260c] transition-colors hover:bg-[#fff0eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b3260c] disabled:opacity-50"
          >
            <LogOut className="size-4 shrink-0" /> Se déconnecter
          </button>
        </div>
      </PopoverContent>
    </Popover>

    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mon profil</DialogTitle>
          <DialogDescription>Informations de votre compte</DialogDescription>
        </DialogHeader>
        <dl className="space-y-3 rounded-xl border border-[#e2dacb] bg-white p-4 text-sm">
          <div><dt className="text-[#706960]">Nom</dt><dd className="mt-0.5 font-semibold">{user.nom}</dd></div>
          <div><dt className="text-[#706960]">Identifiant</dt><dd className="mt-0.5 break-all font-semibold">{user.username}</dd></div>
          <div><dt className="text-[#706960]">Rôle</dt><dd className="mt-0.5 font-semibold">{roleLabels[user.role]}</dd></div>
        </dl>
      </DialogContent>
    </Dialog>

    <AlertDialog open={logoutConfirmationOpen} onOpenChange={(next) => { if (!isLoggingOut) setLogoutConfirmationOpen(next); }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
          <AlertDialogDescription>Votre session sera fermée. Vous devrez vous reconnecter pour accéder au système.</AlertDialogDescription>
        </AlertDialogHeader>
        {logoutError && <p role="alert" className="text-sm text-[#b3260c]">{logoutError}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoggingOut}
            className="bg-[#b3260c] text-white hover:bg-[#922007]"
            onClick={(event) => { event.preventDefault(); void handleLogout(); }}
          >
            {isLoggingOut ? "Déconnexion..." : "Confirmer la déconnexion"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
