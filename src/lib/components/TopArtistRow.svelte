<script lang="ts">
    import type { TopArtist } from "$lib/api/types";
    import { formatCount } from "$lib/utils/format";
    import Avatar from "./Avatar.svelte";
    import Modal from "./Modal.svelte";

    interface Props {
        artist: TopArtist;
        rank: number;
    }

    let { artist, rank }: Props = $props();
    let open = $state(false);
</script>

<li class="flex items-center gap-2.5 hover:bg-hover transition-colors rounded-lg -mx-2 px-2 py-0.5">
    <span class="text-xs text-quaternary w-4 tabular-nums shrink-0 cursor-default">{rank}</span>
    <button
        onclick={() => (open = true)}
        onfocus={(e) => e.currentTarget.blur()}
    >
        <Avatar url={artist.image_url} name={artist.artist_name} class="w-7 h-7 text-xs" />
    </button>
    <a href="/artist/{artist.artist_id}" class="flex-1 flex items-center justify-between">
        <span class="text-sm text-secondary truncate flex-1">{artist.artist_name}</span>
        <span class="text-xs text-tertiary tabular-nums shrink-0">{formatCount(artist.play_count)}</span>
    </a>
</li>

<Modal {open} onclose={() => (open = false)}>
    <Avatar url={artist.image_url} name={artist.artist_name} class="z-50 w-[225px] h-[225px] text-7xl" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {artist.artist_name}
    </div>
</Modal>
