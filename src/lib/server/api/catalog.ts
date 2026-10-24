import { request, type ApiEvent } from "./request";
import type { TopTrack, TopListener } from "@scrobblr/types";

const query = (limit?: number) => limit ? `?${new URLSearchParams({ limit: String(limit) })}` : "";

export const catalogApi = (event: ApiEvent) => ({
 getArtistTopTracks: (id: number, limit?: number) =>
    request<TopTrack[]>(
      event,
      `/v1/artist/${id}/top-tracks${query(limit)}`,
    ),

  getArtistListeners: (id: number, limit?: number) =>
    request<TopListener[]>(
      event,
      `/v1/artist/${id}/listeners${query(limit)}`,
    ),

  getTrackListeners: (id: number, limit?: number) =>
    request<TopListener[]>(
      event,
      `/v1/track/${id}/listeners${query(limit)}`,
    ),

  refreshArtist: (id: number) => request<{ status: string }>(event, `/v1/artist/${id}/refresh`, { method: "POST" }),

  refreshTrack: (id: number) => request<{ status: string }>(event, `/v1/track/${id}/refresh`, { method: "POST" }),
});
