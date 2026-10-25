<script lang="ts">
    import type { PageProps } from "./$types";
    import { page } from "$app/state";
    import { discordComponentEmbed, serializeJsonForHtml } from "#lib/seo";
    const { data }: PageProps = $props();
    const { user, featuredTrack } = $derived(data);
    import { getLL } from "#lib/i18n.svelte";

    let LL = $derived(getLL());
    const homeTitle = $derived(LL.home.meta.title());
    const homeDescription = $derived(LL.home.hero.description());
    const homeUrl = $derived(`${page.url.origin}/`);
    const homeDiscordEmbed = $derived(serializeJsonForHtml(discordComponentEmbed({
        title: homeTitle,
        description: homeDescription,
        url: homeUrl,
    })));
    import MusicNoteIcon from "@lucide/svelte/icons/music-2";
    import GlobeIcon from "@lucide/svelte/icons/globe";
    import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
    import TimerIcon from "@lucide/svelte/icons/timer";
    import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
    import UserCheckIcon from "@lucide/svelte/icons/user-check";
    import TextLoop from "#lib/components/ui/TextLoop.svelte";
    import BorderGlow from "#lib/components/ui/BorderGlow.svelte";

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

    let loopText = $derived(features.map((f) => f.title).join(" ✦ "));

    let benefits = $derived([
        { icon: TimerIcon, label: LL.home.benefits.item1() },
        { icon: BarChart3Icon, label: LL.home.benefits.item2() },
        { icon: GlobeIcon, label: LL.home.benefits.item3() },
        { icon: UserCheckIcon, label: LL.home.benefits.item4() },
    ]);
</script>

<svelte:head>
    <title>{homeTitle}</title>
    <meta name="description" content={homeDescription} />
    <link rel="canonical" href={homeUrl} />
    <meta property="og:site_name" content="Scrobblr" />
    <meta property="og:title" content={homeTitle} />
    <meta property="og:description" content={homeDescription} />
    <meta property="og:url" content={homeUrl} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={homeTitle} />
    <meta name="twitter:description" content={homeDescription} />
    <script id="discord:component-embed" type="application/json">{@html homeDiscordEmbed}</script>
</svelte:head>

