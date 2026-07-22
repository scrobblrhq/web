import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { api, ApiError } from "$lib/api";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async ({ params, locals }) => {
  const LL = serverLL(locals.lang);
  const id = Number(params.id);
  if (Number.isNaN(id)) error(400, LL.track.error.invalidId());

  try {
    const track = await api.search.getTrack(id);
    const [artist, listeners, comments, topTracks] = await Promise.all([
      api.search.getArtist(track.artist_id),
      api.catalog.getTrackListeners(id),
      api.comments.getTrackComments(id),
      api.catalog.getArtistTopTracks(track.artist_id, 200).catch(() => []),
    ]);

    // The track endpoint doesn't expose album artwork directly, but the
    // artist's top-tracks listing denormalizes it — reuse that instead of
    // a separate album lookup.
    const cover =
      topTracks.find((t) => t.track_id === track.id)?.album_image ??
      artist.image_url ??
      null;

    return { track, artist, listeners, comments, cover };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.track.error.notFound());
    }
    error(500, LL.track.error.loadFailed());
  }
};

export const actions: Actions = {
  comment: async ({ params, request, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.track.error.notAuthenticated() });
    const body = (await request.formData()).get("body");
    if (typeof body !== "string" || !body.trim())
      return fail(400, { message: LL.track.error.emptyComment() });
    try {
      const comment = await api.comments.postTrackComment(
        Number(params.id),
        { body },
        locals.user.token,
      );
      return { comment };
    } catch (e) {
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.track.error.commentFailed() });
    }
  },
  deleteComment: async ({ request, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.track.error.notAuthenticated() });
    const commentId = (await request.formData()).get("commentId");
    if (typeof commentId !== "string") return fail(400);
    try {
      await api.comments.deleteComment(Number(commentId), locals.user.token);
      return { deleted: true };
    } catch (e) {
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.track.error.deleteFailed() });
    }
  },
};
