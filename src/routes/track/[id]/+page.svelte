<script lang="ts">
    import type { PageProps } from "./$types";
    import { formatCount } from "$lib/utils/format";
    import { getLL } from "$lib/i18n.svelte";

    import HeadphonesIcon from "@lucide/svelte/icons/headphones";
    import MicVocalIcon from "@lucide/svelte/icons/mic-vocal";
    import ClockIcon from "@lucide/svelte/icons/clock";

    import ScrollToTop from "$lib/components/ScrollToTop.svelte";
    import Cover from "$lib/components/Cover.svelte";
    import ListenerRow from "$lib/components/ListenerRow.svelte";
    import CommentSection from "$lib/components/CommentSection.svelte";
    import RefreshButton from "$lib/components/RefreshButton.svelte";

    const { data }: PageProps = $props();
    const { track, artist, user } = $derived(data);
    let LL = $derived(getLL());

    // svelte-ignore state_referenced_locally
    let listeners = $state(data.listeners);
    // svelte-ignore state_referenced_locally
    let comments = $state(data.comments);

    function formatDuration(ms: number | null): string | null {
        if (!ms) return null;
        const totalSec = Math.round(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    }

    const stats = $derived(
        [
            {
                icon: HeadphonesIcon,
                label: LL.track.stat.scrobbles(),
                value: formatCount(track.scrobble_count),
            },
            formatDuration(track.duration_ms) && {
                icon: ClockIcon,
                label: LL.track.stat.duration(),
                value: formatDuration(track.duration_ms) as string,
            },
        ].filter(Boolean) as { icon: typeof HeadphonesIcon; label: string; value: string }[],
    );
</script>

<svelte:head>
    <title>{track.title}{LL.track.meta.titleSuffix()}</title>
</svelte:head>

<ScrollToTop />

<div class="max-w-5xl mx-auto px-4 py-8 space-y-10">
    <!-- ── Track header ─────────────────────────────────────────────── -->
    <section class="flex flex-col sm:flex-row gap-6 items-start">
        <Cover url={null} alt={track.title} class="w-28 h-28 shrink-0" />

        <div class="w-full min-w-0 sm:flex-1 sm:self-center">
            <h1 class="text-2xl font-bold truncate">{track.title}</h1>
            <a
                href="/artist/{artist.id}"
                class="mt-1 inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-secondary transition-colors"
            >
                <MicVocalIcon size={13} />
                {artist.name}
            </a>
        </div>

        <RefreshButton kind="track" id={track.id} token={user?.token} />
    </section>

    <!-- ── Stats grid ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each stats as s}
            {@const Icon = s.icon}
            <div
                class="rounded-xl border border-border/60 bg-card/40 px-5 py-4 space-y-2 transition-colors hover:border-border-hover hover:bg-card/60"
            >
                <div
                    class="size-8 flex items-center justify-center rounded-lg bg-hover/60 text-quaternary"
                >
                    <Icon size={14} />
                </div>
                <div>
                    <p class="text-xs text-tertiary">{s.label}</p>
                    <p class="text-lg font-semibold text-primary tabular-nums">
                        {s.value}
                    </p>
                </div>
            </div>
        {/each}
    </div>

    <!-- ── Top listeners ────────────────────────────────────────────── -->
    <section class="space-y-3">
        <h2 class="text-sm font-semibold text-secondary">{LL.track.section.topListeners()}</h2>
        {#if listeners.length === 0}
            <p class="text-sm text-tertiary">{LL.track.empty.topListeners()}</p>
        {:else}
            <ul class="space-y-1">
                {#each listeners as listener, i (listener.user_id)}
                    <ListenerRow {listener} rank={i + 1} />
                {/each}
            </ul>
        {/if}
    </section>

    <!-- ── Comments ─────────────────────────────────────────────────── -->
    <CommentSection
        bind:comments
        isAuthed={!!user}
        currentUsername={user?.username}
        postAction="?/comment"
        deleteAction="?/deleteComment"
    />
</div>
