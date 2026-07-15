import type { Handle } from "@sveltejs/kit";

const SESSION_COOKIE = "scrobblr_session";
const LANG_COOKIE = "scrobblr_lang";

export const handle: Handle = async ({ event, resolve }) => {
  const raw = event.cookies.get(SESSION_COOKIE);

  if (raw) {
    try {
      const session = JSON.parse(raw);
      if (session?.token && session?.username) {
        event.locals.user = session;
      }
    } catch {}
  }

  const lang = event.cookies.get(LANG_COOKIE) || "es";
  event.locals.lang = lang;

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('<html lang="en">', `<html lang="${lang}">`),
  });
};
