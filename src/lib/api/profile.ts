import type {
  Profile,
  FriendsResponse,
  TimePeriod,
} from "./types";
import type { ScrobbleRich, TopArtist, TopTrack, ActivityDay } from "@scrobblr/types";

import { request } from "./request";

export const profileApi = {
  getProfile(username: string, token?: string): Promise<Profile> {
    return request(`/v1/user/${username}`, {}, token);
  },

  getMe(token: string): Promise<Exclude<Profile, "is_following">> {
    return request("/v1/user/me", {}, token);
  },

  updateProfile(
    body: Partial<
      Pick<Profile, "bio" | "display_name" | "image_url" | "is_private">
    >,
    token: string,
  ): Promise<Exclude<Profile, "is_following">> {
    return request(
      "/v1/user/me",
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token
    );
  },

  uploadAvatar(
    file: File,
    token: string,
  ): Promise<Exclude<Profile, "is_following">> {
    const body = new FormData();
    body.append("image", file);
    return request(
      "/v1/user/me/avatar",
      {
        method: "POST",
        body,
      },
      token
    );
  },

  getFriends(username: string, token?: string): Promise<FriendsResponse> {
    return request(`/v1/user/${username}/friends`, {}, token);
  },

  getRecent(username: string, limit = 50, token?: string): Promise<ScrobbleRich[]> {
    return request(`/v1/user/${username}/recent?limit=${limit}`, {}, token);
  },

  getTopArtists(
    username: string,
    period: TimePeriod = "overall",
    limit = 10,
    token?: string
  ): Promise<TopArtist[]> {
    return request(
      `/v1/user/${username}/top-artists?limit=${limit}&period=${period}`,
      {},
      token
    );
  },

  getTopTracks(
    username: string,
    period: TimePeriod = "overall",
    limit = 10,
    token?: string
  ): Promise<TopTrack[]> {
    return request(
      `/v1/user/${username}/top-tracks?limit=${limit}&period=${period}`,
      {},
      token
    );
  },

  getHeatmap(username: string, token?: string): Promise<ActivityDay[]> {
    return request(`/v1/user/${username}/heatmap`, {}, token);
  },

  follow(username: string, token: string): Promise<void> {
    return request(
      `/v1/user/${username}/follow`,
      {
        method: "POST",
      },
      token,
    );
  },

  unfollow(username: string, token: string): Promise<void> {
    return request(
      `/v1/user/${username}/follow`,
      {
        method: "DELETE",
      },
      token,
    );
  },
};
