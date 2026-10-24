import type { PageServerLoad } from './$types';
import { error } from "@sveltejs/kit";
import { ApiError, createApi } from "$lib/server/api";
import { serverLL } from "$lib/i18n.server";

export const load: PageServerLoad = async (event) => {
    const { locals } = event;
    let featuredTrack = null;

    if (locals.user) {
        try {
            const tracks = await createApi(event).profile.getTopTracks(locals.user.username, "7days", 1);
            featuredTrack = tracks[0] ?? null;
        } catch (e) {
            if (e instanceof ApiError && e.status === 429)
                error(429, serverLL(locals.lang).common.rateLimited());
            featuredTrack = null;
        }
    }

    return { featuredTrack };
};
