import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createApi } from "$lib/server/api";

export const GET: RequestHandler = async (event) => {
  const { locals, params } = event;
  if (!locals.user) redirect(303, `/auth/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
  if (locals.user.username.toLowerCase() !== params.username.toLowerCase()) {
    return new Response("Not found", { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await createApi(event).account.export();
  } catch {
    return new Response("Export service unavailable", { status: 502 });
  }

  if (upstream.status === 401) {
    redirect(303, `/auth/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
  }

  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  const contentType = upstream.headers.get("content-type");
  const disposition = upstream.headers.get("content-disposition");
  if (contentType) headers.set("Content-Type", contentType);
  if (disposition && upstream.ok) headers.set("Content-Disposition", disposition);

  return new Response(upstream.body, { status: upstream.status, headers });
};
