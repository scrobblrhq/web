<script lang="ts">
    import type { Snippet } from "svelte";
    import { X } from "@lucide/svelte";
    import { fade } from "svelte/transition";

    interface Props {
        open: boolean;
        onclose: () => void;
        children: Snippet;
        panelClass?: string;
        label?: string;
    }

    let {
        open,
        onclose,
        children,
        panelClass = "max-w-sm p-6",
        label,
    }: Props = $props();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") onclose();
    }

    function clickOutside(node: HTMLElement, callback?: () => void) {
        const handleClick = (event: MouseEvent) => {
            if (
                node &&
                !node.contains(event.target as Node) &&
                !event.defaultPrevented
            ) {
                callback?.();
            }
        };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            },
        };
    }
</script>

<svelte:window onkeydown={handleKeydown} />
{#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events a11y_interactive_supports_focus -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 min-h-screen backdrop-blur-sm px-4"
        onkeydown={handleKeydown}
        onclick={onclose}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabindex="-1"
        transition:fade={{ duration: 150 }}
        use:clickOutside={() => (open = false)}
    >
        <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
        <div
            class="bg-card/70 backdrop-blur-xl border border-white/15 dark:border-white/10 rounded-xl w-full shadow-2xl relative space-y-4 flex flex-col items-center {panelClass}"
            onclick={(e) => e.stopPropagation()}
            onkeydown={handleKeydown}
        >
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                class="absolute top-4 right-4 cursor-pointer"
                onclick={onclose}
            >
                <X class="text-secondary" />
            </div>
            {@render children()}
        </div>
    </div>
{/if}
