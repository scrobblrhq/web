<script lang="ts">
    import type { ScrobbleRich } from "#lib/api/types";
    import Cover from "#lib/components/tracks/Cover.svelte";
    import { getLL } from "#lib/i18n.svelte";

    let LL = $derived(getLL());
    let { recent }: { recent: Promise<ScrobbleRich[]> } = $props();
</script>

<div class="profile-hero relative min-h-48 overflow-hidden border-b border-border/60 bg-[#161a17] sm:min-h-56">
    {#await recent then recentScrobbles}
        {#if recentScrobbles.length}
            <div class="profile-art absolute inset-[-8%] flex items-center justify-end gap-0 overflow-hidden px-0">
                {#each recentScrobbles.slice(0, 7) as scrobble, index (scrobble.id)}
                    {@const rotation = (index % 2 ? 1 : -1) * (2 + index)}
                    <a
                        href="/track/{scrobble.track_id}"
                        style="transform: rotate({rotation}deg)"
                        class="group relative -mx-5 h-[calc(100%+2rem)] min-w-20 flex-1 overflow-hidden border border-white/15 bg-card transition-opacity duration-300 hover:z-10 sm:min-w-28 {index >= 4 ? 'hidden sm:block' : ''}"
                    >
                        <Cover
                            url={scrobble.album_image}
                            alt={scrobble.album_title ?? scrobble.track_title}
                            class="size-full object-cover grayscale-15 opacity-75 transition-[filter,opacity] duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                        />
                        <span class="absolute inset-x-0 bottom-0 truncate bg-black/65 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {scrobble.track_title}
                        </span>
                    </a>
                {/each}
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_18%_36%,rgba(199,243,107,0.2),transparent_28%),linear-gradient(90deg,#161a17_0%,rgba(22,26,23,0.72)_42%,rgba(22,26,23,0.08)_100%)]"></div>
            </div>
        {:else}
            <div class="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_20%_10%,rgba(199,243,107,0.18),transparent_32%)] px-5 pt-8 sm:px-8">
                <span class="max-w-full text-center text-xs uppercase tracking-[0.18em] text-white/55">{LL.profile.empty.recentScrobbles()}</span>
            </div>
        {/if}
    {:catch}
        <div class="absolute inset-0 bg-[#161a17]"></div>
    {/await}
    <div class="profile-reveal absolute left-5 top-4 max-w-[16rem] text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:left-8 sm:top-5">
        {LL.profile.section.recentScrobbles()}
    </div>
</div>
