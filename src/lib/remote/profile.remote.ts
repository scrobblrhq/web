import { command, query } from "$app/server";
import * as v from "valibot";
import { run } from "#lib/server/api";
import { PERIODS } from "#lib/periods";

const username = v.pipe(v.string(), v.minLength(1), v.maxLength(64));
const period = v.picklist(PERIODS);
const followListInput = v.object({
  username,
  kind: v.picklist(["followers", "following"]),
  before: v.optional(v.string()),
});

export const getTopArtists = query(v.object({ username, period }), ({ username, period }) =>
    run((api) => api.profile.getTopArtists(username, period, 10)),
);

export const getTopTracks = query(v.object({ username, period }), ({ username, period }) =>
    run((api) => api.profile.getTopTracks(username, period, 10)),
);

export const getRecentBefore = query(
    v.object({ username, before: v.string() }),
    ({ username, before }) => run((api) => api.profile.getRecent(username, 50, before)),
)

export const setFollow = command(
  v.object({ username, follow: v.boolean() }),
  ({ username, follow }) =>
    run((api) => (follow ? api.profile.follow(username) : api.profile.unfollow(username))),
);

export const setBlock = command(
  v.object({ username, block: v.boolean() }),
  ({ username, block }) =>
    run((api) => (block ? api.profile.block(username) : api.profile.unblock(username))),
);

export const removeFollower = command(
  v.object({ username }),
  ({ username }) => run((api) => api.profile.removeFollower(username)),
);

export const getFollowPage = query(
  followListInput,
  ({ username, kind, before }) =>
    run((api) => kind === "followers"
      ? api.profile.getFollowers(username, before)
      : api.profile.getFollowing(username, before)),
);
