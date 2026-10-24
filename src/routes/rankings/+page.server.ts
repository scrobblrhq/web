import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ApiError, createApi } from "#lib/server/api";
import type { S } from "#lib/api/types";
import { featureCopy } from "#lib/i18n/features";
import { serverLL } from "#lib/i18n.server";

const PERIODS = ["week", "month", "year"] as const;
const PAGE_SIZE = 50;

export const load: PageServerLoad = async (event) => {
  const { url, locals } = event;
  const kind = url.searchParams.get("type") === "tracks" ? "tracks" : "artists";
  const rawPeriod = url.searchParams.get("period");
  const period: S["RankingPeriod"] = PERIODS.includes(rawPeriod as S["RankingPeriod"])
    ? rawPeriod as S["RankingPeriod"]
    : "week";
  const rawOffset = Number(url.searchParams.get("offset") ?? 0);
  const offset = Number.isSafeInteger(rawOffset) && rawOffset >= 0
    ? Math.floor(rawOffset / PAGE_SIZE) * PAGE_SIZE
    : 0;

  try {
    const api = createApi(event);
    const ranking = kind === "artists"
      ? await api.rankings.artists({ period, limit: PAGE_SIZE, offset })
      : await api.rankings.tracks({ period, limit: PAGE_SIZE, offset });
    return { kind, period, offset, ranking, lang: locals.lang };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { kind, period, offset, ranking: null, lang: locals.lang };
    }
    if (err instanceof ApiError && err.status === 429) {
      error(429, serverLL(locals.lang).common.rateLimited());
    }
    error(500, featureCopy(locals.lang).rankings.loadFailed);
  }
};
