import { request } from "./request";
import type { components } from "./schema";
import type { Comment } from "./types";

export const commentsApi = {
  getArtistComments(id: number): Promise<Comment[]> {
    return request(`/v1/artist/${id}/comments`);
  },

  postArtistComment(
    id: number,
    body: components["schemas"]["NewCommentRequest"],
    token: string,
  ): Promise<Comment> {
    return request(
      `/v1/artist/${id}/comments`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  getTrackComments(id: number): Promise<Comment[]> {
    return request(`/v1/track/${id}/comments`);
  },

  postTrackComment(
    id: number,
    body: components["schemas"]["NewCommentRequest"],
    token: string,
  ): Promise<Comment> {
    return request(
      `/v1/track/${id}/comments`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  deleteComment(
    id: number,
    token: string,
  ): Promise<components["schemas"]["DeletedResponse"]> {
    return request(`/v1/comments/${id}`, { method: "DELETE" }, token);
  },
};
