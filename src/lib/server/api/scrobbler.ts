import type { S } from "#lib/api/types";
import { request, type ApiEvent } from "./request";

export const scrobblerApi = (event: ApiEvent) => ({
  listCredentials: () =>
    request<S["ScrobblerCredential"][]>(event, "/v1/scrobbler/credentials"),

  revokeCredential: (id: string) =>
    request<void>(event, `/v1/scrobbler/credentials/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  createToken: (name: string) =>
    request<S["CreatedScrobblerToken"]>(event, "/v1/scrobbler/tokens", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getAuthorization: (token: string) =>
    request<S["ScrobblerAuthorization"]>(
      event,
      `/v1/scrobbler/authorizations/${encodeURIComponent(token)}`
    ),

  approve: (token: string) =>
    request<void>(
      event,
      `/v1/scrobbler/authorizations/${encodeURIComponent(token)}/approve`,
      { method: "POST" }
    ),

  authorizeCallback: (body: { api_key: string; callback: string }) =>
    request<S["ScrobblerAuthorizationRedirect"]>(event, "/v1/scrobbler/authorizations", {
      method: "POST",
      body: JSON.stringify(body),
    }),
})
