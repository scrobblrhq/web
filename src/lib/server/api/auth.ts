import type { S, AuthResponse, AuthorizeResponse, ConnectedAccount } from "#lib/api/types";
import { request, type ApiEvent } from "./request";

export const authApi = (event: ApiEvent) => ({
  register: (body: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }) =>
    request<AuthResponse>(event, "/v1/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(body),
      sign: true
    }),

  login: (body: { username: string; password: string }) =>
    request<AuthResponse>(event, "/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(body),
      sign: true
    }),

  logout: (all = false) =>
    request<void>(event, `/v1/auth/logout${all ? "?all=true" : ""}`, {
      method: "POST"
    }),

  listConnections: () => request<ConnectedAccount[]>(event, "/v1/connect"),

  connect: (provider: "spotify" | "lastfm") => request<AuthorizeResponse>(event, `/v1/connect/${provider}`),

  disconnect: (provider: string) => request<void>(event, `/v1/connect/${provider}`),

  finishConnect: (
    provider: "spotify" | "lastfm",
    body: { state: string; code?: string; token?: string  }
  ) =>
    request<S["ConnectResult"]>(event, `/v1/connect/${provider}/callback`, {
      method: "POST",
      body: JSON.stringify(body)
    }),
});
