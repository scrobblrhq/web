import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { api, ApiError } from "$lib/api";
import { serverLL } from "$lib/i18n.server";
import type { UserProfile } from "@scrobblr/types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const LL = serverLL(locals.lang);
  const { username } = params;
  const token = locals.user?.token;

  const profile = await api.profile.getProfile(username, token).catch((e) => {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.friends.error.notFound());
      if (e.status === 403) error(403, LL.friends.error.private());
    }
    error(500, LL.friends.error.loadFailed());
  });

  const friends = await api.profile.getFriends(username, token).catch(() => ({
    followers: [],
    following: [],
  }));

  return {
    profile,
    isOwn: locals.user?.username === username,
    followers: friends.followers as UserProfile[],
    following: friends.following as UserProfile[],
  };
};
