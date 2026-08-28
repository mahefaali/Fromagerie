import { notifyUnauthorized } from "./sessionEvents";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

interface ApiErrorBody {
  status?: number;
  message?: string;
  errors?: Record<string, string> | null;
}

interface CsrfTokenResponse {
  token: string;
  headerName: string;
  parameterName: string;
}

interface CsrfTokenState {
  token: string;
  headerName: string;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "credentials"> {
  json?: unknown;
  notifyOnUnauthorized?: boolean;
  csrf?: boolean;
}

export class HttpError extends Error {
  readonly status: number;
  readonly validationErrors: Record<string, string> | null;

  constructor(status: number, message: string, validationErrors: Record<string, string> | null = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

let csrfToken: CsrfTokenState | null = null;
let csrfRequest: Promise<CsrfTokenState> | null = null;

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null;
}

function isCsrfTokenResponse(value: unknown): value is CsrfTokenResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.token === "string" &&
    typeof candidate.headerName === "string" &&
    typeof candidate.parameterName === "string"
  );
}

async function requestCsrfToken(): Promise<CsrfTokenState> {
  const response = await fetch(buildUrl("/api/auth/csrf"), {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    const errorBody = isApiErrorBody(body) ? body : undefined;
    throw new HttpError(response.status, errorBody?.message ?? "Impossible d'initialiser la protection CSRF");
  }

  if (!isCsrfTokenResponse(body)) {
    throw new Error("Réponse CSRF invalide reçue du serveur");
  }

  return { token: body.token, headerName: body.headerName };
}

export async function ensureCsrfToken(): Promise<CsrfTokenState> {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfRequest) {
    csrfRequest = requestCsrfToken()
      .then((token) => {
        csrfToken = token;
        return token;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
}

export function invalidateCsrfToken(): void {
  csrfToken = null;
}

export async function refreshCsrfToken(): Promise<void> {
  invalidateCsrfToken();
  await ensureCsrfToken();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    json,
    notifyOnUnauthorized = true,
    csrf,
    headers: initialHeaders,
    method: initialMethod = "GET",
    ...requestOptions
  } = options;
  const method = initialMethod.toUpperCase();
  const headers = new Headers(initialHeaders);
  headers.set("Accept", "application/json");

  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (csrf ?? MUTATING_METHODS.has(method)) {
    const currentCsrfToken = await ensureCsrfToken();
    headers.set(currentCsrfToken.headerName, currentCsrfToken.token);
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    method,
    headers,
    credentials: "include",
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && notifyOnUnauthorized) {
      notifyUnauthorized();
    }

    const errorBody = isApiErrorBody(body) ? body : undefined;
    throw new HttpError(
      response.status,
      errorBody?.message ?? `Erreur HTTP ${response.status}`,
      errorBody?.errors ?? null,
    );
  }

  return body as T;
}
