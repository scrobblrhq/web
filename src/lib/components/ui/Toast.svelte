<script lang="ts">
    import { toasts, dismissToast } from "#lib/stores/toast.svelte";
    import type { ToastType } from "#lib/stores/toast.svelte";
    import { fly } from "svelte/transition";

    import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
    import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
    import InfoIcon from "@lucide/svelte/icons/info";
    import XCircleIcon from "@lucide/svelte/icons/x-circle";

    function border(type: ToastType) {
        switch (type) {
            case "success":
                return "border-green-900/50 bg-green-950/30";
            case "error":
                return "border-red-900/50 bg-red-950/30";
            case "info":
                return "border-border bg-card/80";
        }
    }
</script>

{#each toasts as toast, i (toast.id)}
    <div
        style="bottom: {24 + (toasts.length - 1 - i) * 50}px"
        class="fixed right-6 z-100 max-w-sm w-full pointer-events-auto will-change-transform"
        class:opacity-0={toast.exiting}
        transition:fly={{ y: 16, duration: 250, opacity: 0 }}
    >
        <div
            class="rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm flex items-start gap-3 {border(toast.type)}"
        >
            {#if toast.type === "success"}
                <CheckCircleIcon size={16} class="shrink-0 mt-0.5 text-green-400" />
            {:else if toast.type === "error"}
                <AlertCircleIcon size={16} class="shrink-0 mt-0.5 text-red-400" />
            {:else}
                <InfoIcon size={16} class="shrink-0 mt-0.5 text-quaternary" />
            {/if}
            <p class="text-sm text-secondary flex-1 min-w-0">{toast.message}</p>
            <button
                onclick={() => dismissToast(toast.id)}
                class="shrink-0 text-tertiary hover:text-quaternary transition-colors cursor-pointer"
            >
                <XCircleIcon size={14} />
            </button>
        </div>
    </div>
{/each}
