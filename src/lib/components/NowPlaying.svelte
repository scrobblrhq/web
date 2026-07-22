<script lang="ts">
    import type { NowPlayingRich } from "$lib/api/types";
    import Cover from "./Cover.svelte";
    import { getLL } from "$lib/i18n.svelte";

    interface Props {
        data: NowPlayingRich;
    }

    let { data }: Props = $props();
    let LL = $derived(getLL());
</script>

<section class="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
    <Cover url={data.album_image} alt={data.album_title ?? data.track_title} class="w-10 h-10" />
    <div class="min-w-0">
        <p class="text-sm font-medium truncate">{data.track_title}</p>
        <p class="text-xs text-tertiary truncate">{data.artist_name}</p>
    </div>
    <div class="ml-auto shrink-0 flex items-center gap-1.5">
        <span class="flex items-end gap-0.5 h-3">
            <span class="w-0.5 bg-secondary rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style="height:100%"></span>
            <span class="w-0.5 bg-secondary rounded-full animate-[bounce_0.8s_ease-in-out_0.15s_infinite]" style="height:60%"></span>
            <span class="w-0.5 bg-secondary rounded-full animate-[bounce_0.8s_ease-in-out_0.3s_infinite]" style="height:80%"></span>
        </span>
        <span class="text-xs text-secondary font-medium">{LL.nowPlaying.label()}</span>
    </div>
</section>
