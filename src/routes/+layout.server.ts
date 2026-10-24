import type { LayoutServerLoad } from "./$types";
import { createApi } from "#lib/server/api";

export const load: LayoutServerLoad = async (event) => {
  const { locals } = event;
  let imageUrl: string | null = null;
  let avatarName: string | null = null;


  if (locals.user) {
    try {
      const profile = await createApi(event).profile.getMe();
      imageUrl = profile.image_url ?? null;
      avatarName = profile.display_name ?? null;
    } catch {}
  }

  const { token: _,  ...publicUser } = locals.user ?? {};
  return {
    user: locals.user ? publicUser : undefined,
    lang: locals.lang,
    imageUrl,
    avatarName
  };
};
