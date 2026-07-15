import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import type { TimePeriod } from "$lib/api/types";
import { api, ApiError } from "$lib/api";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const LL = serverLL(locals.lang);

  const { username } = params;
  const token = locals.user?.token;
  const period: TimePeriod =
    (url.searchParams.get("period") as TimePeriod) ?? "overall";

  const profilePromise = api.profile.getProfile(username, token).catch((e) => {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.profile.error.notFound());
      if (e.status === 403) error(403, LL.profile.error.private());
    }
    error(500, LL.profile.error.loadFailed());
  });

  const recentPromise = api.profile.getRecent(username, 15, token).catch(() => []);
  const topArtistsPromise = api.profile
    .getTopArtists(username, period, 10, token)
    .catch(() => []);
  const topTracksPromise = api.profile
    .getTopTracks(username, period, 10, token)
    .catch(() => []);
  const heatmapPromise = api.profile.getHeatmap(username, token).catch(() => []);
  const profile = await profilePromise;

  const friends = await api.profile.getFriends(username, token).catch(() => ({
    followers: [],
    following: [],
  }));

  return {
    profile,
    followers: friends.followers,
    isOwn: locals.user?.username === username,
    recent: recentPromise,
    topArtists: topArtistsPromise,
    topTracks: topTracksPromise,
    heatmap: heatmapPromise,
  };
};

export const actions: Actions = {
  follow: async ({ params, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.profile.error.notAuthenticated() });
    try {
      await api.profile.follow(params.username, locals.user.token);
      return { is_following: true };
    } catch (e) {
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.profile.error.follow() });
    }
  },
  unfollow: async ({ params, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.profile.error.notAuthenticated() });
    try {
      await api.profile.unfollow(params.username, locals.user.token);
      return { is_following: false };
    } catch (e) {
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.profile.error.unfollow() });
    }
  },
};
