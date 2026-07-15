import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { api, ApiError } from "$lib/api";
import { setSessionCookie } from "$lib/session";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(303, `/user/${locals.user.username}`);
};

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const LL = serverLL(locals.lang);
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const display_name =
      String(form.get("display_name") ?? "").trim() || undefined;

    if (!username || !email || !password) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.emptyFields(),
      });
    }

    if (username.length < 2) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.usernameTooShort(),
      });
    }

    if (password.length < 8) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.passwordTooShort(),
      });
    }

    if (!email.includes("@")) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.invalidEmail(),
      });
    }

    try {
      const user = await api.auth.register({
        username,
        email,
        password,
        display_name,
      });
      setSessionCookie(cookies, user);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          return fail(409, {
            username,
            email,
            display_name,
            message: LL.register.error.conflict(),
          });
        }

        if (err.status === 400) {
          return fail(400, {
            username,
            email,
            display_name,
            message: err.message,
          });
        }
      }

      return fail(500, {
        username,
        email,
        display_name,
        message: LL.register.error.serverError(),
      });
    }

    redirect(303, `/user/${username}`);
  },
};
