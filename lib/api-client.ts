import { env } from "./env";
import type { ApiEnvelope } from "./types";


export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface ApiResult<T> {
  data: T;
  meta: ApiEnvelope<T>["metadata"];
}

type TokenProvider = () => Promise<string | null>;

async function request<T>(
  getAccessToken: TokenProvider,
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${env.apiOrigin}${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload || payload.success === false) {
    const message = payload?.message ?? response.statusText ?? "Request failed";
    throw new ApiError(message, response.status);
  }

  return { data: payload.data, meta: payload.metadata };
}

export function createApiClient(getAccessToken: TokenProvider) {
  const toQuery = (params?: object): string => {
    if (!params) return "";
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== "");
    if (!entries.length) return "";
    const search = new URLSearchParams(entries.map(([key, value]) => [key, String(value)]));
    return `?${search.toString()}`;
  };

  return {
    get: <T>(path: string, params?: object) =>
      request<T>(getAccessToken, `${path}${toQuery(params)}`),
    post: <T>(path: string, body?: unknown) =>
      request<T>(getAccessToken, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(getAccessToken, path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(getAccessToken, path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string) => request<T>(getAccessToken, path, { method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
