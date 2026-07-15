<script lang="ts">
    import type { ScrobbleRich } from "$lib/api/types";
    import { timeAgo } from "$lib/utils/format";
    import Avatar from "./Avatar.svelte";
    import Cover from "./Cover.svelte";
    import Modal from "./Modal.svelte";

    interface Props {
        scrobble: ScrobbleRich;
    }

    let { scrobble }: Props = $props();
    let open = $state(false);
</script>

<li class="flex items-center gap-3 py-2.5 group rounded-lg -mx-2 px-2 hover:bg-hover transition-colors">
    <button
        onclick={() => (open = true)}
        onfocus={(e) => e.currentTarget.blur()}
    >
        <Cover url={scrobble.album_image} alt={scrobble.album_title ?? scrobble.track_title} class="w-9 h-9 opacity-80 group-hover:opacity-100 transition-opacity" />
    </button>
    <div class="min-w-0 flex-1">
        <p class="text-sm text-secondary truncate group-hover:text-primary transition-colors">
            <a href="/track/{scrobble.track_id}" class="hover:underline transition-all">
                {scrobble.track_title}
            </a>
        </p>
        <p class="text-xs text-tertiary truncate">
            <a href="/track/{scrobble.artist_id}" class="hover:underline transition-all">
                {scrobble.artist_name}
            </a>
            {#if scrobble.album_title}
                <b class="text-quaternary"> · </b>
                <!-- TODO: add link -->
                <span class="cursor-default">
                    {scrobble.album_title}
                </span>
            {/if}
        </p>
    </div>
    <span class="text-xs text-quaternary shrink-0 tabular-nums">
        {timeAgo(scrobble.played_at)}
    </span>
</li>

<Modal {open} onclose={() => (open = false)}>
    <Avatar url={scrobble.album_image} name={scrobble.track_title} class="z-50 w-[225px] h-[225px] text-7xl" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {scrobble.track_title}
    </div>
</Modal>
