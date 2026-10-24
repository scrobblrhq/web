import type { components } from "$lib/api/schema";
import type { ApiToken } from "@scrobblr/types";
import { request, type ApiEvent } from "./request";

export const tokensApi = (event: ApiEvent) => ({
  list: () => request<ApiToken[]>(event, "/v1/auth/tokens"),

  create: (body: components["schemas"]["CreateTokenRequest"]) =>
    request<components["schemas"]["CreateTokenResponse"]>(
      event,
      "/v1/auth/tokens",
      { method: "POST", body: JSON.stringify(body) },
    ),

  revoke: (id: string) =>
    request<void>(event, `/v1/auth/tokens/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
});
