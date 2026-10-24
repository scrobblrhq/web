<script lang="ts">
    import type { PageProps } from "./$types";
    import { page } from "$app/state";
    import { formatCount } from "$lib/utils/format";
    import { getLL } from "$lib/i18n.svelte";

    import HeadphonesIcon from "@lucide/svelte/icons/headphones";
    import MicVocalIcon from "@lucide/svelte/icons/mic-vocal";
    import ClockIcon from "@lucide/svelte/icons/clock";

    import ScrollToTop from "$lib/components/ui/ScrollToTop.svelte";
    import Cover from "$lib/components/tracks/Cover.svelte";
    import ListenerRow from "$lib/components/artists/ListenerRow.svelte";
    import CommentSection from "$lib/components/tracks/CommentSection.svelte";
    import RefreshButton from "$lib/components/ui/RefreshButton.svelte";
    import { Disc3Icon } from "@lucide/svelte";

    const { data }: PageProps = $props();
    const { track, artist, cover, album, user } = $derived(data);
    let LL = $derived(getLL());
    let metaDescription = $derived(
        `${track.title} by ${artist.name} on Scrobblr: ${formatCount(track.scrobble_count)} ${LL.track.stat.scrobbles().toLowerCase()}.`.slice(0, 160),
    );

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
    <meta name="description" content={metaDescription} />
    <link rel="canonical" href={`${page.url.origin}${page.url.pathname}`} />
    <meta property="og:title" content={`${track.title} - ${artist.name}`} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:url" content={`${page.url.origin}${page.url.pathname}`} />
    <meta property="og:type" content="music.song" />
    {#if cover}
        <meta property="og:image" content={cover} />
    {/if}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${track.title} - ${artist.name}`} />
    <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<ScrollToTop />

<main class="media-detail-page mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
<div class="relative z-0 space-y-10 sm:space-y-14">
    <!-- ── Track header ─────────────────────────────────────────────── -->
    <section class="media-hero relative isolate overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card/90 via-card/75 to-accent/10 p-5 shadow-[0_18px_50px_rgba(9,9,11,0.055)] sm:p-8">
        <div class="absolute inset-y-0 left-0 w-1 bg-accent"></div>
        <div class="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <Cover url={cover} alt={track.title} class="h-36 w-36 shrink-0 rounded-2xl ring-1 ring-white/10 shadow-xl sm:h-52 sm:w-52" />

            <div class="w-full min-w-0 sm:flex-1 sm:self-center">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent mb-3">
                    {LL.track.meta.titleSuffix().replace(/^\s*[—-]\s*/, "")}
                </p>
                <h1 class="text-3xl sm:text-5xl font-semibold tracking-[-0.045em] leading-[1.05] text-primary text-balance">
                    {track.title}
                </h1>
                <div class="flex flex-col space-y-2 mt-4">
                    <a
                        href="/artist/{artist.id}"
                        class="inline-flex items-center gap-2 text-sm sm:text-base text-secondary hover:text-primary transition-colors"
                    >
                        <MicVocalIcon size={15} class="text-accent" />
                        {artist.name}
                    </a>
                    {#if album}
                        <!-- <a href="/album/{album.id}" class="mt-2 block text-sm text-tertiary transition-colors hover:text-secondary">{album.title}</a> -->
                        <a
                            href="/album/{album.id}"
                            class="inline-flex items-center gap-2 text-sm sm:text-base text-secondary hover:text-primary transition-colors"
                        >
                            <Disc3Icon size={15} class="text-accent" />
                            {album.title}
                        </a>
                    {/if}
                </div>
            </div>

            <RefreshButton kind="track" id={track.id} signedIn={!!user} />
        </div>
    </section>

    <!-- ── Stats grid ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each stats as s}
            {@const Icon = s.icon}
            <div
                class="media-stat rounded-2xl border border-border/70 bg-card/45 px-5 py-4 shadow-[0_12px_30px_rgba(9,9,11,0.045)] transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-hover"
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

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] gap-10 lg:gap-14 items-start">
        <section class="space-y-4">
            <CommentSection
                bind:comments
                isAuthed={!!user}
                currentUsername={user?.username}
                postAction="?/comment"
                deleteAction="?/deleteComment"
            />
        </section>

        <section class="space-y-4 lg:sticky lg:top-6">
            <h2 class="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                {LL.track.section.topListeners()}
                <span class="h-px flex-1 bg-border/70"></span>
            </h2>
            {#if listeners.length === 0}
                <p class="text-sm text-tertiary">{LL.track.empty.topListeners()}</p>
            {:else}
                <ul class="media-list-panel space-y-1 rounded-2xl border border-border/70 p-3">
                    {#each listeners as listener, i (listener.user_id)}
                        <ListenerRow {listener} rank={i + 1} />
                    {/each}
                </ul>
            {/if}
        </section>
    </div>
    </div>
</main>
