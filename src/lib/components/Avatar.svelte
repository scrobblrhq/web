<script lang="ts">
    interface Props {
        url?: string | null;
        name: string;
        class?: string;
    }

    let { url = null, name, class: className = "" }: Props = $props();

    let initial = $derived(name ? name.charAt(0).toUpperCase() : "?");
</script>

{#if url}
    <img
        src={url}
        alt={name}
        class="rounded-full object-cover shrink-0 {className}"
    />
{:else}
    <div
        class="rounded-full bg-card flex items-center justify-center font-bold text-tertiary select-none shrink-0 {className}"
    >
        {initial}
    </div>
{/if}
