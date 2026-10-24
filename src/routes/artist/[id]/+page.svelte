<script lang="ts">
    import type { PageProps } from "./$types";
    import { page } from "$app/state";
    import { formatCount, joinedYear } from "$lib/utils/format";
    import { getLL } from "$lib/i18n.svelte";

    import HeadphonesIcon from "@lucide/svelte/icons/headphones";
    import MicVocalIcon from "@lucide/svelte/icons/mic-vocal";
    import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
    import MusicIcon from "@lucide/svelte/icons/music";

    import ScrollToTop from "$lib/components/ui/ScrollToTop.svelte";
    import Modal from "$lib/components/feedback/Modal.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import TopTrackRow from "$lib/components/artists/TopTrackRow.svelte";
    import ListenerRow from "$lib/components/artists/ListenerRow.svelte";
    import CommentSection from "$lib/components/tracks/CommentSection.svelte";
    import ImageCandidates from "$lib/components/artists/ImageCandidates.svelte";
    import RefreshButton from "$lib/components/ui/RefreshButton.svelte";

    const { data }: PageProps = $props();
    const { artist, topTracks, listeners, user } = $derived(data);
    let LL = $derived(getLL());
    let metaDescription = $derived(
        (artist.bio?.replace(/\s+/g, " ").trim() ||
            `${artist.name}: ${formatCount(artist.scrobble_count)} ${LL.artist.stat.scrobbles().toLowerCase()}, ${formatCount(artist.listener_count)} ${LL.artist.stat.listeners().toLowerCase()}.`).slice(0, 160),
    );

    // svelte-ignore state_referenced_locally
    let comments = $state(data.comments);
    // svelte-ignore state_referenced_locally
    let images = $state(data.images);

    const stats = $derived([
        {
            icon: HeadphonesIcon,
            label: LL.artist.stat.scrobbles(),
            value: formatCount(artist.scrobble_count),
        },
        {
            icon: MicVocalIcon,
            label: LL.artist.stat.listeners(),
            value: formatCount(artist.listener_count),
        },
        {
            icon: CalendarDaysIcon,
            label: LL.artist.stat.since(),
            value: joinedYear(artist.created_at),
        },
    ]);

    let open = $state(false);
</script>

<svelte:head>
    <title>{artist.name}{LL.artist.meta.titleSuffix()}</title>
    <meta name="description" content={metaDescription} />
    <link rel="canonical" href={`${page.url.origin}${page.url.pathname}`} />
    <meta property="og:title" content={`${artist.name}${LL.artist.meta.titleSuffix()}`} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:url" content={`${page.url.origin}${page.url.pathname}`} />
    <meta property="og:type" content="profile" />
    {#if artist.image_url}
        <meta property="og:image" content={artist.image_url} />
    {/if}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${artist.name}${LL.artist.meta.titleSuffix()}`} />
    <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<ScrollToTop />

<main class="media-detail-page mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
<div class="relative z-0 space-y-10 sm:space-y-14">
    <!-- ── Artist header ────────────────────────────────────────────── -->
    <section class="media-hero relative isolate overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card/90 via-card/75 to-accent/10 p-5 sm:p-8">
        <div class="absolute inset-y-0 left-0 w-1 bg-accent"></div>
        <div class="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {#if artist.image_url}
            <button
                type="button"
                onclick={() => (open = true)}
            >
                <Avatar
                    url={artist.image_url}
                    name={artist.name}
                    class="h-36 w-36 shrink-0 cursor-pointer rounded-2xl object-cover ring-4 ring-card/80 shadow-xl sm:h-48 sm:w-48"
                />
            </button>
        {:else}
            <Avatar
                url={null}
                name={artist.name}
                class="h-36 w-36 shrink-0 cursor-pointer rounded-2xl ring-4 ring-card/80 shadow-xl sm:h-48 sm:w-48"
            />
        {/if}

        <div class="w-full min-w-0 sm:flex-1 sm:self-center">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent mb-3">
                {LL.artist.meta.titleSuffix().replace(/^\s*[—-]\s*/, "")}
            </p>
            <h1 class="text-3xl sm:text-5xl font-semibold tracking-[-0.045em] leading-[1.05] text-primary text-balance">{artist.name}</h1>
            {#if artist.bio}
                <p class="mt-4 text-sm sm:text-base text-secondary leading-relaxed max-w-xl">
                    {artist.bio}
                </p>
            {/if}
        </div>

        <RefreshButton kind="artist" id={artist.id} signedIn={!!user} />
        </div>
    </section>

    <!-- ── Stats grid ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

    <!-- ── Top tracks & listeners ──────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] gap-10 lg:gap-14 items-start">
        <section class="space-y-3">
            <h2 class="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                <MusicIcon size={13} />
                {LL.artist.section.topTracks()}
                <span class="h-px flex-1 bg-border/70"></span>
            </h2>
            {#if topTracks.length === 0}
                <p class="text-sm text-tertiary">{LL.artist.empty.topTracks()}</p>
            {:else}
                <ul class="media-list-panel space-y-1 rounded-2xl border border-border/70 p-3">
                    {#each topTracks as track, i (track.track_id)}
                        <TopTrackRow {track} rank={i + 1} />
                    {/each}
                </ul>
            {/if}
        </section>

        <section class="space-y-3">
            <h2 class="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                {LL.artist.section.topListeners()}
                <span class="h-px flex-1 bg-border/70"></span>
            </h2>
            {#if listeners.length === 0}
                <p class="text-sm text-tertiary">{LL.artist.empty.topListeners()}</p>
            {:else}
                <ul class="media-list-panel space-y-1 rounded-2xl border border-border/70 p-3">
                    {#each listeners as listener, i (listener.user_id)}
                        <ListenerRow {listener} rank={i + 1} />
                    {/each}
                </ul>
            {/if}
        </section>
    </div>

    <!-- ── Image candidates ────────────────────────────────────────── -->
    <ImageCandidates artistId={artist.id} signedIn={!!user} bind:images />

    <!-- ── Comments ─────────────────────────────────────────────────── -->
    <CommentSection
        bind:comments
        isAuthed={!!user}
        postAction="?/comment"
        deleteAction="?/deleteComment"
    />
    </div>
</main>

<Modal {open} onclose={() => (open = false)}>
    <Avatar url={artist.image_url} name={artist.name} class="z-50" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {artist.name}
    </div>
</Modal>
