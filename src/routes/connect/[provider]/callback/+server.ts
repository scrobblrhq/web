import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createApi, ApiError } from "#lib/server/api";

const PROVIDERS = ["spotify", "lastfm"] as const;

const RESULT: Record<number, string> = {
  409: "conflict",
  429: "rate_limited",
  503: "unavailable",
};

export const GET: RequestHandler = async (event) => {
  const { params, url, locals } = event;

  const provider = PROVIDERS.find((p) => p === params.provider);
  if (!provider) error(404, "Not found");

  if (!locals.user) {
    redirect(303, `/auth/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const username = locals.user.username;
  const back = (result: string) =>
    `/user/${encodeURIComponent(username)}/settings?connect=${result}&provider=${provider}#connections`;

  if (url.searchParams.has("error")) redirect(303, back("denied"));

  const state = url.searchParams.get("state");
  const proof = url.searchParams.get(provider === "spotify" ? "code" : "token");
  if (!state || !proof) redirect(303, back("invalid"));

  let result = "ok";
  try {
    await createApi(event).auth.finishConnect(provider, {
      state,
      ...(provider === "spotify" ? { code: proof } : { token: proof }),
    });
  } catch (e) {
    result = e instanceof ApiError ? (RESULT[e.status] ?? "failed") : "failed";
  }

  redirect(303, back(result));
};
