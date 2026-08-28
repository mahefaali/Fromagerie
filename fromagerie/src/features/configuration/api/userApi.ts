import { apiRequest } from "../../../services/http/apiClient";
import type { UserRole } from "../../authentication/types/auth.types";

export interface UserAccount {
  id: number;
  username: string;
  nom: string;
  role: UserRole;
  actif: boolean;
}

export interface CreateUserRequest {
  username: string;
  nom: string;
  credential: string;
  role: UserRole;
  actif: boolean;
}

export interface UpdateUserRequest {
  nom: string;
  role: UserRole;
  actif: boolean;
  credential?: string;
}

export const userApi = {
  findAll: (includeInactive = false): Promise<UserAccount[]> =>
    apiRequest<UserAccount[]>(`/api/utilisateurs?inclureInactifs=${includeInactive}`),

  create: (request: CreateUserRequest): Promise<UserAccount> =>
    apiRequest<UserAccount>("/api/utilisateurs", { method: "POST", json: request }),

  update: (id: number, request: UpdateUserRequest): Promise<UserAccount> =>
    apiRequest<UserAccount>(`/api/utilisateurs/${id}`, { method: "PUT", json: request }),

  deactivate: (id: number): Promise<void> =>
    apiRequest<void>(`/api/utilisateurs/${id}`, { method: "DELETE" }),

  reactivate: (id: number): Promise<UserAccount> =>
    apiRequest<UserAccount>(`/api/utilisateurs/${id}/reactivation`, { method: "POST" }),
};
