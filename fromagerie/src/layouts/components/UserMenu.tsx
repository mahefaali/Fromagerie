"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./../../components/ui/button";
import { Link } from "./../../components/common/Link";
import { useAuth } from "../../features/authentication/hooks/useAuth";
import { HttpError } from "../../services/http/apiClient";

type UserMenuProps = {
  menuPlacement?: "top" | "bottom";
};

export default function UserMenu({ menuPlacement = "bottom" }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const isOwner = user.role === "PROPRIETAIRE";
  const initials = user.nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      setLogoutError(
        error instanceof HttpError ? error.message : "Déconnexion impossible. Veuillez réessayer.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {/* Bouton Trigger (Avatar) */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#C96A4A] bg-[#C96A4A] text-xs font-semibold uppercase tracking-wider text-[#FFFDF9] shadow-sm transition-all duration-200 hover:border-[#3F4A4F] hover:bg-[#3F4A4F] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C96A4A] focus-visible:ring-offset-2 sm:size-11 sm:text-sm"
        aria-label={`Ouvrir le menu de ${user.nom}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`${user.nom} - ${user.role}`}
      >
        {initials || <User className="size-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />}
        <span
          className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500 ring-1 ring-black/5"
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 z-[10000] w-[min(18rem,calc(100vw-1rem))] origin-top-right rounded-2xl border border-border/80 bg-background/95 p-3.5 shadow-xl backdrop-blur-sm transition-all ${
            menuPlacement === "top" ? "bottom-full mb-3" : "top-full mt-2"
          }`}
          role="menu"
        >
          {/* Header Profil */}
          <div className="mb-3 rounded-xl bg-muted/70 p-3.5 border border-border/40">
            <p className="font-semibold text-foreground truncate text-sm">{user.nom}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {user.role}
              </p>
            </div>
            <p className="mt-2 text-xs font-mono text-muted-foreground/80 truncate">{user.username}</p>
          </div>

          {/* Actions */}
          <div className="space-y-1.5">
            {isOwner && (
              <Link to="/configuration" className="block w-full">
                <Button className="w-full justify-start rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">
                  <Settings className="mr-2.5 size-4" />
                  Configuration
                </Button>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex w-full items-center justify-start rounded-lg border border-border/60 bg-card px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="mr-2.5 size-4" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </button>
            
            {logoutError && (
              <p role="alert" className="mt-2 px-1 text-xs font-medium text-destructive">
                {logoutError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
