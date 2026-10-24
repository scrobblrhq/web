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

    function move(e: MouseEvent) {
        anchorX = e.clientX;
        anchorY = e.clientY;
        hover = true;
    }

    function enter(e: MouseEvent) {
        move(e);
    }

    function leave() {
        hover = false;
    }
</script>

{#if children}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span onmouseenter={enter} onmousemove={move} onmouseleave={leave}>
        {@render children()}
    </span>
{/if}

{#if visible}
    <div
        class="pointer-events-none fixed z-9999 px-2 py-1 rounded bg-active border border-border-hover text-xs text-secondary shadow-xl whitespace-nowrap"
        style="left: {posX - x + 10}px; top: {posY - y + 10}px;"
        transition:fade={{ duration: 100 }}
    >
        {text}
    </div>
{/if}
