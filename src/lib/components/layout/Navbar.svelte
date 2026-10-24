<script lang="ts">
    import { enhance } from "$app/forms";
    import { fly } from "svelte/transition";
    import { getLL, setLocale, getLocale } from "$lib/i18n.svelte";

    import LogOutIcon from "@lucide/svelte/icons/log-out";
    import SearchIcon from "@lucide/svelte/icons/search";
    import Music2Icon from "@lucide/svelte/icons/music-2";
    import GlobeIcon from "@lucide/svelte/icons/globe";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    // import AudioLinesIcon from "@lucide/svelte/icons/audio-lines";
    import UserIcon from "@lucide/svelte/icons/user";
    import CogIcon from "@lucide/svelte/icons/cog";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import type { PublicUser } from "$lib/api/types";

    let {
        user,
        imageUrl,
        avatarName,
        currentPath,
    }: {
        user: PublicUser | undefined;
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

    let scrollY = $state(0);
    const scrolled = $derived(scrollY > 16);
</script>

<svelte:window bind:scrollY />

<div class="h-18">
    <header
        class="fixed left-1/2 z-50 h-18 -translate-x-1/2 border backdrop-blur-xl
               transition-[top,width,border-radius,background-color,border-color,box-shadow]
               duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none
               {scrolled
            ? 'top-3 w-[min(calc(100%-1.5rem),70rem)] rounded-2xl border-border bg-nav/80 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)]'
            : 'top-0 w-full rounded-none border-transparent border-b-border bg-nav/90 shadow-none'}"
    >
        <nav
            class="max-w-6xl mx-auto px-5 h-full flex items-center justify-between gap-6"
        >
            <a href="/" class="group flex items-center gap-2 shrink-0">
                <div
                    class="relative flex items-center justify-center size-9 rounded-[10px] transition-transform group-hover:-rotate-6 group-active:scale-95"
                >
                    <!-- <AudioLinesIcon size={16} strokeWidth={2.5} /> -->
                    <img src="/images/icon.svg" class="w-auto h-6 shrink-0" alt="Scrobblr" />
                </div>
                <span class="flex items-start gap-1">
                    <span
                        class="text-[15px] font-bold tracking-[-0.02em] text-primary group-hover:text-secondary transition-colors"
                    >
                        Scrobblr
                    </span>
                    <span
                        class="-mt-0.5 text-[8px] font-bold uppercase leading-none tracking-[0.12em] text-surface bg-accent p-1 rounded-sm"
                    >
                        beta
                    </span>
                </span>
            </a>
            <div class="flex items-center gap-1.5 ml-auto">
                <a
                    href="/search"
                    aria-current={currentPath === "/search"
                        ? "page"
                        : undefined}
                    class="relative text-sm px-3 py-2 rounded-[10px] transition-colors flex items-center overflow-hidden
                        {currentPath === '/search'
                        ? 'text-primary bg-active'
                        : 'text-tertiary hover:text-primary hover:bg-hover'}"
                >
                    <SearchIcon size={14} class="sm:mr-1" />
                    <span class="hidden sm:inline">{LL.nav.search()}</span>
                </a>
                <a
                    href="/rankings"
                    aria-label="Rankings"
                    aria-current={currentPath.startsWith("/rankings") ? "page" : undefined}
                    class="relative text-sm px-3 py-2 rounded-[10px] transition-colors flex items-center overflow-hidden
                        {currentPath.startsWith('/rankings')
                        ? 'text-primary bg-active'
                        : 'text-tertiary hover:text-primary hover:bg-hover'}"
                >
                    <Music2Icon size={14} class="sm:mr-1" />
                    <span class="hidden sm:inline">Rankings</span>
                </a>
                <button
                    onclick={() => {
                        const next = getLocale() === "es" ? "en" : "es";
                        setLocale(next);
                        document.cookie = `scrobblr_lang=${next};path=/;max-age=31536000`;
                    }}
                    class="text-xs px-2.5 py-2 rounded-[10px] transition-colors flex items-center gap-1
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
                            aria-expanded={dropdownOpen}
                            aria-haspopup="menu"
                            class="text-sm pl-1.5 pr-2.5 py-1.5 rounded-[10px] transition-colors flex items-center gap-1.5 border
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
                            <span class="hidden sm:inline">{user.username}</span
                            >
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
                                    href="/user/{user.username}"
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
                                    action="/auth/logout"
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
                        href="/auth/login"
                        class="text-sm px-2 py-1.5 rounded-md text-tertiary hover:text-primary hover:bg-hover transition-colors"
                    >
                        <span class="hidden sm:inline">
                            {LL.nav.login()}
                        </span>
                    </a>
                    <a
                        href="/auth/login"
                        class="text-sm px-3 sm:px-3.5 py-1.5 rounded-full bg-accent text-accent-text shadow-sm hover:opacity-90 hover:shadow-md active:scale-95 transition-all font-medium whitespace-nowrap"
                    >
                        {LL.nav.register()}
                    </a>
                {/if}
            </div>
        </nav>
    </header>
</div>
