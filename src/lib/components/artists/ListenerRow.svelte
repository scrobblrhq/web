<script lang="ts">
    import type { TopListener } from "@scrobblr/types";
    import { formatCount } from "#lib/utils/format";
    import Avatar from "../ui/Avatar.svelte";

    interface Props {
        listener: TopListener;
        rank: number;
    }

    let { listener, rank }: Props = $props();
</script>

<a
    href="/user/{listener.username}"
    class="flex items-center gap-2.5 hover:bg-hover/70 -mx-2 px-2 py-2 rounded-xl transition-[background-color] duration-200"
>
    <span class="text-xs text-quaternary w-4 tabular-nums shrink-0">{rank}</span>
    <Avatar
        url={listener.image_url}
        name={listener.display_name || listener.username}
        class="w-7 h-7 text-xs"
    />
    <span class="text-sm text-secondary truncate flex-1"
        >{listener.display_name || listener.username}</span
    >
    <span class="text-xs text-tertiary tabular-nums shrink-0"
        >{formatCount(listener.play_count)}</span
    >
</a>
