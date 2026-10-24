import { request, type ApiEvent } from "./request";
import type { Album, Artist, SearchResponse, Track } from "#lib/api/types";

export const searchApi = (event: ApiEvent) => ({
  getTrack: (id: number) => request<Track>(event, `/v1/track/${id}`),

  getArtist: (id: number) => request<Artist>(event, `/v1/artist/${id}`),

  getAlbum: (id: number) => request<Album>(event, `/v1/album/${id}`),

  search: (
    q: string,
    limit = 10,
    type: "artist" | "track" | "user" | "all" = "all",
  ) =>
    request<SearchResponse>(
      event,
      `/v1/search?${new URLSearchParams({ q, limit: limit.toString(), type })}`
    ),
});
