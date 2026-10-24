<script lang="ts">
    import type { PageProps } from "./$types";
    import { page } from "$app/state";
    import { formatCount } from "#lib/utils/format";
    import { getLL } from "#lib/i18n.svelte";
    import Cover from "#lib/components/tracks/Cover.svelte";
    import HeadphonesIcon from "@lucide/svelte/icons/headphones";
    import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
    import Music2Icon from "@lucide/svelte/icons/music-2";

    const { data }: PageProps = $props();
    const { album, artist } = $derived(data);
    let LL = $derived(getLL());
    const releaseYear = $derived(album.release_date?.slice(0, 4) ?? null);
    const metaDescription = $derived(
        `${album.title} by ${artist.name} on Scrobblr: ${formatCount(album.scrobble_count)} ${LL.track.stat.scrobbles().toLowerCase()}.`.slice(0, 160),
    );
</script>

<svelte:head>
    <title>{album.title} — Scrobblr</title>
    <meta name="description" content={metaDescription} />
    <link rel="canonical" href={`${page.url.origin}${page.url.pathname}`} />
    <meta property="og:title" content={`${album.title} - ${artist.name}`} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:url" content={`${page.url.origin}${page.url.pathname}`} />
    <meta property="og:type" content="music.album" />
    {#if album.image_url}<meta property="og:image" content={album.image_url} />{/if}
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="media-detail-page mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
    <section class="media-hero relative isolate overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card/90 via-card/75 to-accent/10 p-5 shadow-[0_18px_50px_rgba(9,9,11,0.055)] sm:p-8">
        <div class="absolute inset-y-0 left-0 w-1 bg-accent"></div>
        <div class="relative flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
            <Cover url={album.image_url} alt={album.title} class="size-36 rounded-2xl ring-1 ring-white/10 shadow-xl sm:size-52" />
            <div class="min-w-0 sm:flex-1 sm:self-center">
                <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">Album</p>
                <h1 class="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-primary sm:text-5xl">{album.title}</h1>
                <a href="/artist/{artist.id}" class="mt-4 inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-primary sm:text-base">
                    <Music2Icon size={15} class="text-accent" />{artist.name}
                </a>
            </div>
        </div>
    </section>

    <section aria-label="Album information" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="media-stat rounded-2xl border border-border/70 bg-card/45 px-5 py-4 shadow-[0_12px_30px_rgba(9,9,11,0.045)]">
            <div class="mb-2 flex size-8 items-center justify-center rounded-lg bg-hover/60 text-quaternary"><HeadphonesIcon size={14} /></div>
            <p class="text-xs text-tertiary">{LL.track.stat.scrobbles()}</p>
            <p class="text-lg font-semibold tabular-nums text-primary">{formatCount(album.scrobble_count)}</p>
        </div>
        {#if releaseYear}
            <div class="media-stat rounded-2xl border border-border/70 bg-card/45 px-5 py-4 shadow-[0_12px_30px_rgba(9,9,11,0.045)]">
                <div class="mb-2 flex size-8 items-center justify-center rounded-lg bg-hover/60 text-quaternary"><CalendarDaysIcon size={14} /></div>
                <p class="text-xs text-tertiary">{LL.album.releaseYear()}</p>
                <p class="text-lg font-semibold tabular-nums text-primary">{releaseYear}</p>
            </div>
        {/if}
    </section>
</main>
