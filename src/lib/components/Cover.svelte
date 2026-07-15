<script lang="ts">
    interface Props {
        url?: string | null;
        alt: string;
        class?: string;
    }

    import Music2Icon from "@lucide/svelte/icons/music-2";

    let { url = null, alt, class: className = "" }: Props = $props();
</script>

{#if url}
    <img src={url} {alt} class="rounded object-cover shrink-0 {className}" />
{:else}
    <div
        class="rounded bg-card shrink-0 flex items-center justify-center {className}"
    >
        <Music2Icon size={16} class="text-quaternary" />
    </div>
{/if}
