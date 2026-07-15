<script lang="ts">
    import { getLL } from "$lib/i18n.svelte";
    import type { ImageCandidate } from "$lib/api/types";
    import { api, ApiError } from "$lib/api";
    import { addToast } from "$lib/stores/toast.svelte";
    import AuthModal from "./ui/AuthModal.svelte";
    import HeartIcon from "@lucide/svelte/icons/heart";
    import PlusIcon from "@lucide/svelte/icons/plus";

    interface Props {
        artistId: number;
        images: ImageCandidate[];
        token?: string;
    }

    let { artistId, images = $bindable(), token }: Props = $props();

    let LL = $derived(getLL());

    let showAuthModal = $state(false);
    let uploading = $state(false);
    let fileInput: HTMLInputElement;

    async function vote(candidate: ImageCandidate) {
        if (!token) {
            showAuthModal = true;
            return;
        }
        try {
            images = candidate.has_voted
                ? await api.images.unvoteImage(candidate.id, token)
                : await api.images.voteImage(candidate.id, token);
        } catch (e) {
            addToast(
                e instanceof ApiError ? e.message : LL.imageCandidates.error.vote(),
                "error",
            );
        }
    }

    function triggerUpload() {
        if (!token) {
            showAuthModal = true;
            return;
        }
        fileInput.click();
    }

    async function onFileSelected(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file || !token) return;
        uploading = true;
        try {
            images = await api.images.proposeArtistImage(artistId, file, token);
            addToast(LL.imageCandidates.success.proposed(), "success");
        } catch (e) {
            addToast(
                e instanceof ApiError ? e.message : LL.imageCandidates.error.upload(),
                "error",
            );
        } finally {
            uploading = false;
            (e.target as HTMLInputElement).value = "";
        }
    }
</script>

<section class="space-y-3">
    <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-secondary">{LL.imageCandidates.title()}</h2>
        <button
            onclick={triggerUpload}
            disabled={uploading}
            class="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-md text-tertiary hover:text-primary hover:bg-hover transition-colors disabled:opacity-40"
        >
            <PlusIcon size={12} />
            {uploading ? LL.imageCandidates.uploading() : LL.imageCandidates.propose()}
        </button>
        <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            class="hidden"
            onchange={onFileSelected}
        />
    </div>

    {#if images.length === 0}
        <p class="text-sm text-tertiary">{LL.imageCandidates.empty()}</p>
    {:else}
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {#each images as candidate (candidate.id)}
                <button
                    onclick={() => vote(candidate)}
                    class="relative aspect-square rounded-lg overflow-hidden group ring-1 {candidate.is_default
                        ? 'ring-accent'
                        : 'ring-border/40'}"
                >
                    <img
                        src={candidate.url}
                        alt={LL.imageCandidates.altPrefix({ username: candidate.uploaded_by })}
                        class="w-full h-full object-cover"
                    />
                    <div
                        class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-1.5"
                    >
                        <span
                            class="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity truncate"
                            >@{candidate.uploaded_by}</span
                        >
                        <span
                            class="flex items-center gap-0.5 text-[10px] font-medium {candidate.has_voted
                                ? 'text-red-400'
                                : 'text-white'}"
                        >
                            <HeartIcon
                                size={11}
                                fill={candidate.has_voted ? "currentColor" : "none"}
                            />
                            {candidate.vote_count}
                        </span>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</section>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
