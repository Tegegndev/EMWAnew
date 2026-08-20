const normalizeApiBase = (rawUrl?: string) => {
  const fallback = "https://api.ethmwa.org/api/v1";
  const url = (rawUrl || fallback).trim().replace(/\/+$/, "");
  return url.endsWith("/api/v1") ? url : `${url}/api/v1`;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

export type AdminRole = "ADMIN" | "SUPER_ADMIN";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

type StoredAdminSession = {
  token: string;
  refreshToken: string;
  admin: { id: string; fullName: string; email?: string; role: string };
};

const apiErrorMessage = (payload: unknown) => {
  const error = (payload as {
    error?: {
      message?: string;
      details?: { fieldErrors?: Record<string, string[] | undefined> };
    };
    message?: string;
  }) ?? { error: undefined, message: undefined };
  const fieldErrors = error.error?.details?.fieldErrors;
  const firstFieldError = fieldErrors
    ? Object.entries(fieldErrors).find(([, messages]) => messages?.length)
    : undefined;
  if (firstFieldError) return `${firstFieldError[0]}: ${firstFieldError[1]?.[0]}`;
  return error.error?.message ?? error.message ?? "Request failed";
};

const readStoredSession = (): StoredAdminSession | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem("emwa_admin_session") ?? "null");
  } catch {
    return null;
  }
};

let refreshRequest: Promise<string | null> | null = null;

const refreshAccessToken = () => {
  if (refreshRequest) return refreshRequest;
  refreshRequest = (async () => {
    const session = readStoredSession();
    if (!session?.refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.data?.accessToken || !payload?.data?.refreshToken) return null;

      const nextSession: StoredAdminSession = {
        ...session,
        token: payload.data.accessToken,
        refreshToken: payload.data.refreshToken,
      };
      window.localStorage.setItem("emwa_admin_session", JSON.stringify(nextSession));
      window.dispatchEvent(new CustomEvent("emwa-admin-session-updated", { detail: nextSession }));
      return nextSession.token;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshRequest = null;
  });
  return refreshRequest;
};

const tokenNeedsRefresh = (token: string) => {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return true;
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    return !payload.exp || payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function adminApi<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  const storedToken = token ? readStoredSession()?.token : undefined;
  let accessToken = storedToken ?? token;
  if (accessToken && tokenNeedsRefresh(accessToken)) {
    accessToken = (await refreshAccessToken()) ?? accessToken;
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers });
    const responseError = !response.ok
      ? await response
          .clone()
          .json()
          .catch(() => null)
      : null;
    const unauthorized = response.status === 401 || responseError?.error?.code === "UNAUTHORIZED";
    if (unauthorized && token && !path.startsWith("/auth/")) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        headers.set("Authorization", `Bearer ${refreshedToken}`);
        response = await fetch(`${API_BASE}${path}`, { ...init, headers });
      } else if (typeof window !== "undefined") {
        window.localStorage.removeItem("emwa_admin_session");
        window.dispatchEvent(new Event("emwa-admin-session-expired"));
      }
    }
  } catch {
    throw new ApiError(
      0,
      `Cannot reach the EMWA API at ${API_BASE}. Check that the backend is running and allows this website origin.`,
    );
  }

  const payload =
    response.status === 204
      ? { success: true, data: null }
      : await response.json().catch(() => ({ success: false, data: null }));

  if (!response.ok) {
    throw new ApiError(response.status, apiErrorMessage(payload));
  }
  return payload;
}

export const loginAdmin = (email: string, password: string) =>
  adminApi<{
    admin: { id: string; fullName: string; email?: string; role: AdminRole };
    accessToken: string;
    refreshToken: string;
  }>("/auth/login", undefined, { method: "POST", body: JSON.stringify({ email, password }) });

export const loginDemoAdmin = () =>
  adminApi<{
    admin: { id: string; fullName: string; email?: string; role: AdminRole };
    accessToken: string;
    refreshToken: string;
  }>("/auth/demo-login", undefined, { method: "POST" });

export const logoutAdmin = (refreshToken: string) =>
  adminApi<null>("/auth/logout", undefined, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

export const listData = async <T>(path: string, token: string) => {
  const result = await adminApi<T[]>(path, token);
  return { rows: result.data, total: result.meta?.total ?? result.data.length };
};

export { API_BASE };
