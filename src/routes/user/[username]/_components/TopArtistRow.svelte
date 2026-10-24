<script lang="ts">
    import type { TopArtist } from "$lib/api/types";
    import { formatCount } from "$lib/utils/format";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    // import Modal from "$lib/components/feedback/Modal.svelte";

    interface Props {
        artist: TopArtist;
        rank: number;
    }

    let { artist, rank }: Props = $props();
    // let open = $state(false);
</script>

<li class="flex items-center gap-3 py-3">
    <span
        class="w-10 shrink-0 cursor-default font-display text-xl leading-none tabular-nums {rank === 1 ? 'text-accent' : 'text-quaternary'}"
    >
        {String(rank).padStart(2, "0")}
    </span>
    <span class="shrink-0">
        <Avatar url={artist.image_url} name={artist.artist_name} class="size-8 text-xs" />
    </span>
    <a href="/artist/{artist.artist_id}" class="group flex min-w-0 flex-1 items-center justify-between gap-3">
        <span class="truncate text-sm font-medium text-primary underline-offset-4 group-hover:underline">
            {artist.artist_name}
        </span>
        <span class="shrink-0 text-xs tabular-nums text-tertiary">{formatCount(artist.play_count)}</span>
    </a>
</li>

<!-- <Modal {open} onclose={() => (open = false)}>
    <Avatar url={artist.image_url} name={artist.artist_name} class="z-50 w-[225px] h-[225px] text-7xl" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {artist.artist_name}
    </div>
</Modal> -->
