import type { components } from "$lib/api/schema";
import type { UserProfile } from "@scrobblr/types";
export * from "@scrobblr/types";

export type PublicUser = Omit<SessionUser, "token">;

export type S = components["schemas"];
export type AuthResponse = S["AuthResponse"]

export interface SessionUser {
  token: string;
  user_id: number;
  username: string;
}

export type IBlockedResponse = {
  entries: [];
}

export type Profile = S["ProfileResponse"];

export type FriendsResponse = S["FriendsResponse"];

export type SearchResponse = S["SearchResponse"];

export type ConnectedAccount = S["ConnectedAccountSummary"];

export type AuthorizeResponse = S["AuthorizeResponse"];

export type TimePeriod = import("$lib/periods").Period;
