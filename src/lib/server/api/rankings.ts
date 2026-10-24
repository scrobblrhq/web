import type { S } from "#lib/api/types";
import { request, type ApiEvent } from "./request";

type RankingParams = {
  period: S["RankingPeriod"];
  limit: number;
  offset: number;
};

const query = (params: RankingParams) => new URLSearchParams({
  period: params.period,
  limit: String(params.limit),
  offset: String(params.offset),
});

export const rankingsApi = (event: ApiEvent) => ({
  artists: (params: RankingParams) =>
    request<S["ArtistRanking"]>(event, `/v1/rankings/artists?${query(params)}`, { auth: false }),
  tracks: (params: RankingParams) =>
    request<S["TrackRanking"]>(event, `/v1/rankings/tracks?${query(params)}`, { auth: false }),
});
