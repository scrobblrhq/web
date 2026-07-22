import type { LayoutServerLoad } from "./$types";
import { api } from "$lib/api";

export const load: LayoutServerLoad = async ({ locals }) => {
  let imageUrl: string | null = null;
  let avatarName: string | null = null;

  if (locals.user) {
    try {
      const profile = await api.profile.getMe(locals.user.token);
      imageUrl = profile.image_url ?? null;
      avatarName = profile.display_name ?? null;
    } catch {
      imageUrl = null;
      avatarName = null;
    }
  }

  return { user: locals.user, lang: locals.lang, imageUrl, avatarName };
};
