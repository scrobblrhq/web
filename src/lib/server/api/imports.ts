import type { S } from "$lib/api/types";
import { request, type ApiEvent } from "./request";

export const importsApi = (event: ApiEvent) => ({
  list: () => request<S["ScrobbleImport"][]>(event, "/v1/imports"),

  startLastfm: (full: boolean) =>
    request<S["ScrobbleImport"]>(event, "/v1/import/lastfm", {
      method: "POST",
      body: JSON.stringify({ full }),
    }),

  get: (id: number) => request<S["ScrobbleImport"]>(event, `/v1/imports/${id}`),

  cancel: (id: number) =>
    request<void>(event, `/v1/imports/${id}`, { method: "DELETE" }),
});
