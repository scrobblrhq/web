import type { ImageCandidate } from "#lib/api/types";
import { request, type ApiEvent } from "./request";

export const imagesApi = (event: ApiEvent) => ({
  getArtistImages: (id: number) =>
    request<ImageCandidate[]>(event, `/v1/artist/${id}/images`),

  proposeArtistImage: (id: number, file: File) => {
    const body = new FormData();
    body.append("image", file);
    return request<ImageCandidate[]>(event, `/v1/artist/${id}/image`, {
      method: "POST",
      body,
    });
  },

  voteImage: (id: number) =>
    request<ImageCandidate[]>(event, `/v1/image/${id}/vote`, {
      method: "POST",
    }),

  unvoteImage: (id: number) =>
    request<ImageCandidate[]>(event, `/v1/image/${id}/vote`, {
      method: "DELETE",
    }),
});