<section class="relative isolate overflow-hidden">
    <div class="absolute inset-0"></div>

    <div
        class="max-w-6xl mx-auto px-5 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center"
    >
        <div class="relative z-10 max-w-xl">
            <p
                class="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary mb-7"
            >
                {LL.home.hero.badge()}
            </p>

            <h1
                class="text-[clamp(3.5rem,8vw,7.25rem)] font-bold tracking-[-0.075em] text-primary leading-[0.9] text-balance"
            >
                {LL.home.hero.title1()}
                <br />
                <span class="text-tertiary">{LL.home.hero.title2()}</span>
            </h1>

            <p
                class="mt-8 text-base sm:text-lg text-tertiary max-w-lg leading-relaxed"
            >
                {LL.home.hero.description()}
            </p>

            <div class="mt-9 flex flex-wrap items-center gap-3">
                {#if user}
                    <a
                        href="/user/{user.username}"
                        class="group inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-accent-text transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(199,243,107,0.22)] active:translate-y-px"
                    >
                        {LL.home.cta.ownProfile()}
                        <ArrowUpRightIcon
                            size={15}
                            class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </a>
                {:else}
                    <a
                        href="/auth/login"
                        class="group inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-accent-text transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(199,243,107,0.22)] active:translate-y-px"
                    >
                        {LL.home.cta.signup()}
                        <ArrowUpRightIcon
                            size={15}
                            class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </a>
                    <a
                        href="/auth/login"
                        class="inline-flex items-center rounded-[10px] border border-border px-5 py-3 text-sm font-medium text-secondary hover:border-border-active hover:bg-hover transition-colors"
                    >
                        {LL.home.cta.login()}
                    </a>
                {/if}
            </div>
        </div>

        <div
            class="relative min-h-100 lg:min-h-136 border border-border bg-card/75 p-3 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.45)] backdrop-blur-sm"
        >
            <div class="absolute inset-3 overflow-hidden bg-surface">
                {#if featuredTrack?.album_image}
                    <img
                        src={featuredTrack.album_image}
                        alt={featuredTrack.track_title}
                        width="640"
                        height="640"
                        fetchpriority="high"
                        class="absolute inset-0 size-full object-cover opacity-65 grayscale-20 transition-transform duration-700 hover:scale-105"
                    />
                {:else}
                    <img
                        src="/covers/7.jpeg"
                        alt="Hollywood's bleeding"
                        width="640"
                        height="640"
                        fetchpriority="high"
                        class="absolute inset-0 size-full object-cover opacity-65 grayscale-20 transition-transform duration-700 hover:scale-105"
                    />
                {/if}
                <div
                    class="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent"
                ></div>
                <div
                    class="absolute left-5 right-5 top-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75"
                >
                    <span>SCROBBLR / 001</span>
                    <span class="flex items-center gap-2"
                        ><span
                            class="size-1.5 rounded-full bg-accent animate-pulse"
                        ></span>{LL.functions.time.now()}</span
                    >
                </div>
                <div class="absolute bottom-5 left-5 right-5 text-white">
                    <p
                        class="text-xs uppercase tracking-[0.18em] text-white/60"
                    >
                        {features[0].title}
                    </p>
                    {#if featuredTrack}
                        <p
                            class="text-xs uppercase tracking-[0.18em] text-white/60"
                        >
                            TOP TRACK · 7 DAYS
                        </p>
                        <p class="mt-2 text-2xl font-semibold tracking-tight">
                            {featuredTrack.track_title}
                        </p>
                        <p class="text-sm text-white/65">
                            {featuredTrack.artist_name}
                        </p>
                    {:else}
                        <p class="mt-2 text-2xl font-semibold tracking-tight">
                            {LL.home.benefits.heading()}
                        </p>
                    {/if}
                    <div
                        class="mt-5 flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/65"
                    >
                        <span>{benefits[0].label}</span>
                        <span>01 / 04</span>
                    </div>
                </div>
            </div>
            <div
                class="absolute -bottom-4 -left-4 bg-accent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-text shadow-lg"
            >
                {LL.home.benefits.item4()}
            </div>
        </div>
    </div>
</section>

<section
    class="-mt-10 relative overflow-hidden border-border bg-surface/5 dark:bg-transparent backdrop-blur-xs dark:backdrop-blur-none py-3 sm:py-3"
>
    <TextLoop
        text={loopText}
        shape="wave"
        separator="✦"
        curviness={16}
        ribbonWidth={64}
        viewHeight={104}
        fontSize={26}
        fontWeight={700}
        letterSpacing={3.5}
        speed={38}
        ribbonColor="var(--color-accent, #c7f36b)"
        color="var(--color-accent-text, #11140a)"
        class="mask-[linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]"
    />
</section>

<section class=" border-border bg-card/15">
    <div class="max-w-6xl mx-auto px-5 py-20 sm:py-28">
        <div
            class="mb-10 flex items-end justify-between gap-6 border-b border-border pb-5"
        >
            <h2
                class="max-w-md text-3xl sm:text-4xl font-semibold leading-tight tracking-[-0.045em] text-primary"
            >
                {LL.home.benefits.heading()}
            </h2>
            <p
                class="hidden max-w-xs text-right text-sm leading-relaxed text-tertiary sm:block"
            >
                {LL.home.benefits.subtitle()}
            </p>
        </div>

        <div
            class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4 sm:gap-5"
        >
            {#each features as feat, i}
                {@const Icon = feat.icon}
                <div
                    class="animate-[page-reveal_500ms_ease_both]"
                    style={`animation-delay: ${i * 90}ms`}
                >
                    <BorderGlow
                        touchSweep
                        class="group h-full"
                        borderRadius={10}
                        glowRadius={28}
                        glowColor="79 85 69"
                        glowIntensity={1.4}
                        coneSpread={25}
                        edgeSensitivity={17}
                        colors={["#c7f36b", "#7fd63a", "#f0ffc2"]}
                    >
                        <div
                            class="flex flex-1 flex-col gap-8 p-5 sm:p-6 lg:p-7"
                        >
                            <div class="flex items-start justify-between">
                                <span
                                    class="flex size-10 shrink-0 items-center justify-center border border-border text-secondary transition-all duration-300 group-hover:rotate-[-4deg] group-hover:border-accent group-hover:bg-accent group-hover:text-accent-text"
                                >
                                    <Icon size={18} />
                                </span>
                                <span class="font-mono text-xs text-quaternary"
                                    >0{i + 1}</span
                                >
                            </div>
                            <div class="mt-auto flex flex-col gap-2">
                                <h3
                                    class="text-lg font-semibold tracking-[-0.02em] text-primary"
                                >
                                    {feat.title}
                                </h3>
                                <p
                                    class="text-sm leading-relaxed text-tertiary"
                                >
                                    {feat.desc}
                                </p>
                            </div>
                        </div>
                    </BorderGlow>
                </div>
            {/each}
        </div>
    </div>
</section>

<section class="border-y border-border bg-card/55 backdrop-blur-sm">
    <div
        class="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-5"
    >
        {#each benefits as ben, i}
            {@const Icon = ben.icon}
            <div
                class="group flex items-center gap-3 transition-transform duration-200 hover:translate-x-1"
            >
                <span
                    class="font-mono text-[10px] text-quaternary group-hover:text-accent transition-colors"
                    >0{i + 1}</span
                >
                <Icon
                    size={15}
                    class="text-secondary group-hover:text-accent transition-colors"
                />
                <span
                    class="text-sm text-secondary group-hover:text-primary transition-colors"
                    >{ben.label}</span
                >
            </div>
        {/each}
    </div>
</section>

<footer
    class="max-w-6xl mx-auto px-5 py-8 flex items-center justify-between text-xs text-tertiary"
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
</footer>
