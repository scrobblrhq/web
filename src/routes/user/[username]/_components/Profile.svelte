<script lang="ts">
    import type {
        Profile,
        ScrobbleRich,
        SessionUser,
        UserProfile,
    } from "$lib/api/types";
    import { formatCount, joinedYear } from "$lib/utils/format";
    import { addToast } from "$lib/stores/toast.svelte";

    import VerifiedBadge from "$lib/components/ui/VerifiedBadge.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import RecentScrobblesHeaderTemp from "./RecentScrobblesHeader.temp.svelte";
    import Modal from "$lib/components/feedback/Modal.svelte";
    import BioGallery from "$lib/components/profile/BioGallery.svelte";
    import GalleryModal from "$lib/components/ui/GalleryModal.svelte";

    import Markdown from "svelte-exmarkdown";
    import { gfmPlugin } from "svelte-exmarkdown/gfm";
    import rehypeHighlight from "rehype-highlight";
    import remarkBreaks from "remark-breaks";
    import rehypeRaw from "rehype-raw";
    import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
    import { rehypeGroupBioImages } from "$lib/utils/bio-markdown";
    import { getLL } from "$lib/i18n.svelte";
    import { onMount } from "svelte";
    import { gsap } from "gsap";
    import { ScrollTrigger } from "gsap/ScrollTrigger";

    let LL = $derived(getLL());

    interface Props {
        profile: Profile;
        followers: UserProfile[];
        isOwn: boolean;
        user: SessionUser | undefined;
        isFollowing: boolean;
        isBlocked: boolean;
        handleBlock: () => void;
        handleFollowClick: any;
        recent: Promise<ScrobbleRich[]>;
    }

    const {
        profile,
        followers,
        user,
        isOwn,
        isFollowing = false,
        isBlocked = false,
        handleBlock,
        handleFollowClick,
        recent,
    }: Props = $props();

    let open = $state(false);
    let confirmBlockOpen = $state(false);

    function onBlockButtonClick() {
        if (isBlocked) {
            handleBlock();
        } else {
            confirmBlockOpen = true;
        }
    }

    function confirmBlock() {
        confirmBlockOpen = false;
        handleBlock();
    }

    type GalleryItem = { image: string; alt?: string };
    let galleryOpen = $state(false);
    let galleryItems = $state<GalleryItem[]>([]);
    let galleryTrigger = $state<HTMLElement | null>(null);
    let profileShell = $state<HTMLElement | null>(null);

    onMount(() => {
        if (!profileShell || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
            gsap.fromTo(
                ".profile-reveal",
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: "power3.out" },
            );
            gsap.fromTo(
                ".profile-art",
                { scale: 0.86, opacity: 0.4 },
                {
                    scale: 1,
                    opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: profileShell,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                },
            );
        }, profileShell);

        return () => context.revert();
    });

    function openGallery(items: GalleryItem[], trigger: HTMLElement) {
        galleryItems = items;
        galleryTrigger = trigger;
        galleryOpen = true;
    }

    const parseImgItems = (raw: unknown): { image: string; alt?: string }[] => {
        try {
            const v = JSON.parse(String(raw ?? "[]"));
            return Array.isArray(v) ? v.filter((i) => i?.image) : [];
        } catch {
            return [];
        }
    }
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

