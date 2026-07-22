import type { RequestHandler } from "./$types";
import { API_URL } from "$app/env/public";

export const GET: RequestHandler = async ({ params, locals, fetch, request }) => {
  const headers: Record<string, string> = {};
  if (locals.user?.token) {
    headers.Authorization = `Bearer ${locals.user.token}`;
  }

  const upstream = await fetch(`${API_URL}/v1/user/${params.username}/live`, {
    headers,
    signal: request.signal,
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
