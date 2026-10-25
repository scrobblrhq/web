<script lang="ts">
    import "./layout.css";
    import type { LayoutProps } from "./$types";
    import { page, navigating } from "$app/state";
    import { fly } from "svelte/transition";

    import Toast from "#lib/components/ui/Toast.svelte";
    import Navbar from "#lib/components/layout/Navbar.svelte";
    import NowPlayingWidget from "#lib/components/player/NowPlayingWidget.svelte";
    import ThemeVarsApplier from "#lib/components/layout/ThemeVarsApplier.svelte";
    import Topography from "#lib/components/layout/Topography.svelte";

    import { SvelteTheme } from "svelte-themes";
    import { setLocale, getLL } from "#lib/i18n.svelte";

    const { data, children }: LayoutProps = $props();

    setLocale(data.lang as "es" | "en");
    let LL = $derived(getLL());

    const user = $derived(data.user);
    const imageUrl = $derived(data.imageUrl);
    const avatarName = $derived(data.avatarName);
    const currentPath = $derived(page.url.pathname);
    const isLoading = $derived(navigating.type !== null);
    let isLight = $state(false);

    $effect(() => {
        const root = document.documentElement;
        const sync = () => (isLight = !root.classList.contains("dark"));
        sync();
        const mo = new MutationObserver(sync);
        mo.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => mo.disconnect();
    });
</script>

<div
    class="fixed top-0 left-0 right-0 z-100 h-0.5 overflow-hidden transition-opacity duration-300"
    style="opacity: {isLoading ? '1' : '0'}; pointer-events: none"
>
    <div
        class="h-full bg-accent/50 animate-[progress_1s_ease-in-out_infinite]"
    ></div>
</div>

<SvelteTheme attribute="class">
    <ThemeVarsApplier />
    <div
        class="pointer-events-none fixed -z-10 inset-0 mask-[radial-gradient(ellipse_at_50%_30%,#000_20%,transparent_75%)]"
        aria-hidden="true"
    >
        <Topography
            lightMode={isLight}
            lowColor={isLight ? "#9db84a" : "#3a4220"}
            midColor={isLight ? "#5f7a1a" : "#c7f36b"}
            highColor={isLight ? "#2f3d0a" : "#eaffb8"}
            opacity={isLight ? 0.25 : 0.2}
            speed={0.18}
            morphAmount={3}
            bands={2.2}
            thickness={0.008}
            glow={0.2}
            contrast={3}
            grain={false}
            mouseStrength={0.25}
            mouseRadius={0.35}
        />
    </div>
    <div class="min-h-screen text-primary overflow-hidden">
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
