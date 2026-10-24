import type { Profile, FriendsResponse, TimePeriod, S } from "$lib/api/types";
import type { ScrobbleRich, TopArtist, TopTrack, ActivityDay } from "@scrobblr/types";
import { request, requestRaw, type ApiEvent } from "./request";

const seg = encodeURIComponent;

export const profileApi = (event: ApiEvent) => ({
  getProfile: (username: string) => request<Profile>(event, `/v1/user/${seg(username)}`),

  getMe: () => request<Profile>(event, "/v1/user/me"),

  updateProfile: (body: S["UpdateSettingsRequest"]) =>
    request<S["UserProfile"]>(event, "/v1/user/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    
  uploadAvatar: (file: File) => {
    const body = new FormData();
    body.append("image", file);
    return request<S["UserProfile"]>(event, "/v1/user/me/avatar", {
      method: "POST",
      body,
    });
  },

  getFriends: (username: string) =>  request<FriendsResponse>(event, `/v1/user/${seg(username)}/friends`),

  getFollowers: (username: string, before?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    return request<S["FollowPage"]>(event, `/v1/user/${seg(username)}/followers?${params}`);
  },

  getFollowing: (username: string, before?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    return request<S["FollowPage"]>(event, `/v1/user/${seg(username)}/following?${params}`);
  },

  getBlocks: (before?: string, limit = 200) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    return request<S["BlockPage"]>(event, `/v1/user/me/blocks?${params}`);
  },

  block: (username: string) =>
    request<void>(event, `/v1/user/${seg(username)}/block`, { method: "POST" }),

  unblock: (username: string) =>
    request<void>(event, `/v1/user/${seg(username)}/block`, { method: "DELETE" }),

  removeFollower: (username: string) =>
    request<void>(event, `/v1/user/me/followers/${seg(username)}`, { method: "DELETE" }),

  getRecent: (username: string, limit = 50, before?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    return request<ScrobbleRich[]>(event, `/v1/user/${seg(username)}/recent?${params}`);
  },

  getTopArtists: (
    username: string,
    period: TimePeriod = "overall",
    limit = 10,
  ) => 
    request<TopArtist[]>(
      event,
      `/v1/user/${seg(username)}/top-artists?${new URLSearchParams({ limit: String(limit), period })}`
    ),

  getTopTracks: (
    username: string,
    period: TimePeriod = "overall",
    limit = 10
  ) => 
    request<TopTrack[]>(
      event,
      `/v1/user/${seg(username)}/top-tracks?${new URLSearchParams({ limit: String(limit), period })}`,
    ),

  getHeatmap: (username: string) => request<ActivityDay[]>(event, `/v1/user/${seg(username)}/heatmap`),

  getLive: (username: string, signal?: AbortSignal) =>
    requestRaw(event, `/v1/user/${seg(username)}/live`, { signal }),

  follow: (username: string) => 
    request<void>(event, `/v1/user/${seg(username)}/follow`, {
      method: "POST",
    }),

  unfollow: (username: string) =>
    request<void>(event, `/v1/user/${seg(username)}/follow`, {
      method: "DELETE",
    }),
});
