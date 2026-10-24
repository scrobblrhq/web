import type { Cookies } from "@sveltejs/kit";
import type { SessionUser, AuthResponse } from "./api/types";

export const SESSION_COOKIE = "scrobblr_session";

export function setSessionCookie(cookies: Cookies, auth: AuthResponse) {
  const session: SessionUser = {
    token: auth.token,
    user_id: auth.user_id,
    username: auth.username
  };
  const expires = new Date(auth.expires_at);

  cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires,
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

export function readSession(cookies: Cookies): SessionUser | undefined {
  const raw = cookies.get(SESSION_COOKIE);
  if (!raw) return undefined;

  try {
    const s = JSON.parse(raw);
    if (
      typeof s?.token === "string" && s.token &&
      typeof s?.user_id === "number" &&
      typeof s?.username === "string" && s.username
    ) {
      return { token: s.token, user_id: s.user_id, username: s.username };
    }
  } catch { }

  return undefined;
}
