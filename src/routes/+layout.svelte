<script lang="ts">
    import "./layout.css";
    import type { LayoutProps } from "./$types";
    import { page, navigating } from "$app/state";
    import { fly } from "svelte/transition";

    import Toast from "$lib/components/Toast.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import NowPlayingWidget from "$lib/components/NowPlayingWidget.svelte";
    import ThemeVarsApplier from "$lib/components/ThemeVarsApplier.svelte";
    import { SvelteTheme } from "svelte-themes";
    import { setLocale, getLL } from "$lib/i18n.svelte";

    const { data, children }: LayoutProps = $props();

    setLocale(data.lang as "es" | "en");
    let LL = $derived(getLL());

    const user = $derived(data.user);
    const imageUrl = $derived(data.imageUrl);
    const avatarName = $derived(data.avatarName);
    const currentPath = $derived(page.url.pathname);
    const isLoading = $derived(navigating === null);
</script>

<svelte:head>
    <title>{LL.home.meta.title()}</title>
</svelte:head>

<div
    class="fixed top-0 left-0 right-0 z-100 h-0.5 overflow-hidden transition-opacity duration-300"
    style="opacity: {isLoading ? '1' : '0'}; pointer-events: none"
>
    <div
        class="h-full bg-white/50 animate-[progress_1s_ease-in-out_infinite]"
    ></div>
</div>

<SvelteTheme attribute="class">
    <ThemeVarsApplier />
    <div class="min-h-screen bg-surface text-primary overflow-hidden">
        <Navbar {user} {imageUrl} {avatarName} {currentPath} />

        <main class="min-h-screen -mt-2">
            {#key page.url.pathname}
                <div in:fly={{ y: 12, duration: 200, opacity: 0 }}>
                    {@render children()}
                </div>
            {/key}
        </main>
    </div>
</SvelteTheme>

{#if user}
    <NowPlayingWidget {user} />
{/if}

<Toast />
