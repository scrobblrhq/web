import type { Handle } from "@sveltejs/kit/hooks";
import { dev } from "$app/env";
import { clearSessionCookie, readSession, SESSION_COOKIE } from "#lib/session";

const LANG_COOKIE = "scrobblr_lang";

export const handle: Handle = async ({ event, resolve }) => {
  const user = readSession(event.cookies);
  event.locals.user = user;
  if (!user && event.cookies.get(SESSION_COOKIE)) clearSessionCookie(event.cookies);

  const lang = event.cookies.get(LANG_COOKIE) === "en" ? "en" : "es";
  event.locals.lang = lang;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang)
  });

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      `img-src 'self' https: data: blob: ${dev ? "http://127.0.0.1:8080" : ""}`,
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
      "script-src 'self' 'unsafe-inline'",
      `connect-src 'self'`,
    ].join("; "),
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
};
