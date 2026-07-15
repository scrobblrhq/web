<script lang="ts">
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        text?: string | null;
        x?: number;
        y?: number;
        children?: Snippet;
    }

    let { text = null, x = 0, y = 0, children }: Props = $props();

    let hover = $state(false);
    let anchorX = $state(0);
    let anchorY = $state(0);

    let isWrapper = $derived(!!children);
    let visible = $derived(isWrapper ? (hover && !!text) : !!text);
    let posX = $derived(isWrapper ? anchorX : x);
    let posY = $derived(isWrapper ? anchorY : y);

    function enter(e: MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        anchorX = rect.left + rect.width / 2;
        anchorY = rect.top;
        hover = true;
    }

    function leave() {
        hover = false;
    }
</script>

{#if children}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span onmouseenter={enter} onmouseleave={leave}>
        {@render children()}
    </span>
{/if}

{#if visible}
    <div
        class="pointer-events-none fixed z-9999 px-2 py-1 rounded bg-active border border-border-hover text-xs text-secondary shadow-xl whitespace-nowrap"
        style="left: {posX}px; top: {posY - 8}px; transform: translateX(-50%) translateY(-100%);"
        transition:fade={{ duration: 100 }}
    >
        {text}
    </div>
{/if}
