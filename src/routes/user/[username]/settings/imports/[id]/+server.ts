import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ApiError, createApi } from "$lib/server/api";

export const GET: RequestHandler = async (event) => {
  if (!event.locals.user) error(401, "Not authenticated");
  if (event.locals.user.username !== event.params.username) error(403, "Forbidden");

  const id = Number(event.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) error(400, "Invalid import id");

  try {
    return json(await createApi(event).imports.get(id));
  } catch (cause) {
    if (cause instanceof ApiError) error(cause.status, cause.message);
    error(500, "Could not load import progress");
  }
};
