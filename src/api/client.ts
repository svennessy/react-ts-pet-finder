import { getAccessToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value
  );
}

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    signal,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json && typeof json === "object" && "error" in json
        ? String(json.error)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (isApiEnvelope<T>(json)) return json.data;

  return json as T;
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json && typeof json === "object" && "error" in json
        ? String(json.error)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (isApiEnvelope<TResponse>(json)) return json.data;

  return json as TResponse;
}

export async function apiDelete<TResponse>(
  path: string,
  signal?: AbortSignal,
): Promise<TResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    signal,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json && typeof json === "object" && "error" in json
        ? String(json.error)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (isApiEnvelope<TResponse>(json)) return json.data;

  return json as TResponse;
}