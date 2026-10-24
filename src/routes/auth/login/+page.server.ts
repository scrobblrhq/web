import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createApi, ApiError } from "#lib/server/api";
import { setSessionCookie } from "#lib/session";
import { serverLL } from "#lib/i18n.server";
import { safeRedirectTo } from "#lib/server/redirect";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const PASSWORD_INVALID_CHARS_REGEX = /[\x00-\x1f\x7f]/;

export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.user)
    redirect(303, safeRedirectTo(
      url.searchParams.get("redirectTo"),
      "/user"
    ));
};

export const actions: Actions = {
  login: async (event) => {
    const { request, cookies, locals } = event;

    const LL = serverLL(locals.lang);
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!username || !password) {
      return fail(400, { username, message: LL.login.error.emptyFields() });
    }

    try {
      const user = await createApi(event).auth.login({ username, password });
      setSessionCookie(cookies, user);
      if (user.account_restored) redirect(303, `/user/${user.username}/settings?restored=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 && err.message === "untrusted client") {
          return fail(500, { username, message: LL.login.error.serverError() });
        }

        if (err.status === 401)
          return fail(401, { username, message: LL.login.error.invalidCredentials() });
        if (err.status === 429)
          return fail(429, { username, message: LL.login.error.rateLimited() });
      }
      return fail(500, {
        username,
        message: LL.login.error.serverError(),
      });
    }

    const to = safeRedirectTo(
      String(form.get("redirectTo") || event.url.searchParams.get("redirectTo") || ""),
      "/user"
    )
    redirect(303, to);
  },

  register: async (event) => {
    const { request, cookies, locals } = event;
    const LL = serverLL(locals.lang);
    const form = await request.formData();
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const email_confirm = String(form.get("email_confirm") ?? "")
      .trim()
      .toLowerCase();
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

    if (username.length > 32) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.usernameTooLong(),
      });
    }

    if (!USERNAME_REGEX.test(username)) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.usernameInvalidChars(),
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

    if (password.length > 128) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.passwordTooLong(),
      });
    }

    if (PASSWORD_INVALID_CHARS_REGEX.test(password)) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.passwordInvalidChars(),
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.invalidEmail(),
      });
    }

    if (email !== email_confirm) {
      return fail(400, {
        username,
        email,
        display_name,
        message: LL.register.error.emailMismatch(),
      });
    }

    try {
      const user = await createApi(event).auth.register({
        username,
        email,
        password,
        display_name,
      });
      setSessionCookie(cookies, user);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 && err.message === "untrusted client") {
          return fail(500, { username, message: LL.login.error.serverError() });
        }

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

    const to = safeRedirectTo(
      String(form.get("redirectTo") || event.url.searchParams.get("redirectTo") || ""),
      "/user"
    )
    redirect(303, to);
  },
};
