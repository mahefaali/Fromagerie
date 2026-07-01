"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Button } from "./../components/ui/button";
import { Link } from "./../components/common/Link";

type WvcUser = {
  name?: string;
  role?: string;
  email?: string;
};

async function resolveWvcUser(): Promise<WvcUser | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const client = (window as any).wvcClient;
  if (!client || !client.isAuthenticated) {
    return null;
  }

  if (typeof client.getUser === "function") {
    return client.getUser();
  }

  if (typeof client.getUserRole === "function") {
    return {
      name: client.user?.name,
      role: await client.getUserRole(),
      email: client.user?.email,
    };
  }

  const role = client.userRole ?? client.role ?? client.user?.role;
  const name = client.userName ?? client.user?.name;
  const email = client.user?.email ?? client.userEmail;

  if (!name && !role && !email) {
    return null;
  }

  return { name, role, email };
}

export async function getWvcUser(): Promise<WvcUser | null> {
  return resolveWvcUser();
}

export default function UserMenu() {
  const [user, setUser] = useState<WvcUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    resolveWvcUser().then((resolvedUser) => {
      setUser(resolvedUser);
    });
  }, []);

  if (!user) {
    return null;
  }

  const isOwner =
    user.role === "Propriétaire" || user.role === "owner" || user.role === "admin";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      const client = (window as any).wvcClient;
      if (client) {
        client.isAuthenticated = false;
        client.userRole = null;
        client.userName = null;
        client.userEmail = null;
      }
      window.dispatchEvent(new Event("WVC_AUTH_CHANGE"));
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:bg-primary/5"
        aria-label="Menu utilisateur"
      >
        <User className="size-4" />
        <span className="hidden sm:inline">Compte</span>
        <ChevronDown className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-border bg-background p-4 shadow-lg">
          <div className="mb-3 rounded-2xl bg-muted p-3">
            <p className="font-medium text-foreground">{user.name ?? "Utilisateur"}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-secondary">
              {user.role ?? "Invité"}
            </p>
            {user.email && (
              <p className="mt-2 text-xs text-muted-foreground">{user.email}</p>
            )}
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
              className="inline-flex w-full items-center justify-start rounded-sm border border-border bg-card px-4 py-3 text-left text-sm font-medium uppercase tracking-[0.06em] text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              <LogOut className="mr-2 size-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
