import type { Cookies } from "@sveltejs/kit";
import type { SessionUser } from "./api/types";

const COOKIE = "scrobblr_session";

const BASE_OPTIONS = {
  httpOnly: true, // JS client can never read it
  secure: true, // HTTPS only
  sameSite: "strict", // CSRF protection
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as const;

export function setSessionCookie(cookies: Cookies, user: SessionUser) {
  cookies.set(COOKIE, JSON.stringify(user), {
    ...BASE_OPTIONS,
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(COOKIE, { path: "/" });
}
