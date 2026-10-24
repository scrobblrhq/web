import { command } from "$app/server";
import * as v from "valibot";
import { run } from "$lib/server/api";

export const refresh = command(
    v.object({
        kind: v.picklist(["artist", "track"]),
        id: v.pipe(v.number(), v.integer(), v.minValue(1)),
    }),
    ({ kind, id }) =>
        run(
            (api) => kind === "artist" ? api.catalog.refreshArtist(id) : api.catalog.refreshTrack(id)
        )
)