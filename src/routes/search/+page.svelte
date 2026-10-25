<script lang="ts">
    import { browser } from "$app/env";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { isHttpError } from "@sveltejs/kit";
    import { search } from "./search.remote";
    import type { Album, SearchResponse } from "#lib/api/types";
    import Avatar from "#lib/components/ui/Avatar.svelte";
    import { getLL } from "#lib/i18n.svelte";
    import SearchIcon from "@lucide/svelte/icons/search";
    import Cover from "#lib/components/tracks/Cover.svelte";
    import XIcon from "@lucide/svelte/icons/x";
    import LoaderIcon from "@lucide/svelte/icons/loader-circle";
    import FrownIcon from "@lucide/svelte/icons/frown";
    import LockIcon from "@lucide/svelte/icons/lock";
    import VerifiedBadge from "#lib/components/ui/VerifiedBadge.svelte";
    import { formatCount } from "#lib/utils/format";

    let LL = $derived(getLL());

    const MIN_QUERY_LENGTH = 2;

    let query = $state(page.url.searchParams.get("q") ?? "");
    let filter = $state<"all" | "track" | "user" | "artist">("all");

    type SearchResults = Omit<SearchResponse, "tracks"> & {
        tracks: Array<SearchResponse["tracks"][number] & { album: Album | null }>;
    };
    let results = $state<SearchResults | null>(null);
    let loading = $state(false);
    let error = $state("");
    let activeIndex = $state(-1);
    let debounceTimer: ReturnType<typeof setTimeout>;
    let searchSeq = 0;
    let inputEl: HTMLInputElement | undefined = $state();

    function formatDuration(ms: number | null): string {
        if (!ms) return "";
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }

    let artistMap: Record<number, string> = $state({});

    const usersOffset = $derived(results ? results.artists.length : 0);
    const tracksOffset = $derived(
        results ? results.artists.length + results.users.length : 0,
    );
    const combinedHrefs = $derived.by(() => {
        if (!results) return [] as string[];
        return [
            ...results.artists.map((a) => `/artist/${a.id}`),
            ...results.users.map((u) => `/user/${u.username}`),
            ...results.tracks.map((t) => `/track/${t.id}`),
        ];
    });

    async function runSearch(q: string) {
        const trimmed = q.trim();
        if (!trimmed || trimmed.length < MIN_QUERY_LENGTH) {
            searchSeq++;
            results = null;
            loading = false;
            return;
        }
        const seq = ++searchSeq;
        loading = true;
        error = "";
        try {
            const data = await search({ q: trimmed, filter });
            if (seq !== searchSeq) return; // superseded by a newer search
            results = data;
            activeIndex = -1;
            artistMap = Object.fromEntries(
                data.artists.map((a) => [a.id, a.name]),
            );
        } catch (err) {
            if (seq !== searchSeq) return;
            if (isHttpError(err)) {
                error = err.status === 419
                ? LL.search.error.rateLimit()
                : err.body.message;
            } else {
                error = (err as Error).message;
            }

            results = null;
        } finally {
            if (seq === searchSeq) loading = false;
        }
    }

    function syncUrl() {
        if (!browser) return;
        const url = new URL(window.location.href);
        if (query.trim()) url.searchParams.set("q", query.trim());
        else url.searchParams.delete("q");
        goto(url.toString(), {
            replace: true,
            shallow: true,
            state: page,
        });
    }

    function onInput() {
        clearTimeout(debounceTimer);
        error = "";
        syncUrl();
        if (!query.trim()) {
            searchSeq++;
            results = null;
            activeIndex = -1;
            return;
        }
        debounceTimer = setTimeout(() => runSearch(query), 450);
    }

    function clearSearch() {
        clearTimeout(debounceTimer);
        searchSeq++;
        query = "";
        results = null;
        error = "";
        activeIndex = -1;
        syncUrl();
        inputEl?.focus();
    }

    function onFilterChange() {
        if (query.trim()) runSearch(query);
    }

    function scrollActiveIntoView() {
        if (!browser) return;
        requestAnimationFrame(() => {
            document
                .querySelector(`[data-result-index="${activeIndex}"]`)
                ?.scrollIntoView({ block: "nearest" });
        });
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            if (query) {
                e.preventDefault();
                clearSearch();
            }
            return;
        }
        if (!combinedHrefs.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex =
                activeIndex < combinedHrefs.length - 1 ? activeIndex + 1 : 0;
            scrollActiveIntoView();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex =
                activeIndex > 0 ? activeIndex - 1 : combinedHrefs.length - 1;
            scrollActiveIntoView();
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            goto(combinedHrefs[activeIndex]);
        }
    }

    const isTooShort = $derived(
        query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH,
    );
    const hasResults = $derived(
        results &&
            (results.artists.length > 0 ||
                results.tracks.length > 0 ||
                results.users.length > 0),
    );
    const isEmpty = $derived(
        results &&
            results.artists.length === 0 &&
            results.tracks.length === 0 &&
            results.users.length === 0,
    );
