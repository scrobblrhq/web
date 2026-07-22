<script lang="ts">
    import type { PageProps } from "./$types";
    import { formatCount, joinedYear } from "$lib/utils/format";
    import { getLL } from "$lib/i18n.svelte";

    import HeadphonesIcon from "@lucide/svelte/icons/headphones";
    import MicVocalIcon from "@lucide/svelte/icons/mic-vocal";
    import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
    import MusicIcon from "@lucide/svelte/icons/music";

    import ScrollToTop from "$lib/components/ScrollToTop.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import TopTrackRow from "$lib/components/TopTrackRow.svelte";
    import ListenerRow from "$lib/components/ListenerRow.svelte";
    import CommentSection from "$lib/components/CommentSection.svelte";
    import ImageCandidates from "$lib/components/ImageCandidates.svelte";
    import RefreshButton from "$lib/components/RefreshButton.svelte";

    const { data }: PageProps = $props();
    const { artist, topTracks, listeners, user } = $derived(data);
    let LL = $derived(getLL());

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
</svelte:head>

<ScrollToTop />

<div class="max-w-5xl mx-auto px-4 py-8 space-y-10">
    <!-- ── Artist header ────────────────────────────────────────────── -->
    <section class="flex flex-col sm:flex-row gap-6 items-start">
        {#if artist.image_url}
            <button
                onclick={() => (open = true)}
                onfocus={(e) => e.currentTarget.blur()}
            >
                <Avatar
                    url={artist.image_url}
                    name={artist.name}
                    class="w-28 h-28 rounded-full object-cover shrink-0 ring-2 ring-border cursor-pointer"
                />
            </button>
        {:else}
            <Avatar
                url={null}
                name={artist.name}
                class="w-28 h-28 rounded-full shrink-0 ring-2 ring-border cursor-pointer"
            />
        {/if}

        <div class="w-full min-w-0 sm:flex-1 sm:self-center">
            <h1 class="text-2xl font-bold truncate">{artist.name}</h1>
            {#if artist.bio}
                <p class="mt-3 text-sm text-secondary leading-relaxed max-w-xl">
                    {artist.bio}
                </p>
            {/if}
        </div>

        <RefreshButton kind="artist" id={artist.id} token={user?.token} />
    </section>

    <!-- ── Stats grid ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

    <!-- ── Top tracks & listeners ──────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <section class="space-y-3">
            <h2 class="flex items-center gap-1.5 text-sm font-semibold text-secondary">
                <MusicIcon size={13} />
                {LL.artist.section.topTracks()}
            </h2>
            {#if topTracks.length === 0}
                <p class="text-sm text-tertiary">{LL.artist.empty.topTracks()}</p>
            {:else}
                <ul class="space-y-1">
                    {#each topTracks as track, i (track.track_id)}
                        <TopTrackRow {track} rank={i + 1} />
                    {/each}
                </ul>
            {/if}
        </section>

        <section class="space-y-3">
            <h2 class="text-sm font-semibold text-secondary">{LL.artist.section.topListeners()}</h2>
            {#if listeners.length === 0}
                <p class="text-sm text-tertiary">{LL.artist.empty.topListeners()}</p>
            {:else}
                <ul class="space-y-1">
                    {#each listeners as listener, i (listener.user_id)}
                        <ListenerRow {listener} rank={i + 1} />
                    {/each}
                </ul>
            {/if}
        </section>
    </div>

    <!-- ── Image candidates ────────────────────────────────────────── -->
    <ImageCandidates artistId={artist.id} bind:images token={user?.token} />

    <!-- ── Comments ─────────────────────────────────────────────────── -->
    <CommentSection
        bind:comments
        isAuthed={!!user}
        currentUsername={user?.username}
        postAction="?/comment"
        deleteAction="?/deleteComment"
    />
</div>

<Modal {open} onclose={() => (open = false)}>
    <Avatar url={artist.image_url} name={artist.name} class="z-50" />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {artist.name}
    </div>
</Modal>
