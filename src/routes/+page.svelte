<script lang="ts">
    import type { PageProps } from "./$types";
    const { data }: PageProps = $props();
    const { user } = $derived(data);
    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());
    import MusicNoteIcon from "@lucide/svelte/icons/music-2";
    import GlobeIcon from "@lucide/svelte/icons/globe";
    import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
    import TimerIcon from "@lucide/svelte/icons/timer";
    import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
    import UserCheckIcon from "@lucide/svelte/icons/user-check";
    import HeroBackground from "$lib/components/HeroBackground.svelte";

    let features = $derived([
        {
            icon: MusicNoteIcon,
            title: LL.home.features.scrobbling.title(),
            desc: LL.home.features.scrobbling.desc(),
        },
        {
            icon: ArrowUpRightIcon,
            title: LL.home.features.stats.title(),
            desc: LL.home.features.stats.desc(),
        },
        {
            icon: GlobeIcon,
            title: LL.home.features.profiles.title(),
            desc: LL.home.features.profiles.desc(),
        },
    ]);

    let benefits = $derived([
        { icon: TimerIcon, label: LL.home.benefits.item1() },
        { icon: BarChart3Icon, label: LL.home.benefits.item2() },
        { icon: GlobeIcon, label: LL.home.benefits.item3() },
        { icon: UserCheckIcon, label: LL.home.benefits.item4() },
    ]);
</script>

<svelte:head>
    <title>{LL.home.meta.title()}</title>
</svelte:head>

<section class="relative isolate hero">
    <HeroBackground />
    <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-zinc-900/60 via-surface to-surface"
    ></div>
    <div
        class="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-150 h-75 bg-hover/40 rounded-full blur-3xl"
    ></div>

    <div class="max-w-5xl mx-auto px-4 pt-28 pb-24 text-center relative z-10">
        <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-tertiary mb-8"
        >
            {LL.home.hero.badge()}
        </p>

        <h1
            class="text-5xl sm:text-7xl font-bold tracking-tight text-primary leading-[1.05]"
        >
            {LL.home.hero.title1()}
            <span class="text-tertiary">{LL.home.hero.title2()}</span>
        </h1>

        <p
            class="mt-6 text-base sm:text-lg text-tertiary max-w-2xl mx-auto leading-relaxed"
        >
            {LL.home.hero.description()}
        </p>

        <div class="mt-10 flex items-center justify-center gap-3">
            {#if user}
                <a
                    href="/user"
                    class="px-6 py-2.5 rounded-full bg-accent text-accent-text text-sm font-medium hover:opacity-90 transition-colors"
                >
                    {LL.home.cta.ownProfile()}
                </a>
            {:else}
                <a
                    href="/register"
                    class="px-6 py-2.5 rounded-full bg-accent text-accent-text text-sm font-medium hover:opacity-90 transition-colors"
                >
                    {LL.home.cta.signup()}
                </a>
                <a
                    href="/login"
                    class="px-6 py-2.5 rounded-full bg-hover/60 backdrop-blur-sm border border-border text-tertiary text-sm hover:text-primary hover:border-border-hover transition-colors"
                >
                    {LL.home.cta.login()}
                </a>
            {/if}
        </div>
    </div>
</section>

<section class="max-w-5xl mx-auto px-4 pb-28">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each features as feat}
            {@const Icon = feat.icon}
            <div
                class="group relative rounded-xl shadow-lg border border-border bg-card p-7 space-y-4 transition-all duration-200 hover:-translate-y-1 hover:border-border-hover"
            >
                <div
                    class="size-10 flex items-center justify-center rounded-lg bg-hover/60 text-quaternary transition-colors group-hover:bg-hover group-hover:text-primary"
                >
                    <Icon size={16} />
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-primary">
                        {feat.title}
                    </h3>
                    <p class="mt-1.5 text-sm text-tertiary leading-relaxed">
                        {feat.desc}
                    </p>
                </div>
            </div>
        {/each}
    </div>
</section>

<section class="max-w-5xl mx-auto px-4 pb-28 border-t border-border pt-20">
    <div class="text-center mb-14">
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            {LL.home.benefits.heading()}
        </h2>
        <p class="mt-3 text-tertiary max-w-lg mx-auto">
            {LL.home.benefits.subtitle()}
        </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each benefits as ben}
            {@const Icon = ben.icon}
            <div
                class="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-all hover:scale-[102%] hover:border-border-hover"
            >
                <Icon size={16} class="shrink-0 text-tertiary" />
                <span class="text-sm text-tertiary">{ben.label}</span>
            </div>
        {/each}
    </div>
</section>

<footer class="border-t border-border bg-card py-8">
    <div
        class="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-tertiary"
    >
        <span>{LL.home.footer.brand()}</span>
        <a
            href="https://github.com/scrobblrhq/scrobblr"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-tertiary transition-colors"
        >
            {LL.home.footer.github()}
        </a>
    </div>
</footer>
