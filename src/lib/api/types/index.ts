import type { Artist, Track, UserProfile } from "@scrobblr/types"
export * from "@scrobblr/types";

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface SessionUser {
  token: string;
  user_id: number;
  username: string;
}

export interface Profile extends UserProfile {
  // Extra
  is_following: boolean | null;
}

export interface FriendsResponse {
  followers: UserProfile[];
  following: UserProfile[];
}

export interface SearchResponse {
  artists: Artist[];
  tracks: Track[];
  users: UserProfile[];
}

export type TimePeriod =
  | "7days"
  | "1month"
  | "3months"
  | "6months"
  | "1year"
  | "overall";
