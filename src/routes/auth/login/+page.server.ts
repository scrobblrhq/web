import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createApi, ApiConnectionError, ApiError } from "#lib/server/api";
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
          console.error("[auth.login] API rejected the app credentials (HTTP 401)");
          return fail(500, { username, message: LL.login.error.appCredentials() });
        }

        if (err.status === 401)
          return fail(401, { username, message: LL.login.error.invalidCredentials() });
        if (err.status === 429)
          return fail(429, { username, message: LL.login.error.rateLimited() });

        console.error(`[auth.login] API returned HTTP ${err.status}`);
        return fail(502, {
          username,
          message: err.status >= 500
            ? LL.login.error.apiUnavailable(err.status)
            : LL.login.error.apiRejected(err.status),
        });
      }
      if (err instanceof ApiConnectionError) {
        console.error("[auth.login] Could not reach the API", err.cause);
        return fail(502, { username, message: LL.login.error.connectionFailed() });
      }
      console.error("[auth.login] Unexpected error", err);
      return fail(500, {
        username,
        message: LL.login.error.unexpected(),
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
          console.error("[auth.register] API rejected the app credentials (HTTP 401)");
          return fail(500, { username, message: LL.register.error.appCredentials() });
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

        console.error(`[auth.register] API returned HTTP ${err.status}`);
        return fail(502, {
          username,
          email,
          display_name,
          message: err.status >= 500
            ? LL.register.error.apiUnavailable(err.status)
            : LL.register.error.apiRejected(err.status),
        });
      }

      if (err instanceof ApiConnectionError) {
        console.error("[auth.register] Could not reach the API", err.cause);
        return fail(502, {
          username,
          email,
          display_name,
          message: LL.register.error.connectionFailed(),
        });
      }

      console.error("[auth.register] Unexpected error", err);

      return fail(500, {
        username,
        email,
        display_name,
        message: LL.register.error.unexpected(),
      });
    }

    const to = safeRedirectTo(
      String(form.get("redirectTo") || event.url.searchParams.get("redirectTo") || ""),
      "/user"
    )
    redirect(303, to);
  },
};
