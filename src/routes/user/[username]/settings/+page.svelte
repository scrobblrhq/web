<script lang="ts">
    import type { PageProps } from "./$types";
    import type { ApiToken } from "$lib/api/types";
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { replaceState } from "$app/navigation";
    import { useTheme } from "svelte-themes";
    import { capitalize } from "$lib/utils/format";
    import { getLL, getLocale } from "$lib/i18n.svelte";

    let LL = $derived(getLL());

    import MoonIcon from "@lucide/svelte/icons/moon";
    import SunIcon from "@lucide/svelte/icons/sun";
    import CameraIcon from "@lucide/svelte/icons/camera";
    import XIcon from "@lucide/svelte/icons/x";
    import SystemIcon from "@lucide/svelte/icons/laptop-minimal";

    import SettingsSidebar from "$lib/components/SettingsSidebar.svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import Toggle from "$lib/components/Toggle.svelte";
    import { addToast } from "$lib/stores/toast.svelte";
    import ConfirmChanges from "$lib/components/ui/ConfirmChanges.svelte";
    import { paletteState, setPalette } from "$lib/stores/palette.svelte";
    import { PALETTES, PALETTE_NAMES } from "$lib/theme/palettes";
    import { useIsDesktop } from "$lib/hooks/isDesktop.svelte";

    const DEFAULT_SWATCH = ["#09090b", "#71717a", "#e4e4e7", "#fafafa"];
    const paletteOptions = PALETTE_NAMES.map((name) => ({
        name,
        swatch: name === "default" ? DEFAULT_SWATCH : PALETTES[name],
    }));

    const { data, form }: PageProps = $props();

    const profile = $derived(data.profile);
    const username = $derived(page.params.username ?? "");
    const theme = useTheme();

    let tokens = $derived<ApiToken[]>(data.tokens);

    let newToken = $state<{ id: string; name: string; token: string } | null>(
        null,
    );
    let copied = $state(false);
    let creating = $state(false);
    let showForm = $state(false);
    let activeSection = $state("perfil");

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

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString(
            getLocale() === "es" ? "es-MX" : "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            },
        );
    }

    function timeAgo(iso: string | null): string {
        if (!iso) return LL.settings.time.never();
        const diff = Date.now() - new Date(iso).getTime();
        const days = Math.floor(diff / 86_400_000);
        if (days === 0) return LL.settings.time.today();
        if (days === 1) return LL.settings.time.yesterday();
        if (days < 30) return LL.settings.time.daysAgo({ days });
        return formatDate(iso);
    }

    const icons = {
        dark: MoonIcon,
        light: SunIcon,
        system: SystemIcon,
    };

    const isDesktop = useIsDesktop();
</script>

