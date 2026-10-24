<script lang="ts">
    import type { ScrobbleRich } from "#lib/api/types";
    import Avatar from "#lib/components/ui/Avatar.svelte";
    import Cover from "#lib/components/tracks/Cover.svelte";
    import Modal from "#lib/components/feedback/Modal.svelte";
    import { formatDate } from "#lib/utils/format";
    import { getLL } from "#lib/i18n.svelte";

    interface Props {
        scrobble: ScrobbleRich;
    }

    let { scrobble }: Props = $props();
    let open = $state(false);

    let LL = $derived(getLL());

    function timeAgo(iso: string | null): string {
        if (!iso) return LL.functions.time.never();
        const diff = Date.now() - new Date(iso).getTime();
        const days = Math.floor(diff / 86_400_000);
        if (days === 0) return LL.functions.time.today();
        if (days === 1) return LL.functions.time.yesterday();
        if (days < 30) return LL.functions.time.daysAgo({ days });
        return formatDate(iso);
    }
</script>

<li class="group flex items-center gap-4 py-3">
    <button
        type="button"
        class="shrink-0"
        onclick={() => (open = true)}
    >
        <Cover
            url={scrobble.album_image}
            alt={scrobble.album_title ?? scrobble.track_title}
            class="size-11 rounded-lg opacity-90 transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
        />
    </button>
    <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-primary">
            <a href="/track/{scrobble.track_id}" class="underline-offset-4 hover:underline">
                {scrobble.track_title}
            </a>
        </p>
        <p class="truncate text-xs text-tertiary">
            <a href="/artist/{scrobble.artist_id}" class="underline-offset-2 hover:underline">
                {scrobble.artist_name}
            </a>
            {#if scrobble.album_title}
                <span class="text-quaternary"> · </span>
                <a href="/album/{scrobble.album_id}" class="underline-offset-2 hover:underline">{scrobble.album_title}</a>
            {/if}
        </p>
    </div>
    <span class="shrink-0 text-xs tabular-nums text-quaternary">
        {timeAgo(scrobble.played_at)}
    </span>
</li>

<Modal {open} onclose={() => (open = false)}>
    <Avatar url={scrobble.album_image} name={scrobble.track_title} class="z-50 w-56.25 h-56.25 text-7xl" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {scrobble.track_title} - {scrobble.artist_name}
    </div>
</Modal>
