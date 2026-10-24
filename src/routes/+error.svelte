<script lang="ts">
    import { page } from "$app/state";
    import { getLL } from "#lib/i18n.svelte";

    let LL = $derived(getLL());
</script>

<svelte:head>
    <meta name="robots" content="noindex, nofollow" />
    <title>{page.status}{LL.error.meta.titleSuffix()}</title>
</svelte:head>

<div class="min-h-screen bg-surface flex items-center justify-center px-4">
    <div class="text-center space-y-4">
        <p class="text-7xl font-bold text-quaternary tabular-nums select-none">
            {page.status}
        </p>

        <p class="text-base text-tertiary">
            {#if page.status === 404}
                {LL.error['404']()}
            {:else if page.status === 403}
                {LL.error['403']()}
            {:else if page.status === 401}
                {LL.error['401']()}
            {:else}
                {LL.error.generic()}
            {/if}
        </p>

        {#if page.error?.message && page.status >= 500}
            <p class="text-xs text-tertiary font-mono">{page.error.message}</p>
        {/if}

        <div class="flex items-center justify-center gap-3 pt-2">
            <a
                href="/"
                class="text-sm text-tertiary hover:text-primary transition-colors"
            >
                {LL.error.backHome()}
            </a>
        </div>
    </div>
</div>
