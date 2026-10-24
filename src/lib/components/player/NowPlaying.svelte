<script lang="ts">
    import type { NowPlayingRich } from "#lib/api/types";
    import Cover from "../tracks/Cover.svelte";
    import { getLL } from "#lib/i18n.svelte";

    interface Props {
        data: NowPlayingRich;
    }

    let { data }: Props = $props();
    let LL = $derived(getLL());
</script>

<section
    class="relative overflow-hidden flex items-center gap-4 sm:gap-5 px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-border/70 backdrop-blur-xs bg-linear-to-r from-card via-card/90 to-accent/10 shadow-[0_16px_42px_rgba(9,9,11,0.06)]"
    role="status"
    aria-live="polite"
>
    <div class="absolute inset-y-0 left-0 w-1 bg-accent"></div>
    <Cover
        url={data.album_image}
        alt={data.album_title ?? data.track_title}
        class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl ring-1 ring-black/10 shadow-md"
    />
    <div class="min-w-0 flex-1 py-0.5">
        <div class="flex items-center mb-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text dark:text-accent sm:text-[11px] sm:tracking-[0.22em]">
                {LL.nowPlaying.label()}
            </span>
        </div>
        <p class="text-sm sm:text-base font-semibold tracking-tight text-primary truncate">
            {data.track_title}
        </p>
        <p class="text-xs sm:text-sm text-tertiary truncate">{data.artist_name}</p>
    </div>
    <div class="shrink-0 flex items-center gap-2 pl-2 sm:pr-1">
        <span class="hidden sm:block text-[10px] uppercase tracking-[0.16em] text-quaternary">Live</span>
        <span class="flex items-end gap-1 h-7" aria-hidden="true">
            <span class="w-1 bg-accent rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style="height:55%"></span>
            <span class="w-1 bg-accent rounded-full animate-[bounce_0.8s_ease-in-out_0.15s_infinite]" style="height:100%"></span>
            <span class="w-1 bg-accent rounded-full animate-[bounce_0.8s_ease-in-out_0.3s_infinite]" style="height:70%"></span>
            <span class="w-1 bg-accent rounded-full animate-[bounce_0.8s_ease-in-out_0.45s_infinite]" style="height:85%"></span>
        </span>
    </div>
</section>
