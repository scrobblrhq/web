<script lang="ts">
    import type { HTMLImgAttributes } from "svelte/elements";

    interface Props extends HTMLImgAttributes {
        url?: string | null;
        name?: string | null;
        class?: string;
    }

    let {
        url = null,
        name,
        class: className = "",
        width = 128,
        height = 128,
        loading = "lazy",
        decoding = "async",
        ...rest
    }: Props = $props();

    let initial = $derived(name ? name.charAt(0).toUpperCase() : "?");
</script>

{#if url}
    <img
        src={url}
        alt={name ?? ""}
        {width}
        {height}
        class="rounded-full object-cover shrink-0 {className}"
        {loading}
        {decoding}
        {...rest}
    />
{:else}
    <div
        class="rounded-full bg-card flex items-center justify-center font-bold text-tertiary select-none shrink-0 {className}"
        {...rest as Record<string, unknown>}
    >
        {initial}
    </div>
{/if}
