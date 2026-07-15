import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { api } from "$lib/api";
import { clearSessionCookie } from "$lib/session";

export const actions: Actions = {
  default: async ({ cookies, locals }) => {
    if (locals.user) {
      await api.auth.logout(locals.user.token).catch(() => {});
    }
    clearSessionCookie(cookies);
    redirect(303, "/");
  },
};
