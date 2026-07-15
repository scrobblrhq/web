import { API_URL } from "$app/env/public";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string | undefined>),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => {});
    throw new ApiError(
      res.status,
      body?.error ?? body?.message ?? res.statusText,
    );
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
