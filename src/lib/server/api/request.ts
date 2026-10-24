import type { RequestEvent } from "@sveltejs/kit";
import { SCROBBLR_API_URL, SCROBBLR_APP_ID, SCROBBLR_APP_KEY } from "$app/env/private";
import { clearSessionCookie } from "#lib/session";
import { signHeaders } from "./sign";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The app server could not reach the API, as opposed to receiving an HTTP error. */
export class ApiConnectionError extends Error {
  constructor(cause: unknown) {
    super("Could not connect to the API", { cause });
    this.name = "ApiConnectionError";
  }
}

export type ApiEvent = Pick<
  RequestEvent,
  "getClientAddress" | "locals" | "cookies"
>;

type Options = Omit<RequestInit, "headers"> & {
  /** false for login/register; don't send Authorization header */
  auth?: boolean;
  sign?: boolean;
}

export async function request<T>(
  event: ApiEvent,
  path: string,
  { auth = true, sign = false, ...init }: Options = {},
): Promise<T> {
  const headers = new Headers();

  headers.set("X-Forwarded-For", event.getClientAddress())

  const token = auth ? event.locals.user?.token : undefined;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (sign) {
    const body = typeof init.body === "string" ? init.body : "";
    const method = (init.method ?? "GET").toUpperCase();
    const signed = signHeaders(
      { appId: SCROBBLR_APP_ID, secret: SCROBBLR_APP_KEY },
      method,
      path,
      body
    );
    for (const [k, v] of Object.entries(signed)) headers.set(k, v);
  }

  // global fetch; don't use event.fetch because it would send cookies to the API server
  let res: Response;
  try {
    res = await fetch(`${SCROBBLR_API_URL}${path}`, { ...init, headers });
  } catch (cause) {
    throw new ApiConnectionError(cause);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || res.statusText;
    try {
      message = JSON.parse(text).error ?? message;
    } catch {}

    if (res.status === 401 && token) {
      clearSessionCookie(event.cookies);
      event.locals.user = undefined;
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Fetch an upstream response without decoding JSON (SSE streams and downloads). */
export async function requestRaw(
  event: ApiEvent,
  path: string,
  { auth = true, sign = false, ...init }: Options = {},
): Promise<Response> {
  const headers = new Headers();
  headers.set("X-Forwarded-For", event.getClientAddress());

  const token = auth ? event.locals.user?.token : undefined;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (typeof init.body === "string") headers.set("Content-Type", "application/json");

  if (sign) {
    const body = typeof init.body === "string" ? init.body : "";
    const signed = signHeaders(
      { appId: SCROBBLR_APP_ID, secret: SCROBBLR_APP_KEY },
      (init.method ?? "GET").toUpperCase(),
      path,
      body,
    );
    for (const [key, value] of Object.entries(signed)) headers.set(key, value);
  }

  const res = await fetch(`${SCROBBLR_API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && token) {
    clearSessionCookie(event.cookies);
    event.locals.user = undefined;
  }
  return res;
}
