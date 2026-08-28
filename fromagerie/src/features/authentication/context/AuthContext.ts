import { createContext } from "react";

import type { AuthStatus, AuthUser, LoginRequest } from "../types/auth.types";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
