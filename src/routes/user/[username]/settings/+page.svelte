<script lang="ts">
    // #region Stuff
    import type { PageProps } from "./$types";
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { afterNavigate, replaceState } from "$app/navigation";
    import { useTheme } from "svelte-themes";
    import type { ApiToken, S } from "#lib/api/types";
    import { getLL, getLocale } from "#lib/i18n.svelte";
    import { featureCopy } from "#lib/i18n/features";
    import { formatDate } from "#lib/utils/format";
    import { PALETTES, PALETTE_NAMES } from "#lib/theme/palettes";
    // #endregion Stuff

    // #region Icons
    import MoonIcon from "@lucide/svelte/icons/moon";
    import SunIcon from "@lucide/svelte/icons/sun";
    import CameraIcon from "@lucide/svelte/icons/camera";
    import XIcon from "@lucide/svelte/icons/x";
    import Music2Icon from "@lucide/svelte/icons/music-2";
    import SystemIcon from "@lucide/svelte/icons/laptop-minimal";
    // #endregion Icons

    // #region Colocated components
    import SettingsSidebar from "#lib/components/profile/SettingsSidebar.svelte";
    // #endregion

    // #region Components
    import Avatar from "#lib/components/ui/Avatar.svelte";
    import Switch from "#lib/components/ui/Switch.svelte";
    import MagneticSelect from "#lib/components/ui/MagneticSelect.svelte";
    import ConfirmChanges from "#lib/components/feedback/ConfirmChanges.svelte";
    // #endregion Components

    // #region Stores
    import { addToast } from "#lib/stores/toast.svelte";
    import { paletteState, setPalette } from "#lib/stores/palette.svelte";
    // #endregion Stores

    // #region Hooks
    import { useIsDesktop } from "#lib/hooks/isDesktop.svelte";
    // #endregion Hooks

    const DEFAULT_SWATCH = ["#09090b", "#71717a", "#e4e4e7", "#fafafa"];
    const paletteOptions = PALETTE_NAMES.map((name) => ({
        name,
        swatch: name === "default" ? DEFAULT_SWATCH : PALETTES[name],
    }));

    const themeOptions = ["dark", "light", "system"] as const;
    const themeLabels = {
        dark: "Dark",
        light: "Light",
        system: "System",
    } as const;

    const paletteMarks = paletteOptions.map(({ swatch }) => {
        const stops = swatch
            .map((color, index) => `${color} ${index * 25}%`)
            .join(", ");
        return `linear-gradient(135deg, ${stops})`;
    });

    const { data, form }: PageProps = $props();
    const featureLabels = $derived(featureCopy(getLocale()));

    const profile = $derived(data.profile);
    const connections = $derived(data.connections);
    const spotify = $derived(connections.find((c) => c.provider === "spotify"));
    const lastfm = $derived(connections.find((c) => c.provider === "lastfm"));
    const username = $derived(page.params.username ?? "");
    const theme = useTheme();
    let imports = $state<S["ScrobbleImport"][]>(data.imports);
    let activeImportId = $derived(
        imports.find((entry) => entry.status === "pending" || entry.status === "running")?.id ?? null,
    );
    let latestImport = $derived(imports[0] ?? null);
    let startingImport = $state(false);
    let cancellingImportId = $state<number | null>(null);
    let fullImport = $state(false);

    let tokens = $derived<ApiToken[]>(data.tokens);
    let scrobblerCredentials = $derived<S["ScrobblerCredential"][]>(data.scrobblerCredentials);

    let newToken = $state<{ id: string; name: string; token: string } | null>(
        null,
    );
    let copied = $state(false);
    let copiedScrobblerSecret = $state(false);
    let newScrobblerToken = $state<S["CreatedScrobblerToken"] | null>(null);
    let creatingScrobblerToken = $state(false);
    let deletingAccount = $state(false);
    let scrobblerCredentialName = $state("");
    let deleteConfirmation = $state("");
    let creating = $state(false);
    let showForm = $state(false);
    let activeSection = $state("perfil");
    let connectionAction = $state<"connect" | "disconnect" | null>(null);

    $effect(() => {
        imports = data.imports;
    });

    $effect(() => {
        const id = activeImportId;
        if (id === null) return;

        let inFlight = false;
        const poll = async () => {
            if (inFlight) return;
            inFlight = true;
            try {
                const response = await fetch(
                    `/user/${encodeURIComponent(username)}/settings/imports/${id}`,
                );
                if (!response.ok) return;
                const updated = (await response.json()) as S["ScrobbleImport"];
                imports = imports.map((entry) =>
                    entry.id === updated.id ? updated : entry,
                );
            } catch {
                // Keep showing the last known progress and retry next interval.
            } finally {
                inFlight = false;
            }
        };

        const timer = window.setInterval(() => void poll(), 2500);
        void poll();
        return () => window.clearInterval(timer);
    });

    function importStatusLabel(status: S["ImportStatus"]) {
        switch (status) {
            case "pending": return LL.settings.import.pending();
            case "running": return LL.settings.import.running();
            case "done": return LL.settings.import.done();
            case "failed": return LL.settings.import.failed();
            case "cancelled": return LL.settings.import.cancelled();
        }
    }

    function importProgress(entry: S["ScrobbleImport"]) {
        const total = entry.total_expected ?? 0;
        return total > 0 ? Math.min(100, Math.round((entry.fetched / total) * 100)) : 0;
    }

    // svelte-ignore state_referenced_locally
    const initialProfile = data.profile;
    let draftIsPrivate = $state(initialProfile.is_private);
    let draftDisplayName = $state(initialProfile.display_name ?? "");
    let draftBio = $state(initialProfile.bio ?? "");
    let saved = $state(false);

    let avatarFile = $state<File | null>(null);
    let avatarPreview = $state<string | null>(null);
    let removeAvatar = $state(false);
    let avatarInput = $state<HTMLInputElement | null>(null);

    let originalIsPrivate = $derived(profile.is_private);
    let originalDisplayName = $derived(profile.display_name ?? "");
    let originalBio = $derived(profile.bio ?? "");
    let isDirty = $derived(
        draftIsPrivate !== originalIsPrivate ||
            draftDisplayName !== originalDisplayName ||
            draftBio !== originalBio ||
            avatarFile !== null ||
            removeAvatar,
    );

    function discardChanges() {
        draftIsPrivate = originalIsPrivate;
        draftDisplayName = originalDisplayName;
        draftBio = originalBio;
        clearAvatarSelection();
    }

    function clearAvatarSelection() {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        avatarFile = null;
        avatarPreview = null;
        removeAvatar = false;
        if (avatarInput) avatarInput.value = "";
    }

    function pickAvatar() {
        avatarInput?.click();
    }

    function onAvatarChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        avatarFile = file;
        avatarPreview = URL.createObjectURL(file);
        removeAvatar = false;
    }

    function markRemoveAvatar() {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        avatarFile = null;
        avatarPreview = null;
        removeAvatar = true;
        if (avatarInput) avatarInput.value = "";
    }

    let handledCreatedToken: unknown = null;
    $effect(() => {
        if (form?.created && form.created !== handledCreatedToken) {
            handledCreatedToken = form.created;
            newToken = form.created;
            showForm = false;
            addToast(LL.settings.toast.tokenCreated(), "success");
        }
    });

    // Track active section via IntersectionObserver
    $effect(() => {
        const sections = document.querySelectorAll("[data-section]");
        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("data-section");
                        if (id) {
                            activeSection = id;
                            replaceState(`#${id}`, {});
                        }
                    }
                }
            },
            { rootMargin: "-80px 0px -60% 0px" },
        );

        for (const el of sections) observer.observe(el);
        return () => observer.disconnect();
    });

    // Scroll to hash on load
    $effect(() => {
        if (location.hash) {
            const id = location.hash.slice(1);
            const el = document.getElementById(id);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        }
    });

    // Warn about unsaved changes
    $effect(() => {
        if (isDirty) {
            const handler = (e: BeforeUnloadEvent) => {
                e.preventDefault();
            };
            window.addEventListener("beforeunload", handler);
            return () => window.removeEventListener("beforeunload", handler);
        }
    });

    async function copyToken(token: string) {
        await navigator.clipboard.writeText(token);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }

    async function copyScrobblerSecret() {
        if (!newScrobblerToken) return;
        await navigator.clipboard.writeText(newScrobblerToken.token);
        copiedScrobblerSecret = true;
        setTimeout(() => (copiedScrobblerSecret = false), 2000);
    }

    let LL = $derived(getLL());

    function timeAgo(iso: string | null): string {
        if (!iso) return LL.functions.time.never();
        const diff = Date.now() - new Date(iso).getTime();
        const days = Math.floor(diff / 86_400_000);
        if (days === 0) return LL.functions.time.today();
        if (days === 1) return LL.functions.time.yesterday();
        if (days < 30) return LL.functions.time.daysAgo({ days });
        return formatDate(iso);
    }

    let confirmingAll = $state(false);
    let loggingOutAll = $state(false);

    const isDesktop = useIsDesktop();

    afterNavigate(() => {
        const result = page.url.searchParams.get("connect");
        if (!result) return;
        const provider =
            page.url.searchParams.get("provider") === "lastfm"
                ? "Last.fm"
                : "Spotify";
        const key =
            (
                {
                    ok: "ok",
                    denied: "denied",
                    invalid: "invalid",
                    conflict: "conflict",
                    rate_limited: "rateLimited",
                    unavailable: "unavailable",
                } as const
            )[result as "ok"] ?? "failed";

        addToast(
            LL.settings.connection.result[key]({ provider }),
            key === "ok" ? "success" : "error",
        );
        replaceState(page.url.pathname + "#connections", {});
    });
