<script lang="ts">
  import { slide } from "svelte/transition";
  import { getLL } from "#lib/i18n.svelte";

  import SaveIcon from "@lucide/svelte/icons/save";
  import SavedIcon from "@lucide/svelte/icons/check-circle";
  import DiscardIcon from "@lucide/svelte/icons/x-circle";

  let LL = $derived(getLL());

  const {
    saved,
    onDiscard,
    formId,
    isDesktop,
  }: { saved: boolean; onDiscard?: () => void; formId?: string; isDesktop?: boolean } = $props();
</script>
<div
  class="fixed inset-x-0 bottom-6 z-30 mx-auto flex w-fit items-center justify-center gap-3 rounded-xl border border-border bg-surface/80 px-5 py-3 shadow-lg backdrop-blur-sm"
  transition:slide={{ axis: "y", duration: 200 }}
>
  <p class="text-sm text-tertiary">
    {saved ? LL.confirmChanges.saved() : LL.confirmChanges.unsaved()}
  </p>
  {#if onDiscard && !saved}
    <button
      type="button"
      onclick={onDiscard}
      class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-tertiary transition-colors hover:text-primary hover:bg-hover"
    >
      {#if isDesktop}
        {LL.confirmChanges.discard()}
      {:else}
        <DiscardIcon />
      {/if}
    </button>
  {/if}
  <button
    type="submit"
    form={formId}
    disabled={saved}
    class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-text transition-opacity hover:opacity-90 disabled:opacity-50"
  >
    {#if isDesktop}
      {saved ? LL.confirmChanges.savedButton() : LL.confirmChanges.saveButton()}
    {:else}
      {#if saved}
        <SavedIcon />
      {:else}
        <SaveIcon />
      {/if}
    {/if}
  </button>
</div>
