import { request } from "./request";
import type { components, paths } from "./schema";
import type { ApiToken } from "./types";

export const tokensApi = {
  list(token: string): Promise<ApiToken[]> {
    return request(`/v1/auth/tokens`, {}, token);
  },

  create(
    token: string,
    body: components["schemas"]["CreateTokenRequest"],
  ): Promise<components["schemas"]["CreateTokenResponse"]> {
    return request(
      `/v1/auth/tokens`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );
  },

  revoke(token: string, id: string): Promise<void> {
    return request(
      `/v1/auth/tokens/${id}`,
      {
        method: "DELETE",
      },
      token,
    );
  },
};
