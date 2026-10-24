<script lang="ts">
    import { addToast } from "#lib/stores/toast.svelte";
    import RefreshIcon from "@lucide/svelte/icons/refresh-cw";
    import AuthModal from "../auth/AuthModal.svelte";
    import { getLL } from "#lib/i18n.svelte";
    import { refresh } from "#lib/remote/catalog.remote";
    import { isHttpError } from "@sveltejs/kit";

    interface Props {
        kind: "artist" | "track";
        id: number;
        signedIn: boolean;
    }

    let { kind, id, signedIn }: Props = $props();
    let LL = $derived(getLL());

    let showAuthModal = $state(false);
    let refreshing = $state(false);

    async function refreshNow() {
        if (!signedIn) { showAuthModal = true; return; }
        refreshing = true;
        try {
            await refresh({ kind, id });
            addToast(LL.refresh.success());
        } catch (err) {
            addToast(isHttpError(err) ? err.body.message : (err as Error).message, "error");
        } finally {
            refreshing = false;
        }
    }
</script>

<button
    onclick={refreshNow}
    disabled={refreshing}
    class="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-md text-tertiary hover:text-primary hover:bg-hover transition-colors disabled:opacity-40"
>
    <RefreshIcon size={12} class={refreshing ? "animate-spin" : ""} />
    {LL.refresh.button()}
</button>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
