<script lang="ts">
    import type { PageProps } from "./$types";
    import type { ScrobbleRich, TimePeriod } from "#lib/api/types";

    import { fade, fly } from "svelte/transition";
    import { page } from "$app/state";
    import { discordComponentEmbed, serializeJsonForHtml } from "#lib/seo";

    // #region Colocated components
    import ScrobbleRow from "./_components/ScrobbleRow.svelte";
    import TopArtistRow from "./_components/TopArtistRow.svelte";
    import Heatmap from "./_components/Heatmap.svelte";
    import Profile from "./_components/Profile.svelte";
    // #endregion Colocated components

    import NowPlaying from "#lib/components/player/NowPlaying.svelte";
    import TopTrackRow from "#lib/components/artists/TopTrackRow.svelte";
    import AuthModal from "#lib/components/auth/AuthModal.svelte";
    import ScrollToTop from "#lib/components/ui/ScrollToTop.svelte";

    import { addToast } from "#lib/stores/toast.svelte";

import { getTopArtists, getTopTracks, getRecentBefore, setBlock, setFollow } from "#lib/remote/profile.remote";
    import { PERIODS } from "#lib/periods";
    import { useIsDesktop } from "#lib/hooks/isDesktop.svelte";
    import { useNowPlaying } from "#lib/hooks/nowPlaying.svelte";
    import { getLL } from "#lib/i18n.svelte";

    let LL = $derived(getLL());

    const { data }: PageProps = $props();

    const { user, profile, isOwn, followers } = $derived(data);
    let metaTitle = $derived(`${profile.display_name || profile.username} - Scrobblr`);
    let metaDescription = $derived(
        `${profile.display_name || profile.username}: ${profile.scrobble_count ?? 0} ${LL.profile.stat.scrobbles()} on Scrobblr.`.slice(0, 160),
    );
    const canonicalUrl = $derived(`${page.url.origin}${page.url.pathname}`);
    const discordJson = $derived(serializeJsonForHtml(discordComponentEmbed({ title: metaTitle, description: metaDescription, url: canonicalUrl, image: profile.image_url })));

    let activeTab = $state<"recent" | "stats">("recent");
    const isDesktop = useIsDesktop();

    let topTracksData = $state(data.topTracks);
    let topArtistsData = $state(data.topArtists);

    $effect(() => {
        topTracksData = data.topTracks;
        topArtistsData = data.topArtists;
    });

    // svelte-ignore state_referenced_locally
    let isFollowing = $state(profile.is_following ?? false);
    let isBlocked = $state(data.isBlocked);
    let showAuthModal = $state(false);

    let period = $state("overall");
    $effect(() => {
        period = page.url.searchParams.get("period") ?? "overall";
    });

    const periods = $derived.by(() => PERIODS.map((value) => ({
          value,
          label: ({
              "7days": "7d",
              "1month": "30d",
              "3months": "90d",
              "6months": "6m",
              "1year": LL.profile.period["1year"](),
              overall: LL.profile.period.overall(),
          })[value],
      })))

    async function switchPeriod(value: string) {
        period = value;
        console.log(profile);
        topArtistsData = Promise.resolve(
            getTopArtists({ username: profile.username, period: value as TimePeriod })
        )
        topTracksData = Promise.resolve(
            getTopTracks({ username: profile.username, period: value as TimePeriod })
        )
    }

    $effect(() => {
        isFollowing = profile.is_following ?? false;
    });

    $effect(() => {
        isBlocked = data.isBlocked;
    });

    async function handleBlock() {
        const next = !isBlocked;
        try {
            if (next && isFollowing) {
                await setFollow({ username: profile.username, follow: false });
                isFollowing = false;
            }
            await setBlock({ username: profile.username, block: next });
            isBlocked = next;
            addToast(
                next
                    ? LL.profile.toast.blockSuccess({ username: profile.username })
                    : LL.profile.toast.unblockSuccess({ username: profile.username }),
                "success",
            );
        } catch {
            addToast(LL.profile.toast.blockError(), "error");
        }
    }

    $effect(() => {
        if (isDesktop.current) activeTab = "recent";
    });

    async function handleFollowClick(e?: MouseEvent) {
        if (!user) {
            e?.preventDefault();
            showAuthModal = true;
            return;
        }

        const next = !isFollowing;
        try {
            await setFollow({ username: profile.username, follow: next });
            isFollowing = next;
            addToast(
                next
                    ? LL.profile.toast.followSuccess({ username: profile.username })
                    : LL.profile.toast.unfollowSuccess({ username: profile.username }),
                "success",
            );
        } catch {
            addToast(LL.profile.toast.followError(), "error");
        }
    }

    // ── Now playing via SSE ────────────────────────────────────────────────────
    const nowPlaying = useNowPlaying(() => profile.username);

    // Load scrobbles when scrolling
    let allRecent = $state<ScrobbleRich[]>([]);
    let loadingMore = $state(false);
    let hasMore = $state(true);

    $effect(() => {
        data.recent.then((r) => {
            allRecent = r;
            hasMore = r.length === 15;
        });
    });

    async function loadMore() {
        if (loadingMore || !hasMore || allRecent.length === 0) return;

        loadingMore = true;
        try {
            const last = allRecent[allRecent.length - 1];

            const more = await getRecentBefore({
                username: profile.username,
                before: last.played_at
            })

            allRecent = [...allRecent, ...more];
            hasMore = more.length === 30;
        } catch (error) {
            console.error(error);
        } finally {
            loadingMore = false;
        }
    }

    function infiniteScroll(node: Element) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "200px" },
        );

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    // onDestroy(() => sse?.close());
</script>

