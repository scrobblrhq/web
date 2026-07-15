import { request } from "./request";
import type { ImageCandidate } from "./types";

export const imagesApi = {
  getArtistImages(id: number): Promise<ImageCandidate[]> {
    return request(`/v1/artist/${id}/images`);
  },

  proposeArtistImage(
    id: number,
    file: File,
    token: string,
  ): Promise<ImageCandidate[]> {
    const body = new FormData();
    body.append("image", file);
    return request(`/v1/artist/${id}/image`, { method: "POST", body }, token);
  },

  voteImage(id: number, token: string): Promise<ImageCandidate[]> {
    return request(`/v1/image/${id}/vote`, { method: "POST" }, token);
  },

  unvoteImage(id: number, token: string): Promise<ImageCandidate[]> {
    return request(`/v1/image/${id}/vote`, { method: "DELETE" }, token);
  },
};
