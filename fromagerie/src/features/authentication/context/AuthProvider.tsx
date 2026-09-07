import { useEffect, useState, type ReactNode } from "react";

import { onUnauthorized } from "../../../services/http/sessionEvents";
import { authApi } from "../api/authApi";
import { AuthContext } from "./AuthContext";
import type { AuthStatus, AuthUser, LoginRequest } from "../types/auth.types";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const authenticatedUser = await authApi.me();

        if (active) {
          setUser(authenticatedUser);
          setStatus("authenticated");
        }
      } catch {
        if (active) {
          setUser(null);
          setStatus("anonymous");
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => onUnauthorized(() => {
    setUser(null);
    setStatus("anonymous");
  }), []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    const authenticatedUser = await authApi.login(credentials);
    setUser(authenticatedUser);
    setStatus("authenticated");
  };

  const logout = async (): Promise<void> => {
    await authApi.logout();
    setUser(null);
    setStatus("anonymous");
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
