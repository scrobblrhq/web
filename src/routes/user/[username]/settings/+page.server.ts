import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { createApi, ApiError } from "$lib/server/api";
import type { ApiToken, ConnectedAccount, S } from "$lib/api/types";
import { serverLL } from "$lib/i18n.server";
import { featureCopy } from "$lib/i18n/features";
import { clearSessionCookie } from "$lib/session";

const PROVIDERS = ["spotify", "lastfm"] as const;
type Provider = (typeof PROVIDERS)[number];
const MAX_AVATAR = 8 * 1024 * 1024; // 8 MiB

const failForm = (e: unknown, fallback: string) =>
  e instanceof ApiError
    ? fail(e.status, { message: e.message })
    : fail(500, { message: fallback });

export const load: PageServerLoad = async (event) => {
  const { locals, params, url } = event;
  const loginUrl = `/auth/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`;

  if (!locals.user) redirect(303, loginUrl);
  if (locals.user.username !== params.username)
    redirect(303, `/user/${locals.user.username}/settings`);

  const api = createApi(event);
  const [tokens, connections, profile, imports, scrobblerCredentials] = await Promise.all([
    api.tokens.list().catch((): ApiToken[] => []),
    api.auth.listConnections().catch((): ConnectedAccount[] => []),
    api.profile.getMe().catch((e) => {
      if (e instanceof ApiError && e.status == 401) redirect(301, loginUrl);
      throw e;
    }),
    api.imports.list().catch((): S["ScrobbleImport"][] => []),
    api.scrobbler.listCredentials().catch((): S["ScrobblerCredential"][] => []),
  ]);

  return { tokens, connections, profile, imports, scrobblerCredentials }
};

export const actions: Actions = {
  createToken: async (event) => {
    const { locals, request } = event;
    const api = createApi(event);

    const LL = serverLL(locals.lang);
    if (!locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const rawDays = form.get("expires_days");
    const expires_days = rawDays ? Number(rawDays) : undefined;

    if (!name) return fail(400, { message: LL.settings.error.nameRequired() });
    if (name.length > 64)
      return fail(400, { message: LL.settings.error.nameTooLong() });
    if (expires_days !== undefined && (!Number.isInteger(expires_days) || expires_days < 1))
      return fail(400, { message: LL.settings.error.createFailed() });

    try {
      const created = await api.tokens.create({
        name,
        expires_days,
        scopes: ["scrobble"],
      });

      return { created };
    } catch (err) {
      return failForm(err, LL.settings.error.createFailed());
    }
  },

  revokeToken: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const id = String((await event.request.formData()).get("id") ?? "").trim();
    if (!id) return fail(400, { message: LL.settings.error.idRequired() });

    try {
      await createApi(event).tokens.revoke(id);
      return { revoked: id }
    } catch (err) {
      return failForm(err, LL.settings.error.revokeFailed());
    }
  },

  createScrobblerToken: async (event) => {
    const LL = serverLL(event.locals.lang);
    const copy = featureCopy(event.locals.lang).scrobbler;
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const name = String((await event.request.formData()).get("name") ?? "").trim();
    if (!name) return fail(400, { message: copy.nameRequired });
    if (name.length > 100) return fail(400, { message: copy.nameTooLong });

    try {
      const created = await createApi(event).scrobbler.createToken(name);
      return { createdScrobblerToken: created };
    } catch (err) {
      return failForm(err, copy.createFailed);
    }
  },

  revokeScrobblerCredential: async (event) => {
    const LL = serverLL(event.locals.lang);
    const copy = featureCopy(event.locals.lang).scrobbler;
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const id = String((await event.request.formData()).get("id") ?? "").trim();
    if (!id) return fail(400, { message: copy.revokeFailed });

    try {
      await createApi(event).scrobbler.revokeCredential(id);
      return { revokedScrobblerCredential: id };
    } catch (err) {
      return failForm(err, copy.revokeFailed);
    }
  },

  deleteAccount: async (event) => {
    const LL = serverLL(event.locals.lang);
    const copy = featureCopy(event.locals.lang).account;
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const form = await event.request.formData();
    const confirm = String(form.get("confirm") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (confirm.toLowerCase() !== event.locals.user.username.toLowerCase() || !password)
      return fail(400, { message: copy.deleteFailed });

    let scheduled: S["DeletionScheduled"];
    try {
      scheduled = await createApi(event).account.delete({ confirm, password });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400)
        return fail(400, { message: copy.deleteFailed });
      return failForm(err, copy.deleteFailed);
    }
    clearSessionCookie(event.cookies);
    event.locals.user = undefined;
    redirect(303, `/auth/login?deleted=1&until=${encodeURIComponent(scheduled.delete_after)}`);
  },

  connect: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user)
      return fail(401, { message: LL.settings.error.notAuthenticated() });

    const provider = String((await event.request.formData()).get("provider") ?? "");
    if (!PROVIDERS.includes(provider as Provider))
      return fail(400, { message: LL.settings.error.saveFailed() });

    let authorizeUrl: string;
    try {
      ({ authorize_url: authorizeUrl } = await createApi(event).auth.connect(provider as Provider));
    } catch (err) {
      return failForm(err, LL.settings.error.saveFailed());
    }

    redirect(303, authorizeUrl);
  },

  disconnect: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const provider = String((await event.request.formData()).get("provider") ?? "");
    if (!PROVIDERS.includes(provider as Provider))
      return fail(400, { message: LL.settings.error.saveFailed() });

    try {
      await createApi(event).auth.disconnect(provider);
      return { disconnected: provider };
    } catch (err) {
      return failForm(err, LL.settings.error.disconnectFailed());
    }
  },

  startLastfmImport: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const full = (await event.request.formData()).get("full") === "true";
    try {
      const startedImport = await createApi(event).imports.startLastfm(full);
      return { startedImport };
    } catch (err) {
      return failForm(err, LL.settings.import.startFailed());
    }
  },

  cancelLastfmImport: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const rawId = String((await event.request.formData()).get("id") ?? "");
    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id <= 0)
      return fail(400, { message: LL.settings.import.invalidId() });

    try {
      await createApi(event).imports.cancel(id);
      return { cancelledImportId: id };
    } catch (err) {
      return failForm(err, LL.settings.import.cancelFailed());
    }
  },

  saveSettings: async (event) => {
    const LL = serverLL(event.locals.lang);
    if (!event.locals.user) return fail(401, { message: LL.settings.error.notAuthenticated() });

    const form = await event.request.formData();
    const text = (k: string) => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim() : undefined // undefined = don't send
    };
    const is_private = form.get("is_private") === "true";
    const removeAvatar = form.get("remove_avatar") === "true";
    const avatar = form.get("avatar");

    if (avatar instanceof File && avatar.size > MAX_AVATAR)
      return fail(413, { message: LL.settings.error.saveFailed() });
    if (avatar instanceof File && avatar.size > 0 && !avatar.type.startsWith("image/"))
      return fail(400, { message: LL.settings.error.saveFailed() });

    try {
      const api = createApi(event);
      let profile;

      if (avatar instanceof File && avatar.size > 0) {
        profile = await api.profile.uploadAvatar(avatar);
      }

      profile = await api.profile.updateProfile({
          is_private,
          display_name: text("display_name"),
          bio: text("bio"),
          ...(removeAvatar ? { image_url: "" } : {}),
        });

      return { saved: true, profile };
    } catch (err) {
      return failForm(err, LL.settings.error.saveFailed());
    }
  },
};