</script>

<svelte:head>
    <meta name="robots" content="noindex, follow" />
    <title
        >{query
            ? LL.search.meta.titlePrefix({ query })
            : LL.search.meta.titleDefault()}{LL.search.meta.titleSuffix()}</title
    >
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <!-- Search input -->
    <div class="space-y-3">
        <div class="relative">
            <span
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none select-none"
            >
                <SearchIcon size={16} />
            </span>
            <input
                bind:this={inputEl}
                type="search"
                autocomplete="off"
                spellcheck="false"
                bind:value={query}
                oninput={onInput}
                onkeydown={onKeydown}
                placeholder={LL.search.input.placeholder()}
                aria-label={LL.search.input.placeholder()}
                class="w-full bg-card border border-border text-primary placeholder-tertiary
				       rounded-xl pl-9 pr-9 py-3 text-sm outline-none
				       focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors
				       [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            <span
                class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
            >
                {#if loading}
                    <LoaderIcon
                        size={16}
                        class="text-tertiary animate-spin"
                        aria-label={LL.search.input.loading()}
                    />
                {:else if query}
                    <button
                        type="button"
                        onclick={clearSearch}
                        aria-label="Clear"
                        class="cursor-pointer text-tertiary hover:text-primary p-1 rounded-full hover:bg-hover transition-colors"
                    >
                        <XIcon size={14} />
                    </button>
                {/if}
            </span>
        </div>

        <!-- Filters -->
        <div class="flex gap-1.5">
            {#each [["all", LL.search.filter.all()], ["artist", LL.search.filter.artists()], ["track", LL.search.filter.tracks()], ["user", LL.search.filter.users()]] as [val, label]}
                <button
                    onclick={() => {
                        if (filter === val) return;
                        filter = val as typeof filter;
                        onFilterChange();
                    }}
                    class="cursor-pointer text-xs px-3 py-1 rounded-full border transition-colors
					{filter === val
                        ? 'bg-accent text-accent-text border-accent'
                        : 'border-border text-tertiary hover:text-primary hover:border-border-hover bg-accent/10 backdrop-blur-xs'}"
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

    <!-- Query too short -->
    {#if isTooShort}
        <p class="text-sm text-tertiary py-4">
            {LL.search.input.tooShort()}
        </p>
    {/if}

    <!-- Empty results -->
    {#if isEmpty}
        <div class="flex flex-col items-center gap-2 text-center py-10">
            <FrownIcon size={22} class="text-quaternary" />
            <p class="text-sm text-tertiary">
                {LL.search.empty.prefix()}
                <span class="text-quaternary">"{query}"</span>.
            </p>
        </div>
    {/if}

    <!-- Results -->
    {#if hasResults}
        <div class="space-y-8 transition-opacity" class:opacity-50={loading}>
            <!-- Artists -->
            {#if results!.artists.length > 0 && (filter === "all" || filter === "artist")}
                <section class="space-y-3">
                    <h2
                        class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                    >
                        {LL.search.section.artists()}
                    </h2>
                    <ul class="space-y-px">
                        {#each results!.artists as artist, i (artist.id)}
                            <li>
                                <a
                                    href="/artist/{artist.id}"
                                    data-result-index={i}
                                    onmouseenter={() => (activeIndex = i)}
                                    class="flex items-center gap-3 py-2.5 group rounded-lg -mx-2 px-2 transition-colors
                                    {activeIndex === i
                                        ? 'bg-hover'
                                        : 'hover:bg-hover'}"
                                >
                                    <Avatar
                                        url={artist.image_url}
                                        name=""
                                        class="w-10 h-10 rounded-full object-cover shrink-0"
                                    />
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="text-sm text-secondary group-hover:text-primary transition-colors truncate"
                                        >
                                            {artist.name}
                                        </p>
                                        <p class="text-xs text-tertiary">
                                            {formatCount(artist.scrobble_count)}
                                            {LL.search.label.scrobbles()}
                                            · {formatCount(artist.listener_count)}
                                            {LL.search.label.listeners()}
                                        </p>
                                    </div>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}

            <!-- Users -->
            {#if results!.users.length > 0 && (filter === "all" || filter === "user")}
                <section class="space-y-3">
                    <h2
                        class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                    >
                        {LL.search.section.users()}
                    </h2>
                    <ul class="space-y-px">
                        {#each results!.users as user, i (user.id)}
                            <li>
                                <a
                                    href="/user/{user.username}"
                                    data-result-index={usersOffset + i}
                                    onmouseenter={() =>
                                        (activeIndex = usersOffset + i)}
                                    class="flex items-center gap-3 py-2.5 group rounded-lg -mx-2 px-2 transition-colors
                                    {activeIndex === usersOffset + i
                                        ? 'bg-hover'
                                        : 'hover:bg-hover'}"
                                >
                                    <Avatar
                                        url={user.image_url}
                                        name=""
                                        class="w-10 h-10 rounded-full object-cover shrink-0"
                                    />
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="text-sm text-secondary group-hover:text-primary transition-colors truncate flex items-center gap-1"
                                        >
                                            {user.display_name || user.username}
                                            {#if user.is_verified}
                                                <VerifiedBadge size={12} />
                                            {/if}
                                            {#if user.is_private}
                                                <LockIcon
                                                    size={12}
                                                    class="text-quaternary shrink-0"
                                                />
                                            {/if}
                                        </p>
                                        <p
                                            class="text-xs text-tertiary truncate"
                                        >
                                            @{user.username} · {formatCount(
                                                user.scrobble_count,
                                            )}
                                            {LL.search.label.scrobbles()}
                                        </p>
                                    </div>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}

            <!-- Tracks -->
            {#if results!.tracks.length > 0 && (filter === "all" || filter === "track")}
                <section class="space-y-3">
                    <h2
                        class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                    >
                        {LL.search.section.tracks()}
                    </h2>
                    <ul class="space-y-px">
                        {#each results!.tracks as track, i (track.id)}
                            <li>
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div
                                    data-result-index={tracksOffset + i}
                                    onmouseenter={() =>
                                        (activeIndex = tracksOffset + i)}
                                    class="flex items-center gap-3 py-2.5 group rounded-lg -mx-2 px-2 transition-colors
                                    {activeIndex === tracksOffset + i
                                        ? 'bg-hover'
                                        : 'hover:bg-hover'}"
                                >
                                    {#if track.album}
                                        <a href="/album/{track.album.id}" aria-label={track.album.title} class="shrink-0 rounded">
                                            <Cover url={track.album.image_url} alt={track.album.title} class="size-10 rounded" />
                                        </a>
                                    {:else}
                                        <Cover url={null} alt={track.title} class="size-10 rounded" />
                                    {/if}
                                    <div class="min-w-0 flex-1">
                                        <a href="/track/{track.id}" class="block text-sm text-secondary group-hover:text-primary transition-colors truncate">
                                            {track.title}
                                        </a>
                                        <p
                                            class="text-xs text-tertiary truncate"
                                        >
                                            {artistMap[track.artist_id] ??
                                                LL.search.label.unknownArtist()}
                                            {#if track.album}
                                                · <a href="/album/{track.album.id}" class="hover:text-secondary">{track.album.title}</a>
                                            {/if}
                                            {#if track.duration_ms}
                                                · {formatDuration(track.duration_ms)}
                                            {/if}
                                        </p>
                                    </div>
                                    <a href="/track/{track.id}" aria-label={track.title} class="text-xs text-tertiary tabular-nums shrink-0 hover:text-secondary">
                                        {formatCount(track.scrobble_count)}
                                    </a>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}
        </div>
    {/if}

    <!-- Estado inicial -->
    {#if !query.trim() && !results}
        <div class="flex flex-col items-center gap-2 text-center py-10">
            <SearchIcon size={22} class="text-quaternary" />
            <p class="text-sm text-tertiary">
                {LL.search.input.empty()}
            </p>
        </div>
    {/if}
</div>