</script>

<svelte:head>
    <meta name="robots" content="noindex, nofollow" />
    <title>{LL.settings.meta.title()}</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex gap-10">
    <SettingsSidebar active={activeSection} username={profile.username} />

    <main class="flex-1 min-w-0">
        <header class="mb-12 border-b border-border/70 pb-8">
            <p
                class="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent mb-3"
            >
                Scrobblr / account
            </p>
            <h1
                class="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-primary text-balance"
            >
                {LL.settingsSidebar.title()}
            </h1>
        </header>

        <div class="space-y-16">
            <form
                id="settings-form"
                method="POST"
                action="?/saveSettings"
                enctype="multipart/form-data"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === "success") {
                            const data = result.data as
                                | { saved: boolean; profile: typeof profile }
                                | undefined;
                            if (data) {
                                saved = true;
                                draftIsPrivate = data.profile.is_private;
                                draftDisplayName =
                                    data.profile.display_name ?? "";
                                draftBio = data.profile.bio ?? "";
                                clearAvatarSelection();
                                addToast(LL.settings.toast.saved(), "success");
                                setTimeout(() => (saved = false), 2000);
                            }
                        } else if (result.type === "failure") {
                            const data = result.data as
                                | { message?: string }
                                | undefined;
                            addToast(
                                data?.message ??
                                    (connectionAction
                                        ? LL.settings.connection.error({
                                              provider:
                                                  connectionAction === "connect"
                                                      ? "Spotify"
                                                      : "Last.fm",
                                          })
                                        : LL.settings.toast.saveError()),
                                "error",
                            );
                        }
                        connectionAction = null;
                        await update({ reset: false, invalidateAll: true });
                    };
                }}
            ></form>
            <div class="space-y-14">
                <!-- Profile -->
                <section
                    id="profile"
                    data-section="profile"
                    class="scroll-mt-20"
                >
                    <h2 class="text-lg font-bold text-primary mb-1">
                        {LL.settings.section.profile()}
                    </h2>
                    <p class="text-sm text-tertiary mb-6">
                        {LL.settings.section.profileDesc()}
                    </p>

                    <div
                        class="
                        border border-border/70 bg-card/60 backdrop-blur-md p-5 sm:p-6 space-y-5
                        shadow-[0_12px_32px_rgba(9,9,11,0.035)]
                        transition-all duration-150
                        {isDirty ? 'rounded-t-xl' : 'rounded-xl'}
                    "
                    >
                        <!-- Avatar -->
                        <div
                            class="flex items-center gap-4 mb-6 pb-5 border-b border-border/70"
                        >
                            <div class="relative group rounded-full">
                                <Avatar
                                    url={removeAvatar
                                        ? null
                                        : (avatarPreview ?? profile.image_url)}
                                    name={profile.display_name ||
                                        profile.username}
                                    class="size-24 text-xl"
                                />
                                <button
                                    type="button"
                                    onclick={pickAvatar}
                                    class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
                                       opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <CameraIcon
                                        size={18}
                                        class="text-white/70"
                                    />
                                </button>
                                {#if (profile.image_url && !removeAvatar) || avatarPreview}
                                    <button
                                        type="button"
                                        onclick={markRemoveAvatar}
                                        aria-label={LL.settings.label.avatar()}
                                        class="absolute -top-1 -right-1 size-6 rounded-full bg-card border border-border flex items-center justify-center text-tertiary hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer"
                                    >
                                        <XIcon size={12} />
                                    </button>
                                {/if}
                            </div>
                            <div>
                                <p class="text-sm text-secondary">
                                    {LL.settings.label.avatar()}
                                </p>
                                <p class="text-xs text-tertiary">
                                    {LL.settings.hint.avatar()}
                                </p>
                            </div>
                            <input
                                bind:this={avatarInput}
                                onchange={onAvatarChange}
                                type="file"
                                name="avatar"
                                form="settings-form"
                                accept="image/png,image/jpeg,image/webp"
                                class="hidden"
                            />
                        </div>

                        <!-- Username -->
                        <div>
                            <span
                                class="block text-xs font-medium text-tertiary mb-1.5"
                                >{LL.settings.label.username()}</span
                            >
                            <div
                                class="cursor-text text-sm text-secondary bg-input border border-border rounded-lg px-3 py-2.5"
                            >
                                {username}
                            </div>
                        </div>
                        <!-- Display name -->
                        <div>
                            <label
                                for="display_name"
                                class="block text-xs font-medium text-tertiary mb-1.5"
                                >{LL.settings.label.displayName()}</label
                            >
                            <input
                                id="display_name"
                                name="display_name"
                                form="settings-form"
                                type="text"
                                maxlength="64"
                                placeholder={LL.settings.placeholder.displayName()}
                                bind:value={draftDisplayName}
                                class="w-full bg-input border border-border text-primary placeholder-tertiary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors"
                            />
                            <p class="text-xs text-tertiary mt-1.5">
                                {LL.settings.hint.displayName()}
                            </p>
                        </div>
                        <!-- Bio -->
                        <div>
                            <label
                                for="bio"
                                class="block text-xs font-medium text-tertiary mb-1.5"
                                >{LL.settings.label.bio()}</label
                            >
                            <textarea
                                id="bio"
                                name="bio"
                                form="settings-form"
                                rows={3}
                                maxlength="512"
                                placeholder={LL.settings.placeholder.bio()}
                                bind:value={draftBio}
                                class="w-full bg-input border border-border text-primary placeholder-tertiary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors resize-none"
                            ></textarea>
                        </div>
                        <input
                            type="hidden"
                            name="remove_avatar"
                            form="settings-form"
                            value={String(removeAvatar)}
                        />
                    </div>
                </section>

                <!-- Connections -->
                <section
                    id="connections"
                    data-section="connections"
                    class="scroll-mt-20"
                >
                    <h2 class="text-lg font-bold text-primary mb-1">
                        {LL.settings.section.connections()}
                    </h2>
                    <p class="text-sm text-tertiary mb-6">
                        {LL.settings.section.connectionsDesc()}
                    </p>

                    <div class="space-y-5">
                        <div
                            class="border border-border/70 border-l-2 border-l-accent bg-card/60 backdrop-blur-md p-5 sm:p-6 rounded-xl shadow-[0_12px_32px_rgba(9,9,11,0.035)]"
                        >
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex items-start gap-3 min-w-0">
                                    <div
                                        class="size-10 shrink-0 rounded-lg bg-[#1DB954] text-black flex items-center justify-center"
                                    >
                                        <img src="/images/spotify_primary_logo_white.png" alt="Spotify" class="h-6 w-auto" />
                                    </div>
                                    <div class="min-w-0">
                                        <div
                                            class="flex items-center gap-2 flex-wrap"
                                        >
                                            <h3
                                                class="font-semibold text-primary"
                                            >
                                                Spotify
                                            </h3>
                                            <span
                                                class="text-[11px] uppercase tracking-wider {spotify?.is_active
                                                    ? 'text-[#1DB954]'
                                                    : 'text-tertiary'}"
                                            >
                                                {spotify?.is_active
                                                    ? LL.settings.connection.connected()
                                                    : LL.settings.connection.disconnected()}
                                            </span>
                                        </div>
                                        <p class="text-sm text-tertiary mt-1">
                                            {spotify?.is_active
                                                ? LL.settings.connection.active()
                                                : LL.settings.connection.inactive()}
                                        </p>
                                        {#if spotify?.last_error}
                                            <p
                                                class="text-xs text-red-400 mt-2"
                                            >
                                                {spotify.last_error}
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                                {#if spotify}
                                    <button
                                        type="submit"
                                        form="connections-form"
                                        formaction="?/disconnect"
                                        name="provider"
                                        value="spotify"
                                        class="text-xs text-tertiary hover:text-red-400 transition-colors"
                                    >
                                        {LL.settings.connection.disconnect()}
                                    </button>
                                {:else}
                                    <button
                                        type="submit"
                                        form="connections-form"
                                        formaction="?/connect"
                                        name="provider"
                                        value="spotify"
                                        class="shrink-0 px-3 py-2 rounded-lg bg-primary text-inverse text-sm font-medium hover:opacity-85 transition-opacity"
                                    >
                                        {LL.settings.connection.connect({
                                            provider: "Spotify",
                                        })}
                                    </button>
                                {/if}
                            </div>
                        </div>
                        <div
                            class="border border-border/70 border-l-2 border-l-accent bg-card/60 backdrop-blur-md p-5 sm:p-6 rounded-xl shadow-[0_12px_32px_rgba(9,9,11,0.035)]"
                        >
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex items-start gap-3 min-w-0">
                                    <div
                                        class="size-10 shrink-0 rounded-lg bg-[#d51007] text-black flex items-center justify-center"
                                    >
                                        <img src="/images/last_fm_icon_white.svg" alt="Last.fm" class="h-6 w-auto" />
                                    </div>
                                    <div class="min-w-0">
                                        <div
                                            class="flex items-center gap-2 flex-wrap"
                                        >
                                            <h3
                                                class="font-semibold text-primary"
                                            >
                                                Last.fm
                                            </h3>
                                            <span
                                                class="text-[11px] uppercase tracking-wider {lastfm
                                                    ? 'text-[#d51007]'
                                                    : 'text-tertiary'}"
                                            >
                                                {lastfm
                                                    ? LL.settings.connection.connected()
                                                    : LL.settings.connection.disconnected()}
                                            </span>
                                        </div>
                                        <p class="text-sm text-tertiary mt-1">
                                            {lastfm
                                                ? LL.settings.import.connectedAs({ username: lastfm.provider_user_id })
                                                : LL.settings.import.unlinked()}
                                        </p>
                                        {#if lastfm?.last_error}
                                            <p
                                                class="text-xs text-red-400 mt-2"
                                            >
                                                {lastfm.last_error}
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                                {#if lastfm}
                                    <button
                                        type="submit"
                                        form="connections-form"
                                        formaction="?/disconnect"
                                        name="provider"
                                        value="lastfm"
                                        class="text-xs text-tertiary hover:text-red-400 transition-colors"
                                    >
                                        {LL.settings.connection.disconnect()}
                                    </button>
                                {:else}
                                    <button
                                        type="submit"
                                        form="connections-form"
                                        formaction="?/connect"
                                        name="provider"
                                        value="lastfm"
                                        class="shrink-0 px-3 py-2 rounded-lg bg-primary text-inverse text-sm font-medium hover:opacity-85 transition-opacity"
                                    >
                                        {LL.settings.connection.connect({
                                            provider: "Last.fm",
                                        })}
                                    </button>
                                {/if}
                            </div>
                            {#if lastfm}
                                <div class="mt-5 border-t border-border/70 pt-4 space-y-4">
                                    <div>
                                        <h4 class="text-sm font-semibold text-primary">
                                            {LL.settings.import.title()}
                                        </h4>
                                        <p class="text-xs text-tertiary mt-1">
                                            {LL.settings.import.description()}
                                        </p>
                                    </div>

                                    <form
                                        method="POST"
                                        action="?/startLastfmImport"
                                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                                        use:enhance={() => {
                                            startingImport = true;
                                            return async ({ result, update }) => {
                                                startingImport = false;
                                                if (result.type === "failure") {
                                                    const actionData = result.data as { message?: string } | undefined;
                                                    addToast(actionData?.message ?? LL.settings.import.startFailed(), "error");
                                                } else if (result.type === "success") {
                                                    addToast(LL.settings.import.queued(), "success");
                                                }
                                                await update({ reset: false, invalidateAll: true });
                                            };
                                        }}
                                    >
                                        <label class="flex items-center gap-2 text-xs text-secondary">
                                            <input
                                                type="checkbox"
                                                name="full"
                                                value="true"
                                                bind:checked={fullImport}
                                                class="rounded border-border bg-input text-accent focus:ring-accent"
                                            />
                                            {LL.settings.import.fullHistory()}
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={startingImport || activeImportId !== null}
                                            class="shrink-0 px-3 py-2 rounded-lg bg-primary text-inverse text-sm font-medium hover:opacity-85 disabled:opacity-50 transition-opacity"
                                        >
                                            {startingImport
                                                ? LL.settings.import.starting()
                                                : LL.settings.import.start()}
                                        </button>
                                    </form>

                                    {#if latestImport}
                                        <div class="border-t border-border/50 pt-4 space-y-3">
                                            <div class="flex items-center justify-between gap-3">
                                                <h5 class="text-xs font-semibold uppercase tracking-wider text-tertiary">
                                                    {LL.settings.import.recent()}
                                                </h5>
                                                <span class="text-xs {latestImport.status === 'failed' ? 'text-red-400' : latestImport.status === 'done' ? 'text-emerald-400' : 'text-secondary'}">
                                                    {importStatusLabel(latestImport.status)}
                                                </span>
                                            </div>
                                            {#if latestImport.total_expected}
                                                {@const percent = importProgress(latestImport)}
                                                <div>
                                                    <div class="h-1.5 overflow-hidden rounded-full bg-input" role="meter" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" aria-label={LL.settings.import.progressLabel()}>
                                                        <div class="h-full rounded-full bg-accent transition-[width] duration-300" style="width: {percent}%"></div>
                                                    </div>
                                                    <p class="text-xs text-tertiary mt-2">
                                                        {LL.settings.import.progress({ fetched: latestImport.fetched, total: latestImport.total_expected })}
                                                    </p>
                                                </div>
                                            {/if}
                                            <p class="text-xs text-secondary">
                                                {LL.settings.import.summary({ imported: latestImport.imported, duplicates: latestImport.duplicates, skipped: latestImport.skipped })}
                                            </p>
                                            {#if latestImport.error_message}
                                                <p class="text-xs text-red-400">{latestImport.error_message}</p>
                                            {/if}
                                            {#if activeImportId === latestImport.id}
                                                <form
                                                    method="POST"
                                                    action="?/cancelLastfmImport"
                                                    class="flex justify-end"
                                                    use:enhance={() => {
                                                        cancellingImportId = latestImport.id;
                                                        return async ({ result, update }) => {
                                                            cancellingImportId = null;
                                                            if (result.type === "failure") {
                                                                const actionData = result.data as { message?: string } | undefined;
                                                                addToast(actionData?.message ?? LL.settings.import.cancelFailed(), "error");
                                                            } else if (result.type === "success") {
                                                                addToast(LL.settings.import.cancelledToast(), "success");
                                                            }
                                                            await update({ reset: false, invalidateAll: true });
                                                        };
                                                    }}
                                                >
                                                    <input type="hidden" name="id" value={latestImport.id} />
                                                    <button type="submit" disabled={cancellingImportId === latestImport.id} class="text-xs text-tertiary hover:text-red-400 disabled:opacity-50 transition-colors">
                                                        {cancellingImportId === latestImport.id
                                                            ? LL.settings.import.cancelling()
                                                            : LL.settings.import.cancel()}
                                                    </button>
                                                </form>
                                            {/if}
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    </div>
                </section>

                <!-- Privacy -->
                <section
                    id="privacy"
                    data-section="privacy"
                    class="scroll-mt-20"
                >
                    <h2 class="text-lg font-bold text-primary mb-1">
                        {LL.settings.section.privacy()}
                    </h2>
                    <p class="text-sm text-tertiary mb-6">
                        {LL.settings.section.privacyDesc()}
                    </p>

                    <div
                        class="
                        border border-border/70 bg-card/60 backdrop-blur-md p-5 sm:p-6 space-y-5
                        shadow-[0_12px_32px_rgba(9,9,11,0.035)]
                        transition-all duration-150
                        {isDirty ? 'rounded-t-xl' : 'rounded-xl'}
                    "
                    >
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-secondary">
                                    {LL.settings.label.privateProfile()}
                                </p>
                                <p class="text-xs text-tertiary">
                                    {LL.settings.desc.privateProfile()}
                                </p>
                            </div>
                            <Switch
                                checked={draftIsPrivate}
                                onChange={(v) => (draftIsPrivate = v)}
                                name="is_private"
                                form="settings-form"
                            />
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-secondary">
                                    {LL.settings.label.showInSearch()}
                                </p>
                                <p class="text-xs text-tertiary">
                                    {LL.settings.desc.showInSearch()}
                                </p>
                            </div>
                            <Switch
                                checked={false}
                                onChange={() => {}}
                                disabled
                            />
                        </div>
                        <p class="text-xs text-tertiary">
                            {LL.settings.badge.comingSoon()}
                        </p>
                    </div>
                </section>
            </div>
            <form
                id="connections-form"
                method="POST"
                use:enhance={() =>
                    async ({ result, update }) => {
                        if (result.type === "redirect") {
                            window.location.href = result.location;
                            return;
                        }
                        if (result.type === "failure") {
                            const data = result.data as
                                | { message?: string }
                                | undefined;
                            addToast(
                                data?.message ??
                                    LL.settings.connection.error({
                                        provider:
                                            connectionAction === "connect"
                                                ? "Spotify"
                                                : "Last.fm",
                                    }),
                                "error",
                            );
                        }
                        await update({
                            reset: false,
                            invalidateAll: true,
                        });
                    }}
            ></form>

            <!-- API Tokens -->
            <section id="tokens" data-section="tokens" class="scroll-mt-20">
                <h2 class="text-lg font-bold text-primary mb-1">
                    {LL.settings.section.apiTokens()}
                </h2>
                <p class="text-sm text-tertiary mb-6">
                    {LL.settings.section.apiTokensDesc()}
                </p>

                {#if newToken}
                    <div
                        class="rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-5 mb-6 space-y-3"
                    >
                        <div class="flex items-center gap-2">
                            <span class="text-yellow-500 text-sm">⚠</span>
                            <p class="text-sm font-medium text-yellow-400">
                                {LL.settings.token.warning()}
                            </p>
                        </div>
                        <p class="text-xs text-tertiary">
                            {LL.settings.token.labelPrefix()}
                            <span class="text-secondary">{newToken.name}</span>
                        </p>
                        <div class="flex items-center gap-2">
                            <code
                                class="flex-1 text-xs bg-input border border-border rounded-lg px-3 py-2.5 text-green-400 font-mono break-all"
                                >{newToken.token}</code
                            >
                            <button
                                onclick={() => copyToken(newToken!.token)}
                                class="shrink-0 text-xs px-3 py-2.5 rounded-lg border transition-colors
                                {copied
                                    ? 'border-green-800 text-green-400'
                                    : 'border-border text-tertiary hover:border-border-hover hover:text-primary'}"
                            >
                                {copied
                                    ? LL.settings.token.copied()
                                    : LL.settings.token.copy()}
                            </button>
                        </div>
                        <button
                            onclick={() => (newToken = null)}
                            class="text-xs text-tertiary hover:text-quaternary transition-colors"
                            >{LL.settings.token.close()}</button
                        >
                    </div>
                {/if}

                <div class="space-y-4 border-t border-border/70 pt-5">
                    <div class="flex items-center justify-between">
                        <h3
                            class="text-xs font-semibold uppercase tracking-widest text-tertiary"
                        >
                            {LL.settings.tokenList.title()}
                        </h3>
                        <button
                            onclick={() => (showForm = !showForm)}
                            class="text-xs px-3 py-1.5 rounded-full border transition-colors
                            {showForm
                                ? 'border-border text-tertiary'
                                : 'border-border text-secondary hover:border-border-hover hover:text-primary'}"
                        >
                            {showForm
                                ? LL.settings.tokenList.cancel()
                                : LL.settings.tokenList.new()}
                        </button>
                    </div>

                    {#if showForm}
                        <form
                            method="POST"
                            action="?/createToken"
                            use:enhance={() => {
                                creating = true;
                                return async ({ result, update }) => {
                                    await update();
                                    creating = false;
                                    if (result.type === "failure") {
                                        const data = result.data as
                                            | { message?: string }
                                            | undefined;
                                        addToast(
                                            data?.message ??
                                                LL.settings.toast.createError(),
                                            "error",
                                        );
                                    }
                                };
                            }}
                            class="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-[0_12px_32px_rgba(9,9,11,0.035)]"
                        >
                            <div>
                                <label
                                    for="name"
                                    class="block text-xs font-medium text-tertiary mb-1.5"
                                    >{LL.settings.tokenForm.nameLabel()}</label
                                >
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    maxlength="64"
                                    placeholder={LL.settings.tokenForm.namePlaceholder()}
                                    class="w-full bg-input border border-border text-primary placeholder-tertiary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors"
                                />
                            </div>
                            <div>
                                <label
                                    for="expires_days"
                                    class="block text-xs font-medium text-tertiary mb-1.5"
                                    >{LL.settings.tokenForm.expiration()}
                                    <span class="text-tertiary"
                                        >{LL.settings.tokenForm.optional()}</span
                                    ></label
                                >
                                <select
                                    id="expires_days"
                                    name="expires_days"
                                    class="w-full bg-input border border-border text-primary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors"
                                >
                                    <option value=""
                                        >{LL.settings.tokenForm.noExpiration()}</option
                                    >
                                    <option value="30"
                                        >{LL.settings.tokenForm.exp30days()}</option
                                    >
                                    <option value="90"
                                        >{LL.settings.tokenForm.exp90days()}</option
                                    >
                                    <option value="365"
                                        >{LL.settings.tokenForm.exp1year()}</option
                                    >
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                class="w-full bg-accent text-accent-text font-medium text-sm rounded-lg py-2.5 hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                                {creating
                                    ? LL.settings.tokenForm.creating()
                                    : LL.settings.tokenForm.create()}
                            </button>
                        </form>
                    {/if}

                    {#if tokens.length === 0}
                        <p class="text-sm text-tertiary py-4">
                            {LL.settings.tokenList.empty()}
                        </p>
                    {:else}
                        <ul class="space-y-2">
                            {#each tokens as token (token.id)}
                                <li
                                    class="flex items-center gap-4 px-4 py-3 rounded-xl bg-card/60 backdrop-blur-md border border-border group"
                                >
                                    <div class="min-w-0 flex-1 space-y-0.5">
                                        <p
                                            class="text-sm text-secondary font-medium truncate"
                                        >
                                            {token.name}
                                        </p>
                                        <div
                                            class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-tertiary"
                                        >
                                            <span
                                                >{LL.settings.tokenList.created()}
                                                {formatDate(
                                                    token.created_at,
                                                )}</span
                                            >
                                            <span
                                                >{LL.settings.tokenList.lastUsed()}
                                                {timeAgo(
                                                    token.last_used_at,
                                                )}</span
                                            >
                                            {#if token.expires_at}
                                                <span class="text-yellow-700"
                                                    >{LL.settings.tokenList.expires()}
                                                    {formatDate(
                                                        token.expires_at,
                                                    )}</span
                                                >
                                            {/if}
                                        </div>
                                        <div class="flex gap-1 pt-0.5">
                                            {#each token.scopes as scope}
                                                <span
                                                    class="text-[10px] px-1.5 py-0.5 rounded bg-hover text-tertiary font-mono"
                                                    >{scope}</span
                                                >
                                            {/each}
                                        </div>
                                    </div>
                                    <form
                                        method="POST"
                                        action="?/revokeToken"
                                        use:enhance={() =>
                                            async ({ result }) => {
                                                if (result.type === "success") {
                                                    tokens = tokens.filter(
                                                        (t) =>
                                                            t.id !== token.id,
                                                    );
                                                    addToast(
                                                        LL.settings.toast.tokenRevoked(),
                                                        "success",
                                                    );
                                                } else if (
                                                    result.type === "failure"
                                                ) {
                                                    const data = result.data as
                                                        | { message?: string }
                                                        | undefined;
                                                    addToast(
                                                        data?.message ??
                                                            LL.settings.toast.revokeError(),
                                                        "error",
                                                    );
                                                }
                                            }}
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={token.id}
                                        />
                                        <button
                                            type="submit"
                                            class="text-xs text-tertiary hover:text-red-400 transition-colors {isDesktop.current
                                                ? 'opacity-0 group-hover:opacity-100'
                                                : ''}"
                                        >
                                            {LL.settings.tokenList.revoke()}
                                        </button>
                                    </form>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </section>

            <!-- Scrobbler credentials -->
            <section class="scroll-mt-20">
                <div class="mb-5 border-t border-border/70 pt-7">
                    <h3 class="text-lg font-bold text-primary mb-1">{featureLabels.scrobbler.title}</h3>
                    <p class="text-sm text-tertiary max-w-2xl">{featureLabels.scrobbler.description}</p>
                </div>

                {#if newScrobblerToken}
                    <div class="mb-5 rounded-xl border border-amber-700/40 bg-amber-950/15 p-5 space-y-3">
                        <div>
                            <h4 class="text-sm font-semibold text-primary">{featureLabels.scrobbler.revealTitle}</h4>
                            <p class="mt-1 text-xs text-tertiary">{featureLabels.scrobbler.revealDescription}</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <code class="min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2.5 text-xs text-green-400 font-mono break-all">{newScrobblerToken.token}</code>
                            <button type="button" onclick={copyScrobblerSecret} class="rounded-lg border border-border px-3 py-2 text-xs text-secondary hover:text-primary hover:bg-hover">
                                {copiedScrobblerSecret ? featureLabels.scrobbler.copied : featureLabels.scrobbler.copy}
                            </button>
                            <button type="button" onclick={() => (newScrobblerToken = null)} class="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-text hover:opacity-85">
                                {featureLabels.scrobbler.close}
                            </button>
                        </div>
                    </div>
                {/if}

                <form
                    method="POST"
                    action="?/createScrobblerToken"
                    class="mb-5 flex flex-col sm:flex-row gap-3 rounded-xl border border-border/70 bg-card/50 backdrop-blur-md p-4"
                    use:enhance={() => {
                        creatingScrobblerToken = true;
                        return async ({ result, update }) => {
                            creatingScrobblerToken = false;
                            if (result.type === "success") {
                                const data = result.data as { createdScrobblerToken?: S["CreatedScrobblerToken"] } | undefined;
                                if (data?.createdScrobblerToken) {
                                    newScrobblerToken = data.createdScrobblerToken;
                                    scrobblerCredentialName = "";
                                }
                            } else if (result.type === "failure") {
                                const data = result.data as { message?: string } | undefined;
                                addToast(data?.message ?? featureLabels.scrobbler.createFailed, "error");
                            }
                            await update({ reset: false, invalidateAll: true });
                        };
                    }}
                >
                    <label class="sr-only" for="scrobbler-credential-name">{featureLabels.scrobbler.name}</label>
                    <input
                        id="scrobbler-credential-name"
                        name="name"
                        required
                        maxlength="100"
                        bind:value={scrobblerCredentialName}
                        placeholder={featureLabels.scrobbler.placeholder}
                        class="min-w-0 flex-1 rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none focus:border-border-active focus:ring-1 focus:ring-border-active"
                    />
                    <button type="submit" disabled={creatingScrobblerToken} class="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-inverse hover:opacity-85 disabled:opacity-50">
                        {creatingScrobblerToken ? featureLabels.scrobbler.creating : featureLabels.scrobbler.create}
                    </button>
                </form>

                {#if scrobblerCredentials.length === 0}
                    <p class="py-3 text-sm text-tertiary">{featureLabels.scrobbler.empty}</p>
                {:else}
                    <ul class="divide-y divide-border/70 border-y border-border/70">
                        {#each scrobblerCredentials as credential (credential.id)}
                            <li class="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
                                <div class="min-w-0 flex-1">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h4 class="truncate text-sm font-medium text-primary">{credential.name}</h4>
                                        <span class="rounded bg-hover px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-tertiary">{credential.kind === "session" ? featureLabels.scrobbler.session : featureLabels.scrobbler.token}</span>
                                    </div>
                                    <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-tertiary">
                                        <span>{featureLabels.scrobbler.lastUsed}: {timeAgo(credential.last_used_at ?? null)}</span>
                                        <span>{credential.legacy_auth ? featureLabels.scrobbler.legacy : featureLabels.scrobbler.legacyUnavailable}</span>
                                    </div>
                                </div>
                                <form
                                    method="POST"
                                    action="?/revokeScrobblerCredential"
                                    use:enhance={() => async ({ result, update }) => {
                                        if (result.type === "failure") {
                                            const data = result.data as { message?: string } | undefined;
                                            addToast(data?.message ?? featureLabels.scrobbler.revokeFailed, "error");
                                        }
                                        await update({ reset: false, invalidateAll: true });
                                    }}
                                    onsubmit={(event) => {
                                        if (!window.confirm(featureLabels.scrobbler.revokeConfirm)) event.preventDefault();
                                    }}
                                >
                                    <input type="hidden" name="id" value={credential.id} />
                                    <button type="submit" class="rounded-lg border border-border px-3 py-2 text-xs text-tertiary hover:border-red-900/50 hover:text-red-400">{featureLabels.scrobbler.revoke}</button>
                                </form>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>

            <!-- Appearance -->
            <section
                id="appearance"
                data-section="appearance"
                class="scroll-mt-20"
            >
                <h2 class="text-lg font-bold text-primary mb-1">
                    {LL.settings.section.appearance()}
                </h2>
                <p class="text-sm text-tertiary mb-6">
                    {LL.settings.section.appearanceDesc()}
                </p>

                <div
                    class="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_32px_rgba(9,9,11,0.035)]"
                >
                    <div
                        class="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10"
                    >
                        <div class="md:border-r md:border-border/70 md:pr-8">
                            <span
                                class="block text-xs font-medium text-tertiary mb-3"
                                >{LL.settings.label.theme()}</span
                            >
                            <div class="flex justify-center sm:justify-start">
                                <div
                                    class="flex flex-wrap gap-2.5"
                                    role="radiogroup"
                                    aria-label="Theme"
                                >
                                    {#each themeOptions as mode}
                                        {@const isActive = theme.theme === mode}
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={isActive}
                                            aria-label={themeLabels[mode]}
                                            onclick={() => (theme.theme = mode)}
                                            class="group relative min-w-22 rounded-2xl border px-3 py-2.5 transition-all duration-200
                                        {isActive
                                                ? 'border-border-active bg-active/80 text-primary shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_28px_rgba(9,9,11,0.08)]'
                                                : 'border-border bg-card/40 text-tertiary hover:border-border-hover hover:text-secondary hover:bg-hover/80'}"
                                        >
                                            <span
                                                class="absolute inset-x-2 top-0 h-px rounded-full bg-white/10 opacity-0 transition-opacity {isActive
                                                    ? 'opacity-100'
                                                    : ''}"
                                            ></span>
                                            <span
                                                class="flex items-center justify-center gap-2 text-sm font-medium"
                                            >
                                                {#if mode === "dark"}
                                                    <MoonIcon size={15} />
                                                {:else if mode === "light"}
                                                    <SunIcon size={15} />
                                                {:else}
                                                    <SystemIcon size={15} />
                                                {/if}
                                                <span
                                                    class="text-[11px] font-medium tracking-[0.12em] uppercase"
                                                    >{themeLabels[mode]}</span
                                                >
                                            </span>
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                        <div class="md:pl-1">
                            <span
                                class="block text-xs font-medium text-tertiary mb-3"
                                >{LL.settings.label.palette()}</span
                            >
                            <div class="flex justify-center sm:justify-start">
                                <MagneticSelect
                                    count={paletteOptions.length}
                                    pull={60}
                                    bounce={80}
                                    give={70}
                                    marks={paletteMarks}
                                    selected={paletteOptions.findIndex(
                                        (option) =>
                                            option.name ===
                                            paletteState.current,
                                    )}
                                    onSelect={(index) => {
                                        const option = paletteOptions[index];
                                        if (option) setPalette(option.name);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Sessions  -->
            <section id="sessions" data-section="sessions" class="scroll-mt-20">
                <h2 class="text-lg font-bold text-primary mb-1">
                    {LL.settings.section.sessions()}
                </h2>
                <p class="text-sm text-tertiary mb-6">
                    {LL.settings.section.sessionsDesc()}
                </p>

                <div
                    class="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md p-5 sm:p-6 flex items-center justify-between gap-4 shadow-[0_12px_32px_rgba(9,9,11,0.035)]"
                >
                    <div class="min-w-0">
                        <h3 class="font-semibold text-primary">
                            {LL.settings.section.allTitle()}
                        </h3>
                        <p class="text-sm text-tertiary mt-1">
                            {LL.settings.section.allDesc()}
                        </p>
                    </div>

                    <form
                        method="POST"
                        action="/auth/logout"
                        class="shrink-0 flex items-center gap-2"
                        use:enhance={() => {
                            loggingOutAll = true;
                            return async ({ result, update }) => {
                                if (result.type === "failure") {
                                    const data = result.data as
                                        | { message?: string }
                                        | undefined;
                                    addToast(
                                        data?.message ??
                                            LL.settings.session.error(),
                                        "error",
                                    );
                                    loggingOutAll = false;
                                    confirmingAll = false;
                                    return;
                                }
                                await update(); // 303 to "/"
                            };
                        }}
                    >
                        <input type="hidden" name="all" value="true" />
                        {#if confirmingAll}
                            <button
                                type="button"
                                onclick={() => (confirmingAll = false)}
                                class="text-xs text-tertiary hover:text-primary transition-colors"
                            >
                                {LL.settings.session.cancel()}
                            </button>
                            <button
                                type="submit"
                                disabled={loggingOutAll}
                                class="px-3 py-2 rounded-lg border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-950/50 transition-colors disabled:opacity-40"
                            >
                                {LL.settings.session.confirm()}
                            </button>
                        {:else}
                            <button
                                type="button"
                                onclick={() => (confirmingAll = true)}
                                class="px-3 py-2 rounded-lg border border-border text-sm text-secondary hover:text-primary hover:bg-hover transition-colors"
                            >
                                {LL.settings.session.allButton()}
                            </button>
                        {/if}
                    </form>
                </div>
            </section>
            <section id="account-data" class="scroll-mt-20 border-t border-border/70 pt-8">
                <h2 class="text-lg font-bold text-primary mb-1">{featureLabels.account.title}</h2>
                <p class="text-sm text-tertiary mb-6">{featureLabels.account.description}</p>

                <div class="rounded-xl border border-border/70 bg-card/50 backdrop-blur-md p-5 sm:p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="max-w-2xl">
                            <h3 class="text-sm font-semibold text-primary">{featureLabels.account.exportTitle}</h3>
                            <p class="mt-1 text-sm text-tertiary">{featureLabels.account.exportDescription}</p>
                        </div>
                        <a href={`/user/${encodeURIComponent(username)}/settings/export`} class="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-secondary hover:bg-hover hover:text-primary transition-colors">
                            {featureLabels.account.export}
                        </a>
                    </div>
                </div>

                <div class="mt-4 rounded-xl border border-red-900/40 backdrop-blur-md bg-red-950/10 p-5 sm:p-6">
                    <h3 class="text-sm font-semibold text-red-300">{featureLabels.account.deleteTitle}</h3>
                    <p class="mt-1 max-w-2xl text-sm text-tertiary">{featureLabels.account.deleteDescription}</p>
                    <form
                        method="POST"
                        action="?/deleteAccount"
                        class="mt-5 grid gap-4 sm:grid-cols-2"
                        use:enhance={() => {
                            deletingAccount = true;
                            return async ({ result, update }) => {
                                deletingAccount = false;
                                if (result.type === "failure") {
                                    const actionData = result.data as { message?: string } | undefined;
                                    addToast(actionData?.message ?? featureLabels.account.deleteFailed, "error");
                                }
                                await update({ reset: false });
                            };
                        }}
                        onsubmit={(event) => {
                            if (!window.confirm(featureLabels.account.deleteConfirm)) event.preventDefault();
                        }}
                    >
                        <label class="grid gap-1.5 text-xs font-medium text-tertiary">
                            {featureLabels.account.deleteUsername}
                            <input name="confirm" required autocomplete="off" placeholder={username} class="rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-primary outline-none focus:border-red-700" />
                        </label>
                        <label class="grid gap-1.5 text-xs font-medium text-tertiary">
                            {featureLabels.account.deletePassword}
                            <input name="password" type="password" required autocomplete="current-password" class="rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-primary outline-none focus:border-red-700" />
                        </label>
                        <div class="sm:col-span-2">
                            <button type="submit" disabled={deletingAccount} class="rounded-lg border border-red-800/70 bg-red-950/50 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-900/50 disabled:opacity-50 transition-colors">
                                {deletingAccount ? featureLabels.account.deleting : featureLabels.account.deleteButton}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    </main>

    {#if isDirty || saved}
        <ConfirmChanges
            {saved}
            isDesktop={isDesktop.current}
            onDiscard={discardChanges}
            formId="settings-form"
        />
    {/if}
</div>
