<script lang="ts">
    import { getLL } from "#lib/i18n.svelte";
    import type { ImageCandidate } from "#lib/api/types";
    import { enhance } from "$app/forms";
    import { isHttpError } from "@sveltejs/kit";
    import { setVote } from "#lib/remote/images.remote";
    import { addToast } from "#lib/stores/toast.svelte";
    import AuthModal from "../auth/AuthModal.svelte";
    import HeartIcon from "@lucide/svelte/icons/heart";
    import PlusIcon from "@lucide/svelte/icons/plus";

    interface Props {
        artistId: number;
        images: ImageCandidate[];
        signedIn: boolean;
    }

    let { artistId, images = $bindable(), signedIn }: Props = $props();

    let LL = $derived(getLL());

    let showAuthModal = $state(false);
    let uploading = $state(false);
    let fileInput: HTMLInputElement;
    let formEl: HTMLFormElement;

    async function vote(candidate: ImageCandidate) {
        if (!signedIn) {
            showAuthModal = true;
            return;
        }
        try {
            images = await setVote({ id: candidate.id, voted: candidate.has_voted });
        } catch (e) {
            addToast(isHttpError(e) ? e.body.message : LL.imageCandidates.error.vote(), "error");
        }
    }

    function triggerUpload() {
        if (!signedIn) {
            showAuthModal = true;
            return;
        }
        fileInput.click();
    }
</script>

<section class="space-y-4 rounded-2xl border border-border/70 bg-card/45 backdrop-blur-xs p-4 sm:p-5">
    <div class="flex items-center justify-between">
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">{LL.imageCandidates.title()}</h2>
        <button
            onclick={triggerUpload}
            disabled={uploading}
            class="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-hover transition-[transform,color,background-color,opacity] active:scale-[0.98] disabled:opacity-40"
        >
            <PlusIcon size={12} />
            {uploading ? LL.imageCandidates.uploading() : LL.imageCandidates.propose()}
        </button>
        <form
            bind:this={formEl}
            method="POST"
            action="?/proposeImage"
            enctype="multipart/form-data"
            use:enhance={() => {
                uploading = true;
                return async ({ result }) => {
                    if (result.type === 'success') {
                        images = result.data!.images as ImageCandidate[];
                        addToast(LL.imageCandidates.success.proposed(), 'success');
                    } else if (result.type === 'failure') {
                        addToast((result.data?.message as string) ?? LL.imageCandidates.error.upload(), 'error');
                    }
                    uploading = false;
                    fileInput.value = '';
                }
            }}
        >
            <input
                bind:this={fileInput}
                name="image"
                type="file"
                accept="image/*"
                class="hidden"
                onchange={() => formEl.requestSubmit()}
            />
        </form>
    </div>

    {#if images.length === 0}
        <p class="text-sm text-tertiary">{LL.imageCandidates.empty()}</p>
    {:else}
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {#each images as candidate (candidate.id)}
                <button
                    onclick={() => vote(candidate)}
                    class="relative aspect-square rounded-xl overflow-hidden group ring-1 transition-transform duration-300 hover:-translate-y-0.5 {candidate.is_default
                        ? 'ring-accent'
                        : 'ring-border/40'}"
                >
                    <img
                        src={candidate.url}
                        alt={LL.imageCandidates.altPrefix({ username: candidate.uploaded_by })}
                        width="320"
                        height="320"
                        loading="lazy"
                        decoding="async"
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
