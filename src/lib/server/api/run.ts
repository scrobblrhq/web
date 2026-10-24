import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { createApi, ApiError } from "#lib/server/api";

export async function run<T>(
    fn: (api: ReturnType<typeof createApi>) => Promise<T>,
): Promise<T> {
    try {
        return await fn(createApi(getRequestEvent()));
    } catch (err) {
        if (err instanceof ApiError) error(err.status as 400, err.message);
        throw err;
    }
}
