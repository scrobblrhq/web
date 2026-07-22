<script lang="ts">
    import { enhance } from "$app/forms";
    import { fly } from "svelte/transition";
    import { getLL, setLocale, getLocale } from "$lib/i18n.svelte";

    import LogOutIcon from "@lucide/svelte/icons/log-out";
    import SearchIcon from "@lucide/svelte/icons/search";
    import GlobeIcon from "@lucide/svelte/icons/globe";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import AudioLinesIcon from "@lucide/svelte/icons/audio-lines";
    import UserIcon from "@lucide/svelte/icons/user";
    import CogIcon from "@lucide/svelte/icons/cog";
    import Avatar from "$lib/components/Avatar.svelte";
    import type { SessionUser } from "$lib/api/types";
    import { onMount } from "svelte";

    let {
        user,
        imageUrl,
        avatarName,
        currentPath,
    }: {
        user: SessionUser | undefined;
        imageUrl: string | null;
        avatarName: string | null;
        currentPath: string;
    } = $props();

    let dropdownOpen = $state(false);
    let dropdownRef = $state<HTMLElement>();

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown() {
        dropdownOpen = false;
    }

    function handleClickOutside(e: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
            closeDropdown();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            closeDropdown();
        }
    }

    $effect(() => {
        if (dropdownOpen) {
            document.addEventListener("click", handleClickOutside, true);
            document.addEventListener("keydown", handleKeydown);
            return () => {
                document.removeEventListener("click", handleClickOutside, true);
                document.removeEventListener("keydown", handleKeydown);
            };
        }
    });

    let LL = $derived(getLL());

    let scrolled = $state(false);
    onMount(() => {
        const onScroll = () => {
            scrolled = window.scrollY > 50;
        };

        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    });
</script>

<svelte:head>
    <style>
        header {
            box-shadow: 
                0 1px 0 0 var(--color-border),
                0 8px 24px -16px rgba(0, 0, 0, .35);
            transform: translateX(-50%);
        }

        header.scroll {
            top: 0.75rem;
            width: min(1100px, calc(100% - 2rem));
            transform: translateX(-50%);
            border-radius: 0.75rem;
            border: 0.5px;
        }
    </style>
</svelte:head>

<div class="h-14">
    <header
        class="fixed w-full top-0 left-1/2 h-14 z-50 border-border bg-nav/80 backdrop-blur-md transition-all duration-300 ease-out {scrolled ? "scroll" : ""}"
    >
        <div
            class="h-px w-full bg-linear-to-r from-transparent via-border-active/60 to-transparent"
        ></div>
        <nav
            class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4"
        >
            <a href="/" class="group flex items-center gap-2 shrink-0">
                <span
                    class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-text shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3"
                >
                    <AudioLinesIcon size={16} strokeWidth={2.5} />
                </span>
                <span
                    class="text-base font-extrabold tracking-tight group-hover:text-secondary transition-colors"
                >
                    {LL.nav.brand()}
                </span>
            </a>
            <div class="flex items-center gap-1 ml-auto">
                <a
                    href="/search"
                    class="relative text-sm px-3 py-1.5 rounded-md transition-colors flex items-center overflow-hidden
                        {currentPath === '/search'
                        ? 'text-primary bg-active'
                        : 'text-tertiary hover:text-primary hover:bg-hover'}"
                >
                    <SearchIcon size={14} class="sm:mr-1" />
                    <span class="hidden sm:inline">{LL.nav.search()}</span>
                </a>
                <button
                    onclick={() => {
                        const next = getLocale() === 'es' ? 'en' : 'es';
                        setLocale(next);
                        document.cookie = `scrobblr_lang=${next};path=/;max-age=31536000`;
                    }}
                    class="text-xs px-2 py-1.5 rounded-md transition-colors flex items-center gap-1
                        text-tertiary hover:text-primary hover:bg-hover"
                    aria-label="Switch language"
                >
                    <GlobeIcon size={13} />
                    {getLocale().toUpperCase()}
                </button>
                {#if user}
                    <div class="relative" bind:this={dropdownRef}>
                        <button
                            onclick={toggleDropdown}
                            class="text-sm pl-1.5 pr-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border
                                {currentPath.startsWith(
                                '/user/' + user.username,
                            )
                                ? 'bg-active border-border-active'
                                : 'border-transparent text-quaternary hover:text-primary hover:bg-hover hover:border-border'}"
                        >
                            <Avatar
                                name={avatarName}
                                url={imageUrl}
                                class="ring-2 ring-border sm:mr-1 w-6 h-6"
                            />
                            <span class="hidden sm:inline">{user.username}</span>
                            <ChevronDownIcon
                                size={14}
                                class="transition-transform {dropdownOpen
                                    ? 'rotate-180'
                                    : ''}"
                            />
                        </button>

                        {#if dropdownOpen}
                            <div
                                transition:fly={{ y: -6, duration: 140 }}
                                class="absolute right-0 top-full mt-2 w-48 p-1 rounded-xl border border-border bg-card shadow-2xl shadow-black/20 z-50"
                                role="menu"
                            >
                                <div
                                    class="flex items-center gap-2 px-2.5 py-2 mb-1 border-b border-border"
                                >
                                    <Avatar
                                        name={avatarName}
                                        url={imageUrl}
                                        class="ring-2 ring-border w-8 h-8"
                                    />
                                    <span
                                        class="text-sm font-semibold truncate text-primary"
                                    >
                                        {user.username}
                                    </span>
                                </div>
                                <a
                                    href="/user"
                                    class="flex items-center text-left text-sm px-3 py-2 rounded-lg text-tertiary hover:text-primary hover:bg-hover transition-colors"
                                    role="menuitem"
                                    onclick={closeDropdown}
                                >
				    <UserIcon size={14} class="mr-2" />
                                    {LL.nav.profile()}
                                </a>
                                <a
                                    href="/user/{user.username}/settings"
                                    class="flex items-center text-left text-sm px-3 py-2 rounded-lg text-tertiary hover:text-primary hover:bg-hover transition-colors"
                                    role="menuitem"
                                    onclick={closeDropdown}
                                >
				    <CogIcon size={14} class="mr-2" />
                                    {LL.nav.settings()}
                                </a>
                                <hr class="my-1 border-border" />
                                <form
                                    method="POST"
                                    action="/logout"
                                    use:enhance
                                >
                                    <button
                                        type="submit"
                                        class=" cursor-pointer flex items-center w-full text-left text-sm px-3 py-2 rounded-lg hover:text-white text-red-500/60 hover:bg-red-500/20 transition-colors"
                                        role="menuitem"
                                    >
                                        <LogOutIcon size={14} class="mr-2" />
                                        {LL.nav.logout()}
                                    </button>
                                </form>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <a
                        href="/login"
                        class="text-sm px-2 py-1.5 rounded-md text-tertiary hover:text-primary hover:bg-hover transition-colors"
                    >
                        <span class="hidden sm:inline">
				{LL.nav.login()}
			</span>
                    </a>
                    <a
                        href="/register"
                        class="text-sm px-3 sm:px-3.5 py-1.5 rounded-full bg-accent text-accent-text shadow-sm hover:opacity-90 hover:shadow-md active:scale-95 transition-all font-medium whitespace-nowrap "
                    >
                        {LL.nav.register()}
                    </a>
                {/if}
            </div>
        </nav>
    </header>
</div>
