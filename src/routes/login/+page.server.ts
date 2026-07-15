import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { api, ApiError } from "$lib/api";
import { setSessionCookie } from "$lib/session";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) redirect(303, `/user`);
};

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const LL = serverLL(locals.lang);
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!username || !password) {
      return fail(400, { username, message: LL.login.error.emptyFields() });
    }

    try {
      const user = await api.auth.login({ username, password });
      setSessionCookie(cookies, user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return fail(401, {
          username,
          message: LL.login.error.invalidCredentials(),
        });
      }
      return fail(500, {
        username,
        message: LL.login.error.serverError(),
      });
    }

    redirect(303, `/user`);
  },
};
