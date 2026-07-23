<script lang="ts">
    import type { SessionUser } from "$lib/api/types";
    import { page } from "$app/state";
    import { fly } from "svelte/transition";
    import { useNowPlaying } from "$lib/hooks/nowPlaying.svelte";
    import { getLL } from "$lib/i18n.svelte";
    import Cover from "./Cover.svelte";

    interface Props {
        user: SessionUser | undefined;
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
        class="fixed bottom-8 right-8 z-50 flex items-center gap-3 p-3 rounded-2xl border border-border bg-linear-to-r from-card/70 to-accent/40 backdrop-blur-2xl shadow-2xl"
        transition:fly={{ y: 20, duration: 200 }}
    >
        <Cover
            url={track.album_image}
            alt="{track.artist_name} - {track.track_title}"
            class="w-12 h-12"
        />

        <div class="flex flex-col pr-2 min-w-0">
            <span
                class="text-[10px] uppercase tracking-[0.2em] text-accent/ font-mono mb-1"
            >
                {LL.nowPlaying.label()}
            </span>
            <h4
                class="text-sm font-semibold text-primary leading-none mb-1 truncate"
            >
                {truncate(track.track_title)}
            </h4>
            <p class="text-xs text-tertiary font-mono truncate">
                {track.artist_name}
            </p>
        </div>

        <span class="flex items-end gap-0.5 h-3 shrink-0">
            <span class="w-0.5 bg-secondary rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style="height:100%"></span>
            <span class="w-0.5 bg-secondary rounded-full animate-[bounce_0.8s_ease-in-out_0.15s_infinite]" style="height:60%"></span>
            <span class="w-0.5 bg-secondary rounded-full animate-[bounce_0.8s_ease-in-out_0.3s_infinite]" style="height:80%"></span>
        </span>
    </div>
{/if}
