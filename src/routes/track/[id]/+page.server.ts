import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { createApi, ApiError } from "$lib/server/api";
import { parseId } from "$lib/server/params";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async (event) => {
  const { params, locals } = event;
  const api = createApi(event);

  const LL = serverLL(locals.lang);
  const id = parseId(params.id);
  if (id === null) error(400, LL.track.error.invalidId());

  try {
    const track = await api.search.getTrack(id);
    const [artist, listeners, comments, topTracks] = await Promise.all([
      api.search.getArtist(track.artist_id),
      api.catalog.getTrackListeners(id),
      api.comments.getTrackComments(id),
      api.catalog.getArtistTopTracks(track.artist_id, 200).catch(() => []),
    ]);

    const album = track.album_id === null ? null : await api.search.getAlbum(track.album_id).catch(() => null);
    const cover = album?.image_url ?? null;

    return { track, artist, listeners, comments, cover, album };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.track.error.notFound());
      if (e.status === 429) error(429, LL.common.rateLimited());
    }
    error(500, LL.track.error.loadFailed());
  }
};

export const actions: Actions = {
  comment: async (event) => {
    const { params, request, locals } = event;
    const api = createApi(event);

    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.track.error.notAuthenticated() });
    const id = parseId(params.id);
    if (id === null) return fail(400, { message: LL.track.error.invalidId() });
    const body = (await request.formData()).get("body");
    if (typeof body !== "string" || !body.trim())
      return fail(400, { message: LL.track.error.emptyComment() });
    try {
      const comment = await api.comments.postTrackComment(id, { body });
      return { comment };
    } catch (e) {
      if (e instanceof ApiError && e.status === 429)
        return fail(429, { message: LL.common.rateLimited() });
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.track.error.commentFailed() });
    }
  },
  deleteComment: async (event) => {
    const { request, locals } = event;
    const id = parseId(event.params.id);
    const api = createApi(event);

    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.track.error.notAuthenticated() });
    if (id === null) return fail(400, { message: LL.track.error.invalidId() });
    const commentId = (await request.formData()).get("commentId");
    if (typeof commentId !== "string") return fail(400);
    try {
      const parsedCommentId = parseId(commentId);
      if (parsedCommentId === null) return fail(400, { message: LL.track.error.deleteFailed() });
      await api.comments.deleteComment(parsedCommentId);
      return { deleted: true };
    } catch (e) {
      if (e instanceof ApiError && e.status === 429)
        return fail(429, { message: LL.common.rateLimited() });
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.track.error.deleteFailed() });
    }
  },
};
