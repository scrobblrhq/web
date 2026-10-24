import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { createApi, ApiError } from "$lib/server/api";
import { parseId } from "$lib/server/params";
import { serverLL } from "$lib/i18n.server";

const MAX_IMAGE = 8 * 1024 * 1024; // 8 MiB

export const load: PageServerLoad = async (event) => {
  const { params, locals } = event;
  const api = createApi(event);
  const LL = serverLL(locals.lang);

  const id = parseId(params.id);
  if (id === null) error(400, LL.artist.error.invalidId());

  try {
    const [artist, topTracks, listeners, images, comments] = await Promise.all([
      api.search.getArtist(id),
      api.catalog.getArtistTopTracks(id, 5),
      api.catalog.getArtistListeners(id, 10),
      api.images.getArtistImages(id),
      api.comments.getArtistComments(id),
    ]);
    console.log(artist, topTracks, listeners);
    return { artist, topTracks, listeners, images, comments };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) error(404, LL.artist.error.notFound());
      if (e.status === 429) error(429, LL.common.rateLimited());
    }
    error(500, LL.artist.error.loadFailed());
  }
};

export const actions: Actions = {
  proposeImage: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user)
      return fail(401, { message: LL.artist.error.notAuthenticated() });

    const id = parseId(event.params.id);
    if (id === null) return fail(400, { message: LL.artist.error.invalidId() });

    const file = (await event.request.formData()).get("image");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_IMAGE ||
      !file.type.startsWith("image/")
    )
      return fail(400, { message: LL.artist.error.invalidImage() });

    try {
      const images = await createApi(event).images.proposeArtistImage(id, file);
      return { images };
    } catch (e) {
      if (e instanceof ApiError && e.status === 429)
        return fail(429, { message: LL.common.rateLimited() });
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.artist.error.uploadFailed() });
    }
  },

  comment: async (event) => {
    const { params, request, locals } = event;
    const LL = serverLL(locals.lang);
    if (!locals.user)
      return fail(401, { message: LL.artist.error.notAuthenticated() });

    const id = parseId(params.id);
    if (id === null) return fail(400, { message: LL.artist.error.invalidId() });

    const body = (await request.formData()).get("body");
    if (typeof body !== "string" || !body.trim())
      return fail(400, { message: LL.artist.error.emptyComment() });

    try {
      const comment = await createApi(event).comments.postArtistComment(id, { body });
      return { comment };
    } catch (e) {
      if (e instanceof ApiError && e.status === 429)
        return fail(429, { message: LL.common.rateLimited() });
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.artist.error.commentFailed() });
    }
  },

  deleteComment: async (event) => {
    const { request, locals } = event;
    const LL = serverLL(locals.lang);
    if (!locals.user)
      return fail(401, { message: LL.artist.error.notAuthenticated() });

    const commentId = parseId(String((await request.formData()).get("commentId") ?? ""));
    if (commentId === null)
      return fail(400, { message: LL.artist.error.deleteFailed() });

    try {
      await createApi(event).comments.deleteComment(commentId);
      return { deleted: true };
    } catch (e) {
      if (e instanceof ApiError && e.status === 429)
        return fail(429, { message: LL.common.rateLimited() });
      if (e instanceof ApiError) return fail(e.status, { message: e.message });
      return fail(500, { message: LL.artist.error.deleteFailed() });
    }
  },
};
