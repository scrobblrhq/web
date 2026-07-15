<script lang="ts">
    import type { PageProps } from "./$types";
    import type {
        NowPlayingRich,
        ScrobbleRich,
        TimePeriod,
    } from "$lib/api/types";

    import { fade, fly } from "svelte/transition";
    import { page } from "$app/state";
    import { API_URL } from "$app/env/public";
    import NowPlaying from "$lib/components/NowPlaying.svelte";
    import ScrobbleRow from "$lib/components/ScrobbleRow.svelte";
    import TopArtistRow from "$lib/components/TopArtistRow.svelte";
    import TopTrackRow from "$lib/components/TopTrackRow.svelte";
    import AuthModal from "$lib/components/ui/AuthModal.svelte";
    import Heatmap from "$lib/components/Heatmap.svelte";
    import ScrollToTop from "$lib/components/ScrollToTop.svelte";

    import { addToast } from "$lib/stores/toast.svelte";

    import { api } from "$lib/api";
    import { request } from "$lib/api/request";
    import Profile from "$lib/components/Profile.svelte";
    import { useIsDesktop } from "$lib/hooks/isDesktop.svelte";
    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());

    const { data }: PageProps = $props();

    const { user, profile, isOwn, followers } = $derived(data);

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
    let showAuthModal = $state(false);

    let period = $state("overall");
    $effect(() => {
        period = page.url.searchParams.get("period") ?? "overall";
    });

    const periods = [
        { value: "7days", label: "7d" },
        { value: "1month", label: "30d" },
        { value: "3months", label: "90d" },
        { value: "overall", label: "Todo" },
    ] as const;

    async function switchPeriod(value: string) {
        period = value;
        topArtistsData = api.profile.getTopArtists(
            profile.username,
            value as TimePeriod,
            10,
            user?.token
        );
        topTracksData = api.profile.getTopTracks(
            profile.username,
            value as TimePeriod,
            10,
            user?.token
        );
    }

    $effect(() => {
        isFollowing = profile.is_following ?? false;
    });

    $effect(() => {
        if (isDesktop.current) activeTab = "recent";
    });

    function handleFollow() {
        return async ({
            result,
        }: {
            result: { type: string; data?: { is_following?: boolean } };
            update: () => Promise<void>;
        }) => {
            if (
                result.type === "success" &&
                result.data &&
                typeof result.data.is_following === "boolean"
            ) {
                isFollowing = result.data.is_following;
                addToast(
                    result.data.is_following
                        ? LL.profile.toast.followSuccess({ username: profile.username })
                        : LL.profile.toast.unfollowSuccess({ username: profile.username }),
                    "success",
                );
            } else if (result.type === "failure") {
                addToast(LL.profile.toast.followError(), "error");
            }
        };
    }

    function handleFollowClick(e: MouseEvent) {
        if (!user) {
            e.preventDefault();
            showAuthModal = true;
        }
    }

    // ── Now playing via SSE ────────────────────────────────────────────────────
    // let nowPlaying: NowPlayingRich | null = $state(null);
    // let sse: EventSource | null = null;

    // onMount(() => {
    //     sse = new EventSource(`${API_URL}/v1/user/${profile.username}/live`, {
    //         withCredentials: true,
            
    //     });
    //     sse.onmessage = (e) => {
    //         try {
    //             const parsed = JSON.parse(e.data);
    //             nowPlaying = parsed === null ? null : parsed;
    //         } catch {
    //             nowPlaying = null;
    //         }
    //     };
    //     sse.onerror = () => {
    //         sse?.close();
    //     };
    // });

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

            const url = `/v1/user/${profile.username}/recent?limit=30&before=${encodeURIComponent(last.played_at)}`;
            const more = await request<ScrobbleRich[]>(url, {}, user?.token);

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
    <title>{profile.display_name ?? profile.username} — Scrobblr</title>
</svelte:head>

<ScrollToTop />

<div class="max-w-5xl mx-auto px-4 py-8 space-y-10">
    <!-- ── Profile header ──────────────────────────────────────────────────── -->
    <Profile
        {handleFollow}
        {handleFollowClick}
        {isFollowing}
        {isOwn}
        {profile}
        {followers}
        {user}
    />

    <!-- ── Now playing ───────────────────────────────────────────────────────── -->
    <!-- {#if nowPlaying}
        <NowPlaying data={nowPlaying} />
    {/if} -->

    <!-- Heatmap -->
    {#await data.heatmap}
        <div
            class="h-28 rounded-lg bg-skeleton/50 animate-pulse"
            out:fade={{ duration: 300 }}
        ></div>
    {:then heatmap}
        <div in:fade={{ delay: 300 }}>
            <Heatmap data={heatmap} />
        </div>
    {/await}

    <!-- ── Main grid ────────────────────────────────────────────────────── -->
    <div class="flex lg:hidden bg-card rounded-lg p-1 mb-6">
        <button
            class="flex-1 py-2 text-sm font-medium rounded-md transition-colors {activeTab ===
            'recent'
                ? 'bg-active text-primary'
                : 'text-tertiary'}"
            onclick={() => (activeTab = "recent")}
        >
            {LL.profile.tab.recent()}
        </button>
        <button
            class="flex-1 py-2 text-sm font-medium rounded-md transition-colors {activeTab ===
            'stats'
                ? 'bg-active text-primary'
                : 'text-tertiary'}"
            onclick={() => (activeTab = "stats")}
        >
            {LL.profile.tab.stats()}
        </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {#if isDesktop.current || activeTab === "recent"}
            <!-- Left column: recent scrobbles -->
            <div class="lg:col-span-2 space-y-3">
                <h2
                    class="text-xs font-semibold uppercase tracking-widest text-tertiary sticky top-0 z-10 py-2 -mx-4 px-4 bg-surface"
                >
                    {LL.profile.section.recentScrobbles()}
                </h2>

                <div in:fly={{ duration: 200, delay: 300, y: -12 }}>
                    {#if allRecent.length === 0}
                        <p class="text-sm text-tertiary py-4">
                            {LL.profile.empty.recentScrobbles()}
                        </p>
                    {:else}
                        <ul class="space-y-px">
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
            <div class="space-y-8">
                <!-- Top artists -->
                <div class="space-y-3">
                    <div
                        class="flex items-center justify-between gap-4 flex-wrap"
                    >
                        <h2
                            class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                        >
                            {LL.profile.section.topArtists()}
                        </h2>
                        <div
                            class="flex gap-0.5 bg-card rounded-lg p-0.5"
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
                            class="space-y-2 animate-pulse"
                            out:fade={{ duration: 300 }}
                        >
                            {#each Array(5) as _}
                                <li class="flex items-center gap-3 h-10">
                                    <span
                                        class="w-5 text-right text-xs text-quaternary"
                                        >—</span
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
                        <div in:fly={{ duration: 200, delay: 300, y: -12 }}>
                            {#if topArtists.length === 0}
                                <p class="text-sm text-tertiary">{LL.profile.empty.data()}</p>
                            {:else}
                                <ul class="space-y-2">
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
                        class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                    >
                        {LL.profile.section.topTracks()}
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
                                        >—</span
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
                                <ul class="space-y-2">
                                    {#each topTracks as t, i (t.track_id)}
                                        <TopTrackRow track={t} rank={i + 1} />
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                    {/await}
                </div>
            </div>
        {/if}
    </div>
</div>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />