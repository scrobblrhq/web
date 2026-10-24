import { query } from "$app/server";
import * as v from "valibot";
import { run } from "$lib/server/api";

export const search = query(
  v.object({
    q: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(100)),
    filter: v.picklist(["all", "artist", "track", "user"]),
  }),
  ({ q, filter }) => run(async (api) => {
    const results = await api.search.search(q, 15, filter);
    const albumIds = [...new Set(results.tracks.flatMap((track) =>
      track.album_id === null ? [] : [track.album_id],
    ))];
    const albums = new Map<number, Awaited<ReturnType<typeof api.search.getAlbum>> | null>();

    await Promise.all(albumIds.map(async (id) => {
      try {
        albums.set(id!, await api.search.getAlbum(id!));
      } catch {
        albums.set(id!, null);
      }
    }));

    return {
      ...results,
      tracks: results.tracks.map((track) => ({
        ...track,
        album: track.album_id === null ? null : albums.get(track.album_id!) ?? null,
      })),
    };
  }),
);
