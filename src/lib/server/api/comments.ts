import { request, type ApiEvent } from "./request";
import type { Comment } from "#lib/api/types";

export const commentsApi = (event: ApiEvent) => ({
  getArtistComments: (id: number) => request<Comment[]>(event, `/v1/artist/${id}/comments`),

  postArtistComment: (
    id: number,
    body: { body: string },
  ) =>
    request<Comment>(event, `/v1/artist/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(body)
    }),

  getTrackComments: (id: number) => request<Comment[]>(event, `/v1/track/${id}/comments`),

  postTrackComment: (
    id: number,
    body: { body: string }
  ) =>
    request<Comment>(event, `/v1/track/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(body)
    }),

  deleteComment: (id: number) =>
    request<{ deleted: boolean }>(event, `/v1/comments/${id}`, {
      method: "DELETE"
    }),
});
