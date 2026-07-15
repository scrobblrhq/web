<script lang="ts">
    import Modal from "../Modal.svelte";
    import { getLL } from "$lib/i18n.svelte";

    interface Props {
        open: boolean;
        onclose: () => void;
    }

    let { open, onclose }: Props = $props();
    let LL = $derived(getLL());
</script>

<Modal {open} {onclose}>
    <h2 class="text-base font-semibold mb-2">{LL.authModal.title()}</h2>
    <p class="text-sm text-tertiary leading-relaxed">
        {LL.authModal.description()}
    </p>
    <div class="mt-5 flex gap-2 justify-end">
        <button
            onclick={onclose}
            class="text-sm px-3 py-1.5 rounded-md text-tertiary hover:text-primary hover:bg-hover transition-colors"
        >
            {LL.authModal.cancel()}
        </button>
        <a
            href="/login"
            class="text-sm px-3 py-1.5 rounded-md bg-accent text-accent-text hover:opacity-90 transition-colors font-medium"
        >
            {LL.authModal.login()}
        </a>
    </div>
</Modal>
