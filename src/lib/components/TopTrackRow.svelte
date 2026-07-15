<script lang="ts">
    import type { TopTrack } from "$lib/api/types";
    import { formatCount } from "$lib/utils/format";
    import Avatar from "./Avatar.svelte";
    import Cover from "./Cover.svelte";
    import Modal from "./Modal.svelte";

    interface Props {
        track: TopTrack;
        rank: number;
    }

    let { track, rank }: Props = $props();
    let open = $state(false);
</script>

<li
    class="flex items-center gap-2.5 hover:bg-hover transition-colors rounded-lg -mx-2 px-2 py-0.5"
>
    <span class="text-xs text-quaternary w-4 tabular-nums shrink-0 cursor-default">{rank}</span>
    <button
        onclick={() => (open = true)}
        onfocus={(e) => e.currentTarget.blur()}
    >
        <Cover url={track.album_image} alt={track.track_title} class="w-7 h-7" />
    </button>
    <div class="min-w-0 flex-1">
        <a href="/track/{track.track_id}" class="hover:underline transition-all">
            <p class="text-xs text-secondary truncate">{track.track_title}</p>
        </a>
        <a href="/artist/{track.artist_id}" class="hover:underline transition-all">
            <p class="text-xs text-tertiary truncate">{track.artist_name}</p>
        </a>
    </div>
    <span class="text-xs text-tertiary tabular-nums shrink-0">
        {formatCount(track.play_count)}
    </span>
</li>

<Modal {open} onclose={() => (open = false)}>
    <Avatar url={track.album_image} name={track.track_title} class="z-50 w-[225px] h-[225px] text-7xl" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {track.track_title}
    </div>
</Modal>
