import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createApi, ApiError } from "$lib/server/api";
import { serverLL } from "$lib/i18n.server";

const loginUrl = (url: URL) =>
  `/auth/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`;

function parseHttpUrl(raw: string | null): URL | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u : null;
  } catch {
    return null;
  }
}

function failApprove(e: unknown, LL: ReturnType<typeof serverLL>) {
  if (e instanceof ApiError) {
    if (e.status === 401) return fail(401, { message: LL.scrobbler.error.signedOut() });
    if (e.status === 429) return fail(429, { message: LL.common.rateLimited() });
    if (e.status < 500) return fail(e.status, { message: e.message });
  }
  return fail(500, { message: LL.scrobbler.error.approveFailed() });
}

export const load: PageServerLoad = async (event) => {
  const { url, locals } = event;
  const LL = serverLL(locals.lang);

  if (!locals.user) redirect(303, loginUrl(url));

  const apiKey = url.searchParams.get("api_key")?.trim() ?? "";
  const token = url.searchParams.get("token")?.trim() ?? "";
  if (!apiKey) error(400, LL.scrobbler.error.invalidRequest());

  if (token) {
    try {
      const auth = await createApi(event).scrobbler.getAuthorization(token);
      return {
        flow: "token" as const,
        token,
        apiKey: auth.api_key,
        status: auth.status,
      };
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) redirect(303, loginUrl(url));
        if (e.status === 404) error(404, LL.scrobbler.error.notFound());
        if (e.status === 429) error(429, LL.common.rateLimited());
      }
      error(500, LL.scrobbler.error.loadFailed());
    }
  }

  const callback = parseHttpUrl(url.searchParams.get("cb"));
  if (!callback) error(400, LL.scrobbler.error.invalidCallback());

  return {
    flow: "callback" as const,
    apiKey,
    callback: callback.href,
    callbackHost: callback.host,
  };
};

export const actions: Actions = {
  approveToken: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.scrobbler.error.signedOut() });

    const token = String((await event.request.formData()).get("token") ?? "").trim();
    if (!token) return fail(400, { message: LL.scrobbler.error.invalidRequest() });

    try {
      await createApi(event).scrobbler.approve(token);
      return { approved: true as const };
    } catch (e) {
      return failApprove(e, LL);
    }
  },

  approveCallback: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.scrobbler.error.signedOut() });

    const form = await event.request.formData();
    const apiKey = String(form.get("api_key") ?? "").trim();
    const callback = parseHttpUrl(String(form.get("callback") ?? ""));
    if (!apiKey || !callback)
      return fail(400, { message: LL.scrobbler.error.invalidRequest() });

    let target: URL | null;
    try {
      const res = await createApi(event).scrobbler.authorizeCallback({
        api_key: apiKey,
        callback: callback.href,
      });
      target = parseHttpUrl(res.redirect_url);
    } catch (e) {
      return failApprove(e, LL);
    }
    if (!target) return fail(502, { message: LL.scrobbler.error.approveFailed() });

    redirect(303, target.href);
  },
};
