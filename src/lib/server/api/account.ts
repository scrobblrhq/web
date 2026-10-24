import type { S } from "$lib/api/types";
import { request, requestRaw, type ApiEvent } from "./request";

export const accountApi = (event: ApiEvent) => ({
  export: () => requestRaw(event, "/v1/user/me/export"),

  delete: (body: S["DeleteAccountRequest"]) =>
    request<S["DeletionScheduled"]>(event, "/v1/user/me/delete", {
      method: "POST",
      body: JSON.stringify(body),
    }),
});
