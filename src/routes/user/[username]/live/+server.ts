import type { RequestHandler } from "./$types";
import { createApi } from "$lib/server/api";

export const GET: RequestHandler = async ({
  params,
  locals,
  cookies,
  request,
  getClientAddress
}) => {
  let upstream: Response;
  try {
    upstream = await createApi({ getClientAddress, locals, cookies }).profile.getLive(
      params.username,
      request.signal,
    );
  } catch {
    return new Response(null, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(await upstream.text().catch(() => null), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "text/plain"
      }
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    },
  });
};
