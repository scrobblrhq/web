import type { RequestHandler } from "./$types";
import { createApi } from "#lib/server/api";

const periods = ["week", "month", "year"] as const;
const PAGE_SIZE = 50;

function xml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]!);
}

export const GET: RequestHandler = async (event) => {
  const { url } = event;
  const api = createApi(event);
  const routes = new Set([
    "/",
    "/rankings",
    ...periods.flatMap((period) => [
      `/rankings?type=artists&period=${period}&offset=0`,
      `/rankings?type=tracks&period=${period}&offset=0`,
    ]),
  ]);

  // Rankings expose public catalog entities but there is no catalog-wide listing API.
  // Include the current top 50 for each period and let these pages lead crawlers onward.
  const rankingPages = await Promise.allSettled(
    periods.flatMap((period) => [
      api.rankings.artists({ period, limit: PAGE_SIZE, offset: 0 }),
      api.rankings.tracks({ period, limit: PAGE_SIZE, offset: 0 }),
    ]),
  );

  for (const result of rankingPages) {
    if (result.status !== "fulfilled") continue;
    const page = result.value;
    for (const entry of page.entries) {
      if ("artist_id" in entry) routes.add(`/artist/${entry.artist_id}`);
      if ("track_id" in entry) routes.add(`/track/${entry.track_id}`);
    }
  }

  const entries = [...routes]
    .map((route) => `  <url><loc>${xml(new URL(route, url).href)}</loc></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
    },
  });
};
