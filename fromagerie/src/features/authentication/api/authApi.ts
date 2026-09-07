import {
  apiRequest,
  invalidateCsrfToken,
  refreshCsrfToken,
} from "../../../services/http/apiClient";
import type { AuthUser, LoginRequest } from "../types/auth.types";

async function renewCsrfAfterSessionChange(): Promise<void> {
  invalidateCsrfToken();

  try {
    await refreshCsrfToken();
  } catch {
    // A later mutating request will retry before sending data.
  }
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthUser> => {
    const user = await apiRequest<AuthUser>("/api/auth/login", {
      method: "POST",
      json: credentials,
      notifyOnUnauthorized: false,
    });

    await renewCsrfAfterSessionChange();
    return user;
  },

  me: (): Promise<AuthUser> =>
    apiRequest<AuthUser>("/api/auth/me", { notifyOnUnauthorized: false }),

  logout: async (): Promise<void> => {
    await apiRequest<void>("/api/auth/logout", {
      method: "POST",
      notifyOnUnauthorized: false,
    });
    await renewCsrfAfterSessionChange();
  },
};
