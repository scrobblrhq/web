<script lang="ts">
    import type { HTMLImgAttributes } from "svelte/elements";

    interface Props extends HTMLImgAttributes {
        url?: string | null;
        alt: string;
        class?: string;
    }

    import Music2Icon from "@lucide/svelte/icons/music-2";

    let {
        url = null,
        alt,
        class: className = "",
        width = 256,
        height = 256,
        loading = "lazy",
        decoding = "async",
        ...rest
    }: Props = $props();
</script>

{#if url}
    <img
        src={url}
        {alt}
        {width}
        {height}
        {loading}
        {decoding}
        {...rest}
        draggable="false"
        class="rounded object-cover shrink-0 {className}"
    />
{:else}
    <div
        class="rounded bg-card shrink-0 flex items-center justify-center {className}"
    >
        <Music2Icon size={16} class="text-quaternary" />
    </div>
{/if}