<section bind:this={profileShell} class="profile-shell relative overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-[0_16px_42px_rgba(9,9,11,0.08)] backdrop-blur-md">
    <RecentScrobblesHeaderTemp {recent} />
    <div class="relative flex flex-col items-center gap-4 px-5 pb-3 pt-0 sm:flex-row sm:items-end sm:gap-5 sm:px-7">
        <button
            type="button"
            class="relative z-10 -mt-9 inline-flex h-20 w-20 shrink-0 active:transform-none sm:-mt-12 sm:h-24 sm:w-24"
            onclick={() => {
                profile.is_private && user?.username !== profile.username
                    ? null
                    : (open = true);
            }}
        >
            <Avatar
                url={profile.image_url}
                name={profile.display_name || profile.username}
                class="size-full cursor-pointer rounded-xl text-2xl shadow-lg ring-4 ring-card"
                loading="eager"
                fetchpriority="high"
                width={112}
                height={112}
            />
        </button>
        <div class="flex w-full flex-1 flex-col items-center gap-3 pb-1 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div class="w-full min-w-0">
                <h1 class="profile-reveal flex max-w-4xl items-center justify-center gap-2 truncate text-2xl font-semibold tracking-[-0.04em] sm:justify-start sm:text-3xl">
                    {profile.display_name || profile.username}
                    {#if profile.is_verified}<VerifiedBadge />{/if}
                </h1>
                <button
                    class="profile-reveal cursor-pointer text-sm text-tertiary transition-colors hover:text-secondary"
                    onclick={async (e) => {
                        await navigator.clipboard.writeText(e.currentTarget.textContent.slice(1));
                        addToast(LL.profile.toastCopiedUsername(), "info");
                    }}
                >@{profile.username}</button>
            </div>

            {#if !isOwn}
                {#if user}
                    <div class="profile-reveal flex shrink-0 flex-wrap justify-center gap-2 sm:justify-end">
                        <button
                            type="button"
                            onclick={handleFollowClick}
                            class="w-full rounded-[10px] border px-5 py-3 text-sm transition-all active:scale-[0.98] sm:w-auto {isFollowing
                                ? 'border-border text-tertiary hover:border-red-700 not-dark:hover:bg-red-100 hover:text-red-400'
                                : 'border-primary bg-primary text-inverse hover:opacity-85'}"
                        >{isFollowing ? LL.profile.button.following() : LL.profile.button.follow()}</button>
                        <button
                            type="button"
                            onclick={onBlockButtonClick}
                            class="rounded-[10px] border border-border px-4 py-3 text-sm text-tertiary transition-colors hover:border-red-700 hover:text-red-400"
                        >{isBlocked ? LL.profile.button.unblock() : LL.profile.button.block()}</button>
                    </div>
                {:else}
                    <button
                        type="button"
                        onclick={handleFollowClick}
                        class="profile-reveal w-full shrink-0 rounded-[10px] border border-primary bg-primary px-5 py-3 text-sm text-inverse transition-all hover:opacity-85 active:scale-[0.98] sm:w-auto"
                    >{LL.profile.button.follow()}</button>
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
                { rehypePlugin: rehypeRaw },
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
                    {@const groupItems = parseImgItems(props["data-bio-items"])}
                    <BioGallery
                        items={groupItems}
                        viewLabel={LL.profile.gallery.view()}
                        countLabel={LL.profile.gallery.count({ count: groupItems.length })}
                        onopen={openGallery}
                    />
                {:else}
                    <div {...props}>
                        {@render children?.()}
                    </div>
                {/if}
            {/snippet}
        </Markdown>
    {/if}
    <div class="profile-reveal mt-3 border-t border-border/60 px-5 py-3 sm:px-7 not-md:flex not-md:justify-center">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tertiary">
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
                <span class="text-tertiary">{LL.profile.stat.since()} {joinedYear(profile.created_at)}</span>
        </div>
    </div>
</section>

<Modal {open} onclose={() => (open = false)}>
    <Avatar
        url={profile.image_url}
        name={profile.display_name || profile.username}
        class="z-50 w-56.25 h-56.25 text-7xl"
    />
    <div class="text-tertiary text-sm flex justify-center items-center">
        {LL.profile.modal.avatarLabel({ username: profile.display_name || profile.username })}
    </div>
</Modal>

<Modal
    open={confirmBlockOpen}
    onclose={() => (confirmBlockOpen = false)}
    label={LL.profile.toast.confirmBlock({ username: profile.username })}
    panelClass="max-w-md px-12 py-6"
>
    <p class="text-center text-sm text-secondary">
        {LL.profile.toast.confirmBlock({ username: profile.username })}
    </p>
    <button
        type="button"
        onclick={confirmBlock}
        class="w-full rounded-lg bg-red-600/40 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
    >
        {LL.profile.button.block()}
    </button>
</Modal>

<GalleryModal
    open={galleryOpen}
    items={galleryItems}
    label={LL.profile.gallery.view()}
    onclose={() => (galleryOpen = false)}
    returnFocusTo={galleryTrigger}
/>
