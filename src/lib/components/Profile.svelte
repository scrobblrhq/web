<script lang="ts">
    import type {
        Profile,
        SessionUser,
        UserProfile,
    } from "$lib/api/types";
    import { formatCount, joinedYear } from "$lib/utils/format";
    import { addToast } from "$lib/stores/toast.svelte";
    import { enhance } from "$app/forms";

    import VerifiedBadge from "./VerifiedBadge.svelte";
    import Avatar from "./Avatar.svelte";
    import Modal from "./Modal.svelte";
    import Markdown from "svelte-exmarkdown";
    import { gfmPlugin } from "svelte-exmarkdown/gfm";
    import rehypeHighlight from "rehype-highlight";
    import remarkBreaks from "remark-breaks";
    import rehypeRaw from "rehype-raw";
    import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
    import { rehypeGroupBioImages } from "$lib/utils/bio-markdown";
    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());

    interface Props {
        profile: Profile;
        followers: UserProfile[];
        isOwn: boolean;
        user: SessionUser | undefined;
        isFollowing: boolean;
        handleFollow: any;
        handleFollowClick: any;
    }

    const {
        profile,
        followers,
        user,
        isOwn,
        isFollowing = false,
        handleFollow,
        handleFollowClick,
    }: Props = $props();

    let open = $state(false);
</script>

