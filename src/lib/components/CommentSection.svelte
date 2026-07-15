<script lang="ts">
    import type { Comment } from "$lib/api/types";
    import { enhance } from "$app/forms";
    import { timeAgo } from "$lib/utils/format";
    import { addToast } from "$lib/stores/toast.svelte";
    import Avatar from "./Avatar.svelte";
    import AuthModal from "./ui/AuthModal.svelte";
    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());

    interface Props {
        comments: Comment[];
        isAuthed: boolean;
        currentUsername?: string;
        postAction: string;
        deleteAction: string;
    }

    let {
        comments = $bindable(),
        isAuthed,
        currentUsername,
        postAction,
        deleteAction,
    }: Props = $props();

    let body = $state("");
    let showAuthModal = $state(false);
    let submitting = $state(false);

    function handlePostClick(e: MouseEvent) {
        if (!isAuthed) {
            e.preventDefault();
            showAuthModal = true;
        }
    }
</script>

<section class="space-y-4">
    <h2 class="text-sm font-semibold text-secondary">
        {LL.comments.title({ count: comments.length })}
    </h2>

    <form
        method="POST"
        action={postAction}
        use:enhance={() => {
            submitting = true;
            return async ({ result, update }) => {
                submitting = false;
                if (result.type === "success" && result.data?.comment) {
                    comments = [result.data.comment as Comment, ...comments];
                    body = "";
                } else if (result.type === "failure") {
                    addToast(LL.comments.error.publish(), "error");
                }
                await update({ reset: false });
            };
        }}
        class="flex gap-2"
    >
        <textarea
            name="body"
            bind:value={body}
            onclick={handlePostClick}
            placeholder={isAuthed
                ? LL.comments.placeholder.authed()
                : LL.comments.placeholder.unauthed()}
            rows="2"
            maxlength="1000"
            class="flex-1 text-sm rounded-lg border border-border/60 bg-card/40 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-accent"
        ></textarea>
        <button
            type="submit"
            disabled={!isAuthed || submitting || !body.trim()}
            onclick={handlePostClick}
            class="text-sm px-3 py-1.5 h-fit rounded-md bg-accent text-accent-text hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
        >
            {LL.comments.submit()}
        </button>
    </form>

    <ul class="space-y-3">
        {#each comments as comment (comment.id)}
            <li class="flex gap-2.5 items-start">
                <Avatar
                    url={comment.image_url}
                    name={comment.display_name ?? comment.username}
                    class="w-8 h-8 text-xs shrink-0"
                />
                <div class="min-w-0 flex-1">
                    <div class="flex items-baseline gap-2">
                        <span class="text-sm font-medium text-primary truncate"
                            >{comment.display_name ?? comment.username}</span
                        >
                        <span class="text-xs text-quaternary shrink-0"
                            >{timeAgo(comment.created_at)}</span
                        >
                    </div>
                    <p class="text-sm text-secondary leading-relaxed break-words">
                        {comment.body}
                    </p>
                </div>
                {#if currentUsername === comment.username}
                    <form
                        method="POST"
                        action={deleteAction}
                        use:enhance={() => {
                            return async ({ result, update }) => {
                                if (result.type === "success") {
                                    comments = comments.filter(
                                        (c) => c.id !== comment.id,
                                    );
                                } else {
                                    addToast(LL.comments.error.delete(), "error");
                                }
                                await update({ reset: false });
                            };
                        }}
                    >
                        <input type="hidden" name="commentId" value={comment.id} />
                        <button
                            type="submit"
                            class="text-xs text-quaternary hover:text-red-500 transition-colors shrink-0"
                        >
                            {LL.comments.delete()}
                        </button>
                    </form>
                {/if}
            </li>
        {:else}
            <p class="text-sm text-tertiary">{LL.comments.empty()}</p>
        {/each}
    </ul>
</section>

<AuthModal open={showAuthModal} onclose={() => (showAuthModal = false)} />
