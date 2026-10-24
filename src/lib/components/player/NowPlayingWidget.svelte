<script lang="ts">
    import type { PublicUser } from "#lib/api/types";
    import { page } from "$app/state";
    import { fly } from "svelte/transition";
    import { useNowPlaying } from "#lib/hooks/nowPlaying.svelte";
    import { getLL } from "#lib/i18n.svelte";
    import Cover from "../tracks/Cover.svelte";

    interface Props {
        user: PublicUser | undefined;
    }

    let { user }: Props = $props();
    let LL = $derived(getLL());

    const nowPlaying = useNowPlaying(() => user?.username);

    const onOwnProfile = $derived(
        !!user && page.url.pathname === `/user/${user.username}`,
    );

    const track = $derived(onOwnProfile ? null : nowPlaying.current);

    function truncate(title: string, max = 24) {
        return title.length > max ? `${title.slice(0, max - 1)}…` : title;
    }
</script>

{#if track}
    <div
        class="fixed bottom-[calc(0.9rem+env(safe-area-inset-bottom))] right-3 z-50 max-w-[min(18rem,calc(100vw-1rem))] sm:bottom-6 sm:right-6 sm:max-w-[min(24rem,calc(100vw-1.5rem))]"
        transition:fly={{ y: 18, duration: 220, easing: (t) => 1 - Math.pow(1 - t, 3) }}
    >
        <div
            class="relative isolate overflow-hidden rounded-[1.15rem] border border-border/80 bg-linear-to-br from-card/90 via-card/82 to-card/80 shadow-[0_20px_55px_rgba(9,9,11,0.12)] backdrop-blur-2xl sm:rounded-[1.3rem]"
        >
            <div class="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-accent/80 to-transparent"></div>
            <div class="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-accent/15 blur-2xl sm:h-24 sm:w-24"></div>

            <div class="flex items-center gap-2.5 p-2 pr-2.5 sm:gap-3 sm:p-2.5 sm:pr-3">
                <div class="relative shrink-0">
                    <Cover
                        url={track.album_image}
                        alt="{track.artist_name} - {track.track_title}"
                        class="h-11 w-11 rounded-lg ring-1 ring-border/80 sm:h-14 sm:w-14 sm:rounded-xl"
                    />
                    <span class="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full border border-card bg-accent shadow-[0_0_0_3px_rgba(186,225,102,0.18)]"></span>
                </div>

                <div class="min-w-0 flex-1">
                    <div class="mb-0.5 flex items-center justify-between gap-2 sm:mb-1">
                        <span class="text-[0.56rem] font-mono uppercase tracking-[0.18em] text-accent-text dark:text-accent sm:text-[0.62rem] sm:tracking-[0.2em]">
                            {LL.nowPlaying.label()}
                        </span>
                    </div>

                    <h4 class="mb-0.5 truncate text-[0.76rem] font-semibold leading-tight text-primary sm:mb-1 sm:text-sm">
                        {truncate(track.track_title, 24)}
                    </h4>
                    <p class="truncate font-mono text-[0.62rem] text-tertiary uppercase tracking-[0.08em] sm:text-[0.68rem] sm:tracking-[0.09em]">
                        {track.artist_name}
                    </p>
                </div>

                <div class="flex h-7 shrink-0 items-end gap-1 pl-1 sm:h-8">
                    <span class="inline-block w-1 rounded-full bg-secondary/95 animate-[bounce_0.8s_ease-in-out_infinite]" style="height: 30%"></span>
                    <span class="inline-block w-1 rounded-full bg-secondary/95 animate-[bounce_0.8s_ease-in-out_0.12s_infinite]" style="height: 75%"></span>
                    <span class="inline-block w-1 rounded-full bg-secondary/95 animate-[bounce_0.8s_ease-in-out_0.24s_infinite]" style="height: 45%"></span>
                </div>
            </div>
        </div>
    </div>
{/if}
