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
        loading = "lazy",
        decoding = "async",
        ...props
    }: Props = $props();

    let initial = $derived(name ? name.charAt(0).toUpperCase() : "?");
</script>

{#if url}
    <img
        src={url}
        alt={name ?? ""}
        class="rounded-full object-cover shrink-0 {className}"
        {loading}
        {decoding}
        {...props}
    />
{:else}
    <div
        class="rounded-full bg-card flex items-center justify-center font-bold text-tertiary select-none shrink-0 {className}"
        {...props as Record<string, unknown>}
    >
        {initial}
    </div>
{/if}