<svelte:head>
    {#if profile.bio}
        <style>
         @import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-light.min.css");
         @import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css") (prefers-color-scheme: dark);

            .hljs {
                background: transparent;
            }
        </style>
    {/if}
</svelte:head>

<section class="relative">
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div
        class="h-28 sm:h-48 rounded-xl bg-linear-to-br from-accent/20 to-card border border-border overflow-hidden"
    />
    <div
        class="relative flex flex-col items-center sm:flex-row sm:items-end gap-3 sm:gap-4 px-4 sm:px-6"
    >
        <button
            onclick={() => {
                profile.is_private && user?.username !== profile.username
                    ? null
                    : (open = true);
            }}
            onfocus={(e) => e.currentTarget.blur()}
        >
            <Avatar
                url={profile.image_url}
                name={profile.display_name || profile.username}
                class="w-24 h-24 sm:w-28 sm:h-28 text-2xl ring-4 ring-surface shadow-lg -mt-10 sm:-mt-16 z-10 cursor-pointer"
                loading="eager"
                fetchpriority="high"
                width={112}
                height={112}
            />
        </button>
        <div
            class="flex-1 w-full flex flex-col items-center text-center sm:items-end sm:text-left sm:flex-row sm:justify-between gap-3 pb-2"
        >
            <div class="w-full min-w-0">
                <h1
                    class="text-xl font-bold truncate flex items-center justify-center sm:justify-start gap-2"
                >
                    {profile.display_name || profile.username}
                    {#if profile.is_verified}
                        <VerifiedBadge />
                    {/if}
                </h1>
                <button
                    class="text-sm text-tertiary hover:text-secondary transition-colors cursor-pointer"
                    onclick={async (e) => {
                        await navigator.clipboard.writeText(
                            e.currentTarget.textContent.slice(1),
                        );
                        addToast(LL.profile.toastCopiedUsername(), "info");
                    }}
                >
                    @{profile.username}
                </button>
            </div>

            {#if !isOwn}
                {#if user}
                    <form
                        method="POST"
                        action={isFollowing ? "?/unfollow" : "?/follow"}
                        use:enhance={handleFollow}
                        class="shrink-0 w-full sm:w-auto"
                    >
                        <button
                            type="submit"
                            class="w-full sm:w-auto text-sm px-6 py-1.5 rounded-full border transition-colors
                            {isFollowing
                                ? 'border-border text-tertiary hover:border-red-700 not-dark:hover:bg-red-100 hover:text-red-400'
                                : 'border-border text-secondary hover:border-primary hover:text-primary'}"
                        >
                            {isFollowing ? LL.profile.button.following() : LL.profile.button.follow()}
                        </button>
                    </form>
                {:else}
                    <button
                        onclick={handleFollowClick}
                        class="w-full sm:w-auto shrink-0 text-sm px-6 py-1.5 rounded-full border border-border text-secondary hover:border-primary hover:text-primary transition-colors"
                    >
                        {LL.profile.button.follow()}
                    </button>
                {/if}
            {/if}
        </div>
    </div>
    {#if profile.bio}
        <Markdown
            md={profile.bio}
            plugins={[
                gfmPlugin(),
                { remarkPlugin: remarkBreaks },
                { rehypePlugin: rehypeRaw },
                {
                    rehypePlugin: [
                        rehypeSanitize,
                        {
                            ...defaultSchema,
                            attributes: {
                                ...defaultSchema.attributes,
                                img: [
                                    ...(defaultSchema.attributes?.img ?? []),
                                    "src",
                                    "alt",
                                    "title"
                                ],
                            },
                        },
                    ],
                },
                { rehypePlugin: rehypeHighlight },
                { rehypePlugin: rehypeGroupBioImages },
            ]}
        >
            {#snippet h1({ children, ...props })}
                <h1
                    class="mt-4 px-4 sm:px-6 text-lg sm:text-xl font-bold text-secondary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </h1>
            {/snippet}
            {#snippet h2({ children, ...props })}
                <h2
                    class="mt-3 px-4 sm:px-6 text-base sm:text-lg font-semibold text-secondary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </h2>
            {/snippet}
            {#snippet h3({ children, ...props })}
                <h3
                    class="mt-3 px-4 sm:px-6 text-sm sm:text-base font-semibold text-secondary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </h3>
            {/snippet}
            {#snippet h4({ children, ...props })}
                <h4
                    class="mt-2 px-4 sm:px-6 text-sm font-semibold text-secondary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </h4>
            {/snippet}
            {#snippet h5({ children, ...props })}
                <h5
                    class="mt-2 px-4 sm:px-6 text-xs font-semibold text-tertiary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </h5>
            {/snippet}
            {#snippet h6({ children, ...props })}
                <h6
                    class="mt-2 px-4 sm:px-6 text-xs font-semibold text-tertiary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </h6>
            {/snippet}
            {#snippet p({ children, ...props })}
                <p
                    class="mt-2 px-4 sm:px-6 text-sm text-secondary text-center sm:text-left"
                    {...props}
                >
                    {@render children?.()}
                </p>
            {/snippet}
            {#snippet ul({ children, ...props })}
                <ul
                    class="mt-2 px-4 sm:px-6 text-sm text-secondary list-disc list-inside space-y-1"
                    {...props}
                >
                    {@render children?.()}
                </ul>
            {/snippet}
            {#snippet ol({ children, ...props })}
                <ol
                    class="mt-2 px-4 sm:px-6 text-sm text-secondary list-decimal list-inside space-y-1"
                    {...props}
                >
                    {@render children?.()}
                </ol>
            {/snippet}
            {#snippet blockquote({ children, ...props })}
                <blockquote
                    class="mt-2 mx-4 sm:mx-6 pl-4 border-l-2 border-border text-sm text-tertiary italic"
                    {...props}
                >
                    {@render children?.()}
                </blockquote>
            {/snippet}
            {#snippet code({ children, ...props })}
                <code
                    class="px-1.5 py-0.5 rounded bg-card text-sm font-mono text-accent"
                    {...props}
                >
                    {@render children?.()}
                </code>
            {/snippet}
            {#snippet pre({ children, ...props })}
                <pre
                    class="mt-2 mx-4 sm:mx-6 p-4 rounded-lg bg-card overflow-x-auto text-sm font-mono"
                    {...props}>{@render children?.()}</pre>
            {/snippet}
            {#snippet a({ children, ...props })}
                <a
                    class="hover:text-secondary transition-colors underline underline-offset-2"
                    {...props}
                >
                    {@render children?.()}
                </a>
            {/snippet}
            {#snippet hr()}
                <hr class="my-4 mx-4 sm:mx-6 border-border" />
            {/snippet}
            {#snippet img({ children, ...props })}
                <img
                    class="max-h-64 object-cover mt-2 rounded-lg"
                    loading="lazy"
                    decoding="async"
                    {...props}
                />
            {/snippet}
            {#snippet div({ children, ...props })}
                {#if props["data-bio-carousel"]}
                    <span class="relative mt-2 flex">
                        <span
                            class="carousel overflow-x-auto px-4 sm:px-6 flex gap-3 snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 [&_img]:mt-0 [&_img]:shrink-0 [&_img]:snap-center [&_img]:w-[85%] [&_img]:sm:w-72"
                        >
                            {@render children?.()}
                        </span>
                        <span
                            class="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 bg-linear-to-r from-surface to-transparent"
                        ></span>
                        <span
                            class="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 bg-linear-to-l from-surface to-transparent"
                        ></span>
                    </span>
                {:else}
                    <div {...props}>
                        {@render children?.()}
                    </div>
                {/if}
            {/snippet}
        </Markdown>
    {/if}
    <div class="px-4 sm:px-6 mt-3 not-md:flex not-md:justify-center">
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-tertiary">
            <span>{formatCount(profile.scrobble_count)} {LL.profile.stat.scrobbles()}</span>
            {#if profile.country}
                <span>{profile.country}</span>
            {/if}
            {#if profile.website_url}
                <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-secondary transition-colors underline underline-offset-2"
                >
                    {profile.website_url.replace(/^https?:\/\//, "")}
                </a>
            {/if}
            <a
                href="/user/{profile.username}/friends"
                class="hover:text-secondary transition-colors decoration-0"
            >
                {followers.length}
                {followers.length > 1 || followers.length === 0
                    ? LL.profile.stat.followers()
                    : LL.profile.stat.follower()}.
            </a>
            <span>{LL.profile.stat.since()} {joinedYear(profile.created_at)}</span>
        </div>
    </div>
</section>

<Modal {open} onclose={() => (open = false)}>
    <Avatar
        url={profile.image_url}
        name={profile.display_name || profile.username}
        class="z-50 w-[225px] h-[225px] text-7xl"
    />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {LL.profile.modal.avatarLabel({ username: profile.display_name || profile.username })}
    </div>
</Modal>