<svelte:head>
    <title>{LL.settings.meta.title()}</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-10 flex gap-8">
    <SettingsSidebar active={activeSection} username={profile.username} />

    <div class="flex-1 min-w-0 space-y-14">
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
                            draftDisplayName = data.profile.display_name ?? "";
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
                            data?.message ?? LL.settings.toast.saveError(),
                            "error",
                        );
                    }
                    await update({ reset: false, invalidateAll: true });
                };
            }}
            class="space-y-14"
        >
            <!-- Profile -->
            <section id="profile" data-section="profile" class="scroll-mt-20">
                <h2 class="text-lg font-bold text-primary mb-1">
                    {LL.settings.section.profile()}
                </h2>
                <p class="text-sm text-tertiary mb-6">
                    {LL.settings.section.profileDesc()}
                </p>

                <div
                    class="
                        border border-border bg-card/50 p-5 space-y-4
                        transition-all duration-150
                        {isDirty ? 'rounded-t-xl' : 'rounded-xl'}
                    "
                >
                    <!-- Avatar -->
                    <div class="flex items-center gap-4 mb-4">
                        <div class="relative group rounded-full">
                            <Avatar
                                url={removeAvatar
                                    ? null
                                    : (avatarPreview ?? profile.image_url)}
                                name={profile.display_name || profile.username}
                                class="size-24 text-xl"
                            />
                            <button
                                type="button"
                                onclick={pickAvatar}
                                class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
                                       opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <CameraIcon size={18} class="text-white/70" />
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
                            class="text-sm text-secondary bg-input border border-border rounded-lg px-3 py-2.5"
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
                        value={String(removeAvatar)}
                    />
                </div>
            </section>

            <!-- Privacy -->
            <section id="privacy" data-section="privacy" class="scroll-mt-20">
                <h2 class="text-lg font-bold text-primary mb-1">
                    {LL.settings.section.privacy()}
                </h2>
                <p class="text-sm text-tertiary mb-6">
                    {LL.settings.section.privacyDesc()}
                </p>

                <div
                    class="
                        border border-border bg-card/50 p-5 space-y-4
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
                        <Toggle
                            checked={draftIsPrivate}
                            onchange={(v) => (draftIsPrivate = v)}
                            name="is_private"
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
                        <Toggle checked={false} onchange={() => {}} disabled />
                    </div>
                    <p class="text-xs text-tertiary">
                        {LL.settings.badge.comingSoon()}
                    </p>
                </div>
            </section>
        </form>

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

            <div class="space-y-4">
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
                        class="rounded-xl border border-border bg-card/50 p-5 space-y-4"
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
                                class="flex items-center gap-4 px-4 py-3 rounded-xl bg-card border border-border group"
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
                                            {formatDate(token.created_at)}</span
                                        >
                                        <span
                                            >{LL.settings.tokenList.lastUsed()}
                                            {timeAgo(token.last_used_at)}</span
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
                                                    (t) => t.id !== token.id,
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

        <!-- Appearance -->
        <section id="appearance" data-section="appearance" class="scroll-mt-20">
            <h2 class="text-lg font-bold text-primary mb-1">
                {LL.settings.section.appearance()}
            </h2>
            <p class="text-sm text-tertiary mb-6">
                {LL.settings.section.appearanceDesc()}
            </p>

            <div
                class="rounded-xl border border-border bg-card/50 p-5 space-y-4"
            >
                <div>
                    <span class="block text-xs font-medium text-tertiary mb-3"
                        >{LL.settings.label.theme()}</span
                    >
                    <div class="flex gap-2">
                        {#each theme.themes as name, i (i)}
                            {@const Icon = icons[name as keyof typeof icons]}
                            <button
                                class="
                                flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border transition-colors {theme.theme ===
                                name
                                    ? 'bg-active/80 text-tertiary'
                                    : 'text-tertiary'}
                                "
                                onclick={() => (theme.theme = name)}
                            >
                                <Icon size={16} />
                                <span class="text-sm">{capitalize(name)}</span>
                            </button>
                        {/each}
                    </div>
                </div>
                <div>
                    <span class="block text-xs font-medium text-tertiary mb-3"
                        >{LL.settings.label.palette()}</span
                    >
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {#each paletteOptions as opt (opt.name)}
                            <button
                                type="button"
                                onclick={() => setPalette(opt.name)}
                                class="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors text-left
                                    {paletteState.current === opt.name
                                    ? 'border-border-active bg-active'
                                    : 'border-border hover:border-border-hover'}"
                            >
                                <span class="flex -space-x-1 shrink-0">
                                    {#each opt.swatch as color}
                                        <span
                                            class="size-3.5 rounded-full border border-black/10"
                                            style="background: {color}"
                                        ></span>
                                    {/each}
                                </span>
                                <span class="text-sm text-secondary capitalize"
                                    >{opt.name}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </section>

        <!-- Account -->
        <!--
        <section id="account" data-section="account" class="scroll-mt-20">
            <h2 class="text-lg font-bold text-primary mb-1">Account</h2>
            <p class="text-sm text-tertiary mb-6">
                Configuración general de tu cuenta.
            </p>

            <div
                class="rounded-xl border border-border bg-card/50 p-5 space-y-4"
            >
                <div>
                    <label
                        for="email"
                        class="block text-xs font-medium text-tertiary mb-1.5"
                        >Correo electrónico</label
                    >
                    <div class="flex items-center gap-2">
                        <div class="relative flex-1">
                            <MailIcon
                                size={14}
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
                            />
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value=""
                                class="w-full bg-input border border-border text-primary placeholder-tertiary rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors"
                                disabled
                            />
                        </div>
                    </div>
                    <p class="text-xs text-tertiary mt-1.5">{LL.settings.badge.comingSoon()}</p>
                </div>
                <hr class="border-border" />
                <div>
                    <p class="text-sm text-secondary mb-1">Eliminar cuenta</p>
                    <p class="text-xs text-tertiary mb-3">
                        Esta acción no se puede deshacer. Todos tus datos serán
                        eliminados.
                    </p>
                    <button
                        class="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-950/50 transition-colors cursor-not-allowed"
                        disabled
                    >
                        <Trash2Icon size={14} />
                        Eliminar cuenta
                    </button>
                    <p class="text-xs text-tertiary mt-1.5">{LL.settings.badge.comingSoon()}</p>
                </div>
            </div>
        </section>
        -->
    </div>

    {#if isDirty || saved}
        <ConfirmChanges
            {saved}
            isDesktop={isDesktop.current}
            onDiscard={discardChanges}
            formId="settings-form"
        />
    {/if}
</div>
