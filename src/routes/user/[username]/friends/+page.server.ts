import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createApi, ApiError } from "#lib/server/api";
import { serverLL } from "#lib/i18n.server";

export const load: PageServerLoad = async (event) => {
  const { params, locals } = event;
  const { username } = params;
  const LL = serverLL(locals.lang);
  const api = createApi(event);

  const profile = await api.profile.getProfile(username).catch((e) => {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.friends.error.notFound());
      if (e.status === 403) error(403, LL.friends.error.private());
    }
    error(500, LL.friends.error.loadFailed());
  });

  const [followers, following, blockedUsers] = await Promise.all([
    api.profile.getFollowers(username).catch(() => ({ entries: [], next: null })),
    api.profile.getFollowing(username).catch(() => ({ entries: [], next: null })),
    locals.user
      ? api.profile.getBlocks().catch(() => ({ entries: [] }))
      : Promise.resolve({ entries: [] }),
  ]);

  return {
    profile,
    isOwn: locals.user?.username === username,
    followers: followers.entries,
    following: following.entries,
    followersNext: followers.next ?? null,
    followingNext: following.next ?? null,
    blockedUsernames: blockedUsers.entries.map((blocked) => blocked.username),
  };
};
