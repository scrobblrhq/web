<script lang="ts">
    import { api, ApiError } from "$lib/api";
    import { addToast } from "$lib/stores/toast.svelte";
    import RefreshIcon from "@lucide/svelte/icons/refresh-cw";
    import AuthModal from "./ui/AuthModal.svelte";
    import { getLL } from "$lib/i18n.svelte";

    interface Props {
        kind: "artist" | "track";
        id: number;
        token?: string;
    }

    let { kind, id, token }: Props = $props();
    let LL = $derived(getLL());

    let showAuthModal = $state(false);
    let refreshing = $state(false);

    async function refresh() {
        if (!token) {
            showAuthModal = true;
            return;
        }
        refreshing = true;
        try {
            await (kind === "artist"
                ? api.catalog.refreshArtist(id, token)
                : api.catalog.refreshTrack(id, token));
            addToast(LL.refresh.success(), "success");
        } catch (e) {
            addToast(
                e instanceof ApiError ? e.message : LL.refresh.error(),
                "error",
            );
        } finally {
            refreshing = false;
        }
    }
</script>

<button
    onclick={refresh}
    disabled={refreshing}
    class="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-md text-tertiary hover:text-primary hover:bg-hover transition-colors disabled:opacity-40"
>
    <RefreshIcon size={12} class={refreshing ? "animate-spin" : ""} />
    {LL.refresh.button()}
</button>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
