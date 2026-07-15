import { request } from "./request";
import type { Artist, SearchResponse, Track } from "./types";

export const searchApi = {
  getTrack(id: number): Promise<Track> {
    return request(`/v1/track/${id}`);
  },

  getArtist(id: number): Promise<Artist> {
    return request(`/v1/artist/${id}`);
  },

  search(
    q: string,
    limit = 10,
    type: "artist" | "track" | "all" = "all",
  ): Promise<SearchResponse> {
    return request(`/v1/search?q=${q}&limit=${limit}&type=${type}`);
  },
};
