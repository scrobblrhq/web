<script lang="ts">
    import type { PageProps } from "./$types";
    import { page } from "$app/state";
    import { discordComponentEmbed, serializeJsonForHtml } from "#lib/seo";
    import type { S } from "#lib/api/types";
    import { featureCopy } from "#lib/i18n/features";
    import { formatCount, formatDate } from "#lib/utils/format";
    import Music2Icon from "@lucide/svelte/icons/music-2";

    let { data }: PageProps = $props();
    const copy = $derived(featureCopy(data.lang).rankings);
    const pageNumber = $derived(Math.floor(data.offset / 50) + 1);
    const hasPrevious = $derived(data.offset > 0);
    const hasNext = $derived(data.ranking !== null && data.offset + data.ranking.entries.length < data.ranking.total);
    const pageUrl = $derived(`${page.url.origin}/rankings?${new URLSearchParams({ type: data.kind, period: data.period, offset: String(data.offset) })}`);
    const metaTitle = $derived(`${copy.title} — Scrobblr`);
    const discordJson = $derived(serializeJsonForHtml(discordComponentEmbed({ title: metaTitle, description: copy.description, url: pageUrl })));

    function href(overrides: { type?: string; period?: string; offset?: number } = {}) {
        const type = overrides.type ?? data.kind;
        const period = overrides.period ?? data.period;
        const offset = overrides.offset ?? data.offset;
        return `/rankings?${new URLSearchParams({ type, period, offset: String(offset) })}`;
    }

</script>

<svelte:head>
    <title>{metaTitle}</title>
    <meta name="description" content={copy.description} />
    <link rel="canonical" href={pageUrl} />
    <meta property="og:site_name" content="Scrobblr" />
    <meta property="og:title" content={metaTitle} />
    <meta property="og:description" content={copy.description} />
    <meta property="og:url" content={pageUrl} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={metaTitle} />
    <meta name="twitter:description" content={copy.description} />
    <script id="discord:component-embed" type="application/json">{@html discordJson}</script>
</svelte:head>

<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    <header class="mb-9 border-b border-border/70 pb-7">
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent mb-3">Scrobblr / discovery</p>
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
                <h1 class="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-primary">{copy.title}</h1>
                <p class="text-sm text-tertiary mt-2 max-w-xl">{copy.description}</p>
            </div>
            {#if data.ranking}
                <div class="text-xs text-tertiary sm:text-right">
                    <p>{copy.computed.replace("{date}", formatDate(data.ranking.computed_at))}</p>
                    <p class="mt-1">{copy.coverage.replace("{from}", data.ranking.from).replace("{to}", data.ranking.to)}</p>
                </div>
            {/if}
        </div>
    </header>

    <div class="flex flex-col gap-5 mb-6">
        <nav aria-label="Ranking type" class="flex gap-1 border-b border-border/70">
            {#each [{ value: "artists", label: copy.artists }, { value: "tracks", label: copy.tracks }] as tab}
                <a
                    href={href({ type: tab.value, offset: 0 })}
                    aria-current={data.kind === tab.value ? "page" : undefined}
                    class="px-4 py-3 text-sm border-b-2 transition-colors {data.kind === tab.value ? 'border-accent text-primary' : 'border-transparent text-tertiary hover:text-primary'}"
                >{tab.label}</a>
            {/each}
        </nav>

        <div class="flex flex-wrap gap-2" aria-label={copy.periodLabel}>
            {#each [{ value: "week", label: copy.week }, { value: "month", label: copy.month }, { value: "year", label: copy.year }] as item}
                <a
                    href={href({ period: item.value, offset: 0 })}
                    aria-current={data.period === item.value ? "true" : undefined}
                    class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {data.period === item.value ? 'border-accent/50 bg-active text-primary' : 'border-border text-tertiary hover:text-primary hover:border-border-hover'}"
                >{item.label}</a>
            {/each}
        </div>
    </div>

    {#if data.ranking?.stale}
        <p class="mb-4 rounded-lg border border-border/70 bg-card/50 px-4 py-3 text-xs text-tertiary">{copy.stale}</p>
    {/if}

    {#if !data.ranking || data.ranking.entries.length === 0}
        <div class="rounded-xl border border-border/70 bg-card/40 px-6 py-12 text-center">
            <p class="text-sm text-secondary">{copy.empty}</p>
        </div>
    {:else}
        <section aria-label={data.kind === "artists" ? copy.artists : copy.tracks} class="border-t border-border/70">
            {#each data.ranking.entries as entry (entry.position)}
                <article class="grid grid-cols-[2.5rem_3rem_minmax(0,1fr)_auto] sm:grid-cols-[3rem_3.5rem_minmax(0,1fr)_8rem_9rem] items-center gap-3 sm:gap-4 border-b border-border/60 py-3.5">
                    <span class="font-mono text-sm tabular-nums text-tertiary"><span class="sr-only">{copy.position} </span>{String(entry.position).padStart(2, "0")}</span>
                    {#if data.kind === "artists"}
                        {@const artist = entry as S["RankedArtist"]}
                        {#if artist.image_url}<img src={artist.image_url} alt="" class="size-11 rounded-lg object-cover bg-input" loading="lazy" />{:else}<div class="size-11 rounded-lg bg-input flex items-center justify-center text-tertiary"><Music2Icon size={17} /></div>{/if}
                        <a href={`/artist/${artist.artist_id}`} class="min-w-0 truncate text-sm font-medium text-primary hover:text-accent transition-colors">{artist.artist_name}</a>
                        <span class="hidden sm:block text-right text-xs tabular-nums text-secondary">{formatCount(artist.listeners)} <span class="text-tertiary">{copy.listeners}</span></span>
                        <span class="hidden sm:block text-right text-xs tabular-nums text-tertiary">{formatCount(artist.plays)} {copy.plays}</span>
                    {:else}
                        {@const track = entry as S["RankedTrack"]}
                        {#if track.album_image}<img src={track.album_image} alt="" class="size-11 rounded-lg object-cover bg-input" loading="lazy" />{:else}<div class="size-11 rounded-lg bg-input flex items-center justify-center text-tertiary"><Music2Icon size={17} /></div>{/if}
                        <div class="min-w-0">
                            <a href={`/track/${track.track_id}`} class="block truncate text-sm font-medium text-primary hover:text-accent transition-colors">{track.track_title}</a>
                            <a href={`/artist/${track.artist_id}`} class="block truncate text-xs text-tertiary hover:text-secondary">{track.artist_name}</a>
                        </div>
                        <span class="hidden sm:block text-right text-xs tabular-nums text-secondary">{formatCount(track.listeners)} <span class="text-tertiary">{copy.listeners}</span></span>
                        <span class="hidden sm:block text-right text-xs tabular-nums text-tertiary">{formatCount(track.plays)} {copy.plays}</span>
                    {/if}
                </article>
            {/each}
        </section>

        <nav aria-label="Pagination" class="mt-6 flex items-center justify-between">
            {#if hasPrevious}
                <a href={href({ offset: data.offset - 50 })} class="rounded-lg border border-border px-3 py-2 text-xs text-secondary hover:text-primary hover:bg-hover">← {copy.previous}</a>
            {:else}<span></span>{/if}
            <span class="text-xs text-tertiary">{copy.page.replace("{page}", String(pageNumber))}</span>
            {#if hasNext}
                <a href={href({ offset: data.offset + 50 })} class="rounded-lg border border-border px-3 py-2 text-xs text-secondary hover:text-primary hover:bg-hover">{copy.next} →</a>
            {:else}<span></span>{/if}
        </nav>
    {/if}
</main>
