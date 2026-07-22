import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { api, ApiError } from "$lib/api";
import type { ApiToken } from "$lib/api/types";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) redirect(303, "/login");
  if (locals.user.username !== params.username)
    redirect(403, `/user/${locals.user.username}/settings`);

  let tokens: ApiToken[] = [];
  try {
    tokens = await api.tokens.list(locals.user.token);
  } catch {
  } finally {
    return {
      tokens,
      profile: await api.profile.getMe(locals.user.token),
    };
  }
};

export const actions: Actions = {
  createToken: async ({ request, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const expires_days = form.get("expires_days")
      ? Number(form.get("expires_days"))
      : undefined;

    if (!name) return fail(400, { message: LL.settings.error.nameRequired() });
    if (name.length > 64)
      return fail(400, {
        message: LL.settings.error.nameTooLong(),
      });

    try {
      const created = await api.tokens.create(locals.user.token, {
        name,
        expires_days,
        scopes: ["scrobble"],
      });

      return { created };
    } catch (err) {
      if (err instanceof ApiError)
        return fail(err.status, { message: err.message });
      return fail(500, { message: LL.settings.error.createFailed() });
    }
  },

  revokeToken: async ({ request, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const form = await request.formData();
    const id = String(form.get("id") ?? "").trim();

    if (!id) return fail(400, { message: LL.settings.error.idRequired() });

    try {
      await api.tokens.revoke(locals.user.token, id);
      return { revoked: id };
    } catch (err) {
      if (err instanceof ApiError) fail(err.status, { message: err.message });
      return fail(500, { message: LL.settings.error.revokeFailed() });
    }
  },

  saveSettings: async ({ request, locals }) => {
    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const form = await request.formData();
    const is_private = form.get("is_private") === "true";
    const display_name = String(form.get("display_name") ?? null).trim();
    const bio = String(form.get("bio") ?? null).trim();
    const removeAvatar = form.get("remove_avatar") === "true";
    const avatar = form.get("avatar");

    try {
      let profile;

      if (avatar instanceof File && avatar.size > 0) {
        profile = await api.profile.uploadAvatar(avatar, locals.user.token);
      }

      profile = await api.profile.updateProfile(
        {
          is_private,
          display_name,
          bio,
          ...(removeAvatar ? { image_url: "" } : {}),
        },
        locals.user.token,
      );

      return { saved: true, profile };
    } catch (err) {
      if (err instanceof ApiError)
        return fail(err.status, { message: err.message });
      return fail(500, { message: LL.settings.error.saveFailed() });
    }
  },
};
