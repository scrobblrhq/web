<script lang="ts">
    import type { TopTrack } from "$lib/api/types";
    import { formatCount } from "$lib/utils/format";
    import Cover from "../tracks/Cover.svelte";
    // import Avatar from "../ui/Avatar.svelte";
    // import Modal from "../feedback/Modal.svelte";

    interface Props {
        track: TopTrack;
        rank: number;
    }

    let { track, rank }: Props = $props();
    // let open = $state(false);
</script>

<li class="flex items-center gap-3 py-3">
    <span
        class="w-10 shrink-0 cursor-default font-display text-xl leading-none tabular-nums {rank === 1 ? 'text-accent' : 'text-quaternary'}"
    >
        {String(rank).padStart(2, "0")}
    </span>
    <span class="shrink-0">
        <Cover url={track.album_image} alt={track.track_title} class="size-8 rounded-md" />
    </span>
    <a href="/track/{track.track_id}" class="group flex min-w-0 flex-1 items-center justify-between gap-3">
        <span class="min-w-0 truncate text-sm font-medium text-primary underline-offset-4 group-hover:underline">
            {track.track_title}
            <span class="font-normal text-xs text-tertiary no-underline">{track.artist_name}</span>
        </span>
        <span class="shrink-0 text-xs tabular-nums text-tertiary">{formatCount(track.play_count)}</span>
    </a>
</li>

<!-- <Modal {open} onclose={() => (open = false)}>
    <Avatar url={track.album_image} name={track.track_title} class="z-50 h-56.25 w-56.25 text-7xl" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {track.track_title}
    </div>
</Modal> -->
