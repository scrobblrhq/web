import { command } from "$app/server";
import * as v from "valibot";
import { run } from "$lib/server/api";

export const setVote = command(
    v.object({ id: v.pipe(v.number(), v.integer()), voted: v.boolean() }),
    ({ id, voted }) => run((api) => (voted ? api.images.unvoteImage(id) : api.images.voteImage(id)))
);