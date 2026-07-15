import { request } from "./request";
import type { components } from "./schema";
import type { TopTrack, TopListener } from "@scrobblr/types";

export const catalogApi = {
  getArtistTopTracks(id: number, limit?: number): Promise<TopTrack[]> {
    return request(
      `/v1/artist/${id}/top-tracks${limit ? `?limit=${limit}` : ""}`,
    );
  },

  getArtistListeners(id: number, limit?: number): Promise<TopListener[]> {
    return request(
      `/v1/artist/${id}/listeners${limit ? `?limit=${limit}` : ""}`,
    );
  },

  getTrackListeners(id: number, limit?: number): Promise<TopListener[]> {
    return request(
      `/v1/track/${id}/listeners${limit ? `?limit=${limit}` : ""}`,
    );
  },

  refreshArtist(
    id: number,
    token: string,
  ): Promise<components["schemas"]["RefreshResponse"]> {
    return request(`/v1/artist/${id}/refresh`, { method: "POST" }, token);
  },

  refreshTrack(
    id: number,
    token: string,
  ): Promise<components["schemas"]["RefreshResponse"]> {
    return request(`/v1/track/${id}/refresh`, { method: "POST" }, token);
  },
};
