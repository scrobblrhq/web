import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createApi, ApiError } from "#lib/server/api";
import { clearSessionCookie } from "#lib/session";
import { serverLL } from "#lib/i18n.server";

export const actions: Actions = {
  default: async (event) => {
    const { cookies, locals } = event;
    const all = (await event.request.formData()).get("all") === "true";

    if (locals.user) {
      try {
        await createApi(event).auth.logout(all).catch(() => {});
      } catch (e) {
        const expired = e instanceof ApiError && e.status === 401;
        if (all && !expired) {
          return fail(e instanceof ApiError ? e.status : 500, {
            message: serverLL(locals.lang).settings.error.logoutAllFailed()
          })
        }
      }
    }

    clearSessionCookie(cookies);
    locals.user = undefined;
    redirect(303, "/");
  },
};
