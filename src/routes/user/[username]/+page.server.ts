import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { TimePeriod, UserProfile } from "$lib/api/types";
import { createApi, ApiError } from "$lib/server/api";
import { serverLL } from "$lib/i18n.server";
import { PERIODS } from "$lib/periods";

export const load: PageServerLoad = async (event) => {
  const { params, locals, url } = event;
  const api = createApi(event);
  const LL = serverLL(locals.lang);

  const { username } = params;
  const raw = url.searchParams.get("period");
  const period: TimePeriod = PERIODS.includes(raw as TimePeriod)
    ? (raw as TimePeriod)
    : "overall";

  const profilePromise = api.profile.getProfile(username).catch((e) => {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.profile.error.notFound());
      if (e.status === 403) error(403, LL.profile.error.private());
    }
    error(500, LL.profile.error.loadFailed());
  });

  const withRateLimit = <T>(promise: Promise<T>, fallback: T) => promise.catch((e) => {
    if (e instanceof ApiError && e.status === 429) error(429, LL.common.rateLimited());
    return fallback;
  });
  const recentPromise = withRateLimit(api.profile.getRecent(username, 15), []);
  const topArtistsPromise = api.profile
    .getTopArtists(username, period, 10)
    .catch((e) => {
      if (e instanceof ApiError && e.status === 429) error(429, LL.common.rateLimited());
      return [];
    });
  const topTracksPromise = api.profile
    .getTopTracks(username, period, 10)
    .catch((e) => {
      if (e instanceof ApiError && e.status === 429) error(429, LL.common.rateLimited());
      return [];
    });
  const heatmapPromise = withRateLimit(api.profile.getHeatmap(username), []);
  const profile = await profilePromise;

  const [friends, blockedUsers] = await Promise.all([
    api.profile.getFriends(username).catch((e) => {
      if (e instanceof ApiError && e.status === 429) error(429, LL.common.rateLimited());
      return { followers: [], following: [] };
    }),
    locals.user
      ? api.profile.getBlocks().catch(() => ({ entries: [] }))
      : Promise.resolve({ entries: [] }),
  ]);

  return {
    profile,
    followers: friends.followers as UserProfile[],
    isBlocked: blockedUsers.entries.some((blocked) => blocked.username === profile.username),
    isOwn: locals.user?.username === username,
    recent: recentPromise,
    topArtists: topArtistsPromise,
    topTracks: topTracksPromise,
    heatmap: heatmapPromise,
  };
};