<svelte:head>
    <title>{metaTitle}</title>
    <meta name="description" content={metaDescription} />
    <meta name="robots" content={profile.is_private ? "noindex, nofollow" : "index, follow"} />
    <link rel="canonical" href={canonicalUrl} />
    {#if !profile.is_private}
        <meta property="og:site_name" content="Scrobblr" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="profile" />
        {#if profile.image_url}
            <meta property="og:image" content={profile.image_url} />
            <meta property="og:image:alt" content={`${profile.display_name || profile.username} avatar`} />
        {/if}
        <meta name="twitter:card" content={profile.image_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {#if profile.image_url}<meta name="twitter:image" content={profile.image_url} /><meta name="twitter:image:alt" content={`${profile.display_name || profile.username} avatar`} />{/if}
        <script id="discord:component-embed" type="application/json">{@html discordJson}</script>
    {/if}
</svelte:head>

<ScrollToTop />

<main class="profile-page mx-auto w-full max-w-368 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-10 lg:px-8">
<div class="space-y-16">
    <!-- ── Profile header ──────────────────────────────────────────────────── -->
    <Profile
        {handleFollowClick}
        {handleBlock}
        {isFollowing}
        {isBlocked}
        {isOwn}
        {profile}
        {followers}
        {user}
        recent={data.recent}
    />

    <!-- ── Now playing ───────────────────────────────────────────────────────── -->
    {#if nowPlaying.current}
        <div class="relative z-10 -mt-4 sm:-mt-6">
            <NowPlaying data={nowPlaying.current} />
        </div>
    {/if}

    <!-- Heatmap -->
    {#await data.heatmap}
        <div
            class="h-28 rounded-lg bg-skeleton/50 animate-pulse"
            out:fade={{ duration: 300 }}
        ></div>
    {:then heatmap}
        <div in:fade={{ delay: 300 }} class="activity-panel rounded-lg border-y border-border bg-linear-to-tr from-card via-card/90 to-transparent px-4 py-5 shadow-[0_16px_42px_rgba(9,9,11,0.06)] backdrop-blur-xs sm:px-7 sm:py-7">
            <Heatmap data={heatmap} />
        </div>
    {/await}

    <!-- ── Main grid ────────────────────────────────────────────────────── -->
    <div class="mb-6 flex rounded-lg border border-border/70 bg-card/60 backdrop-blur-xs p-1 lg:hidden" role="tablist">
        <button
            class="flex-1 rounded-lg py-2 text-sm font-medium transition-all active:scale-[0.98] {activeTab ===
            'recent'
                ? 'bg-primary text-inverse shadow-sm'
                : 'text-tertiary'}"
            onclick={() => (activeTab = "recent")}
        >
            {LL.profile.tab.recent()}
        </button>
        <button
            class="flex-1 rounded-lg py-2 text-sm font-medium transition-all active:scale-[0.98] {activeTab ===
            'stats'
                ? 'bg-primary text-inverse shadow-sm'
                : 'text-tertiary'}"
            onclick={() => (activeTab = "stats")}
        >
            {LL.profile.tab.stats()}
        </button>
    </div>
    <div class="profile-content-grid grid grid-cols-1 items-start gap-12 lg:grid-flow-dense lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)] lg:gap-20">
        {#if isDesktop.current || activeTab === "recent"}
            <!-- Left column: recent scrobbles -->
            <div class="lg:col-span-1 space-y-5">
                <h2
                    class="sticky top-0 z-10 flex items-center gap-3 border-b border-border/70 bg-surface/90 rounded-lg px-2 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-tertiary backdrop-blur-md"
                >
                    {LL.profile.section.recentScrobbles()}
                    <span class="h-px flex-1 bg-border/70"></span>
                </h2>

                <div in:fly={{ duration: 200, delay: 300, y: -12 }}>
                    {#if allRecent.length === 0}
                        <p class="text-sm text-tertiary py-4">
                            {LL.profile.empty.recentScrobbles()}
                        </p>
                    {:else}
                        <ul class="divide-y divide-border/60 rank-panel px-3 py-2 sm:px-5">
                            {#each allRecent as s (s.id)}
                                <ScrobbleRow scrobble={s} />
                            {/each}
                        </ul>

                        <div
                            use:infiniteScroll
                            class="py-4 flex justify-center"
                        >
                            {#if loadingMore}
                                <span
                                    class="text-xs text-tertiary animate-pulse"
                                    >{LL.profile.loading()}</span
                                >
                            {:else if !hasMore}
                                <span class="text-xs text-tertiary"
                                    >{LL.profile.historyEnd()}</span
                                >
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Right column: top artists + top tracks -->
        {#if isDesktop.current || activeTab === "stats"}
            <div class="space-y-12 lg:sticky lg:top-6">
                <!-- Top artists -->
                <div class="space-y-3">
                    <div
                        class="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-surface/90 px-2 py-1.5 backdrop-blur-md rounded-lg"
                    >
                        <h2
                            class="flex min-w-0 flex-1 items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-tertiary"
                        >
                            {LL.profile.section.topArtists()}
                            <span class="h-px flex-1 bg-border/70"></span>
                        </h2>
                        <div
                            class="flex shrink-0 gap-0.5 rounded-lg p-0.5"
                            role="tablist"
                        >
                            {#each periods as p}
                                <button
                                    role="tab"
                                    aria-selected={period === p.value}
                                    onclick={() => switchPeriod(p.value)}
                                    class="text-xs px-2 py-1 rounded-md transition-colors cursor-pointer
                                    {period === p.value
                                        ? 'bg-active text-secondary'
                                        : 'text-tertiary hover:text-secondary'}"
                                >
                                    {p.label}
                                </button>
                            {/each}
                        </div>
                    </div>
                    {#await topArtistsData}
                        <ul
                            class="animate-pulse border-y border-border/70 bg-card/35 p-3"
                            out:fade={{ duration: 300 }}
                        >
                            {#each Array(5) as _}
                                <li class="flex items-center gap-3 h-10">
                                    <span
                                        class="w-5 text-right text-xs text-quaternary"
                                        >.</span
                                    >
                                    <div
                                        class="size-8 rounded-full bg-skeleton shrink-0"
                                    ></div>
                                    <div
                                        class="h-3.5 w-3/5 rounded bg-skeleton"
                                    ></div>
                                </li>
                            {/each}
                        </ul>
                    {:then topArtists}
                        <div in:fly={{ duration: 200, delay: 300, y: -12 }} class="rank-panel">
                            {#if topArtists.length === 0}
                                <p class="text-sm text-tertiary">{LL.profile.empty.data()}</p>
                            {:else}
                                <ul>
                                    {#each topArtists as a, i (a.artist_id)}
                                        <TopArtistRow artist={a} rank={i + 1} />
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                    {/await}
                </div>

                <!-- Top tracks -->
                <div class="space-y-3">
                    <h2
                        class="sticky top-0 z-10 flex items-center gap-3 border-b border-border/70 bg-surface/90 rounded-lg px-2 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-tertiary backdrop-blur-md"
                    >
                        {LL.profile.section.topTracks()}
                        <span class="h-px flex-1 bg-border/70"></span>
                    </h2>
                    {#await topTracksData}
                        <ul
                            class="space-y-2 animate-pulse"
                            out:fade={{ duration: 300 }}
                        >
                            {#each Array(5) as _}
                                <li class="flex items-center gap-3 h-10">
                                    <span
                                        class="w-5 text-right text-xs text-quaternary"
                                        >.</span
                                    >
                                    <div
                                        class="size-8 rounded bg-skeleton shrink-0"
                                    ></div>
                                    <div class="flex-1 min-w-0 space-y-2">
                                        <div
                                            class="h-3 w-4/5 rounded bg-skeleton"
                                        ></div>
                                        <div
                                            class="h-2.5 w-2/5 rounded bg-skeleton/60"
                                        ></div>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    {:then topTracks}
                        <div in:fly={{ duration: 200, delay: 300, y: -12 }}>
                            {#if topTracks.length === 0}
                                <p class="text-sm text-tertiary">{LL.profile.empty.data()}</p>
                            {:else}
                                <div class="rank-panel">
                                    <ul>
                                        {#each topTracks as t, i (t.track_id)}
                                            <TopTrackRow track={t} rank={i + 1} />
                                        {/each}
                                    </ul>
                                </div>
                            {/if}
                        </div>
                    {/await}
                </div>
            </div>
        {/if}
    </div>
</div>
</main>

<style>
    .profile-page {
        position: relative;
    }

    .activity-panel,
    .profile-content-grid {
        animation: profile-rise 800ms cubic-bezier(0.22, 0.9, 0.28, 1) both;
    }

    .activity-panel {
        animation-delay: 180ms;
    }

    .profile-content-grid {
        animation-delay: 260ms;
    }

    :global(.profile-page .profile-content-grid > div:first-child > h2),
    :global(.profile-page .profile-content-grid > div:last-child h2) {
        letter-spacing: 0.24em;
    }

    @keyframes profile-rise {
        from {
            opacity: 0;
            transform: translateY(18px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .activity-panel,
        .profile-content-grid {
            animation: none;
        }
    }
</style>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
