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
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#C96A4A] bg-[#C96A4A] text-sm font-semibold uppercase tracking-wider text-[#FFFDF9] shadow-sm transition hover:border-[#3F4A4F] hover:bg-[#3F4A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C96A4A] focus-visible:ring-offset-2"
        aria-label={`Ouvrir le menu de ${user.nom}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`${user.nom} - ${user.role}`}
      >
        {initials || <User className="size-5" aria-hidden="true" />}
        <span
          className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#FFFDF9] bg-emerald-500"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-[10000] w-72 rounded-2xl border border-border bg-background p-4 shadow-lg ${
            menuPlacement === "top" ? "bottom-full mb-3" : "top-full mt-2"
          }`}
          role="menu"
        >
          <div className="mb-3 rounded-2xl bg-muted p-3">
            <p className="font-medium text-foreground">{user.nom}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-secondary">
              {user.role}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{user.username}</p>
          </div>

          <div className="space-y-2">
            {isOwner && (
              <Link to="/configuration" className="block w-full">
                <Button className="w-full justify-start rounded-sm bg-primary px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.06em] text-primary-foreground hover:bg-primary/90">
                  <Settings className="mr-2 size-4" />
                  Configuration
                </Button>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex w-full items-center justify-start rounded-sm border border-border bg-card px-4 py-3 text-left text-sm font-medium uppercase tracking-[0.06em] text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              <LogOut className="mr-2 size-4" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </button>
            {logoutError && (
              <p role="alert" className="text-sm text-destructive">{logoutError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
