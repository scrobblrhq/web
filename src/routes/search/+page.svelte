<script lang="ts">
    import { browser } from "$app/env";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { api, ApiError } from "$lib/api";
    import type { SearchResponse } from "$lib/api/types";
    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());
    import MusicNote from "@lucide/svelte/icons/music-2";

    let query = $state(page.url.searchParams.get("q") ?? "");
    let filter = $state<"all" | "track" | "artist">("all");

    let results = $state<SearchResponse | null>(null);
    let loading = $state(false);
    let error = $state("");
    let debounceTimer: ReturnType<typeof setTimeout>;

    function formatCount(n: number): string {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
        if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
        return String(n);
    }

    function formatDuration(ms: number | null): string {
        if (!ms) return "";
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }

    $effect(() => {
        if (!results) return;
        artistMap = Object.fromEntries(
            results.artists.map((a) => [a.id, a.name]),
        );
    });

    let artistMap: Record<number, string> = $state({});

    async function runSearch(q: string) {
        if (!q.trim()) {
            results = null;
            return;
        }
        loading = true;
        error = "";
        try {
            results = await api.search.search(q.trim(), 15, filter);
            console.log($state.snapshot(results));

            artistMap = Object.fromEntries(
                results.artists.map((a) => [a.id, a.name]),
            );
        } catch (err) {
            if (err instanceof ApiError) error = err.message;
            else error = (err as Error).message;
            results = null;
        } finally {
            loading = false;
        }
    }

    function onInput() {
        clearTimeout(debounceTimer);
        if (browser) {
            const url = new URL(window.location.href);
            if (query.trim()) {
                url.searchParams.set("q", query.trim());
            } else {
                url.searchParams.delete("q");
            }
            goto(url.toString(), {
                replaceState: true,
                noScroll: true,
                keepFocus: true,
            });
        }
        debounceTimer = setTimeout(() => runSearch(query), 300);
    }

    function onFilterChange() {
        if (query.trim()) runSearch(query);
    }

    const hasResults = $derived(
        results && (results.artists.length > 0 || results.tracks.length > 0),
    );
    const isEmpty = $derived(
        results && results.artists.length === 0 && results.tracks.length === 0,
    );
</script>

<svelte:head>
    <title>{query ? LL.search.meta.titlePrefix({ query }) : LL.search.meta.titleDefault()}{LL.search.meta.titleSuffix()}</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <!-- Search input -->
    <div class="space-y-3">
        <div class="relative">
            <span
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none select-none"
            >
                ⌕
            </span>
            <input
                type="search"
                bind:value={query}
                oninput={onInput}
                placeholder={LL.search.input.placeholder()}
                class="w-full bg-card border border-border text-primary placeholder-tertiary
				       rounded-xl pl-9 pr-4 py-3 text-sm outline-none
				       focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors"
            />
            {#if loading}
                <span
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-tertiary text-xs animate-pulse"
                >
                    {LL.search.input.loading()}
                </span>
            {/if}
        </div>

        <!-- Filtros -->
        <div class="flex gap-1.5">
            {#each [["all", LL.search.filter.all()], ["artist", LL.search.filter.artists()], ["track", LL.search.filter.tracks()]] as [val, label]}
                <button
                    onclick={() => {
                        filter = val as typeof filter;
                        onFilterChange();
                    }}
                    class="cursor-pointer text-xs px-3 py-1 rounded-full border transition-colors
					{filter === val
                        ? 'bg-accent text-accent-text border-accent'
                        : 'border-border text-tertiary hover:text-primary hover:border-border-hover'}"
                >
                    {label}
                </button>
            {/each}
        </div>
    </div>

    <!-- Error -->
    {#if error}
        <p class="text-sm text-red-400">{error}</p>
    {/if}

    <!-- Sin resultados -->
    {#if isEmpty}
        <p class="text-sm text-tertiary py-4">
            {LL.search.empty.prefix()} <span class="text-quaternary">"{query}"</span>.
        </p>
    {/if}

    <!-- Resultados -->
    {#if hasResults}
        <div class="space-y-8">
            <!-- Artistas -->
            {#if results!.artists.length > 0 && (filter === "all" || filter === "artist")}
                <section class="space-y-3">
                    <h2
                        class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                    >
                        {LL.search.section.artists()}
                    </h2>
                    <ul class="space-y-px">
                        {#each results!.artists as artist (artist.id)}
                            <li>
                                <a
                                    href="/artist/{artist.id}"
                                    class="flex items-center gap-3 py-2.5 group rounded-lg -mx-2 px-2 hover:bg-hover transition-colors"
                                >
                                    {#if artist.image_url}
                                        <img
                                            src={artist.image_url}
                                            alt=""
                                            class="w-10 h-10 rounded-full object-cover shrink-0"
                                        />
                                    {:else}
                                        <div
                                            class="w-10 h-10 rounded-full bg-hover shrink-0 flex items-center justify-center text-tertiary font-medium text-sm select-none"
                                        >
                                            {artist.name[0].toUpperCase()}
                                        </div>
                                    {/if}
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="text-sm text-secondary group-hover:text-primary transition-colors truncate"
                                        >
                                            {artist.name}
                                        </p>
                                        <p class="text-xs text-tertiary">
                                            {formatCount(artist.scrobble_count)} {LL.search.label.scrobbles()}
                                            · {formatCount(
                                                artist.listener_count,
                                            )} {LL.search.label.listeners()}
                                        </p>
                                    </div>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}

            <!-- Canciones -->
            {#if results!.tracks.length > 0 && (filter === "all" || filter === "track")}
                <section class="space-y-3">
                    <h2
                        class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                    >
                        {LL.search.section.tracks()}
                    </h2>
                    <ul class="space-y-px">
                        {#each results!.tracks as track (track.id)}
                            <li>
                                <a
                                    href="/track/{track.id}"
                                    class="flex items-center gap-3 py-2.5 group rounded-lg -mx-2 px-2 hover:bg-hover transition-colors"
                                >
                                    <div
                                        class="w-10 h-10 rounded bg-hover shrink-0 flex items-center justify-center"
                                    >
                                        <span class="text-tertiary text-sm"
                                            ><MusicNote size={12} /></span
                                        >
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="text-sm text-secondary group-hover:text-primary transition-colors truncate"
                                        >
                                            {track.title}
                                        </p>
                                        <p class="text-xs text-tertiary truncate">
                                            {artistMap[track.artist_id] ?? LL.search.label.unknownArtist()}
                                            {#if track.duration_ms}
                                                · {formatDuration(
                                                    track.duration_ms,
                                                )}
                                            {/if}
                                        </p>
                                    </div>
                                    <span
                                        class="text-xs text-tertiary tabular-nums shrink-0"
                                    >
                                        {formatCount(track.scrobble_count)}
                                    </span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}
        </div>
    {/if}

    <!-- Estado inicial -->
    {#if !query.trim() && !results}
        <p class="text-sm text-tertiary py-4">
            {LL.search.input.empty()}
        </p>
    {/if}
</div>
