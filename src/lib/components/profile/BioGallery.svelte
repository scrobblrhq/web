<script lang="ts">
    import { ChevronRight } from "@lucide/svelte";

    type Item = { image: string; alt?: string };

    interface Props {
        items: Item[];
        viewLabel: string;
        countLabel: string;
        onopen: (items: Item[], trigger: HTMLElement) => void;
    }

    let { items, viewLabel, countLabel, onopen }: Props = $props();

    const MAX_THUMBS = 3;

    const thumbs = $derived(items.slice(0, MAX_THUMBS));
    const extra = $derived(Math.max(0, items.length - MAX_THUMBS));
</script>

{#if items.length >= 2}
    <div class="mt-3 px-4 sm:px-6 flex justify-center sm:justify-start">
        <button
            type="button"
            aria-haspopup="dialog"
            onclick={(e) => onopen(items, e.currentTarget)}
            class="group inline-flex items-center gap-3 rounded-xl border border-border bg-card/60 py-2 pl-2 pr-3 text-left transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
            <span class="flex items-center" aria-hidden="true">
                {#each thumbs as t, i (i)}
                    <img
                        src={t.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        class="relative size-11 rounded-lg object-cover ring-2 ring-surface {i > 0 ? '-ml-4' : ''}"
                        style="z-index: {thumbs.length - i}"
                    />
                {/each}
                {#if extra > 0}
                    <span
                        class="relative -ml-4 grid size-11 place-items-center rounded-lg bg-card text-xs font-semibold text-secondary ring-2 ring-surface"
                    >
                        +{extra}
                    </span>
                {/if}
            </span>

            <span class="flex flex-col leading-tight">
                <span class="text-sm font-medium text-secondary">{viewLabel}</span>
                <span class="text-xs text-tertiary">{countLabel}</span>
            </span>

            <ChevronRight
                class="size-4 text-tertiary transition-transform group-hover:translate-x-0.5"
            />
        </button>
    </div>
{/if}