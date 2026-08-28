export type UserRole = "PROPRIETAIRE" | "FABRICATION" | "VENTE";

export interface AuthUser {
  id: number;
  username: string;
  nom: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";
