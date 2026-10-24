import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ApiError, createApi } from "$lib/server/api";
import { parseId } from "$lib/server/params";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async (event) => {
  const LL = serverLL(event.locals.lang);
  const id = parseId(event.params.id);
  if (id === null) error(400, LL.track.error.invalidId());

  const api = createApi(event);
  try {
    const album = await api.search.getAlbum(id);
    const artist = await api.search.getArtist(album.artist_id);
    return { album, artist };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.track.error.notFound());
      if (e.status === 429) error(429, LL.common.rateLimited());
    }
    error(500, LL.track.error.loadFailed());
  }
};
