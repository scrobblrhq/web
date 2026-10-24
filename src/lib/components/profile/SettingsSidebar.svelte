<script lang="ts">
    import { getLL, getLocale } from "#lib/i18n.svelte";
    import UserIcon from "@lucide/svelte/icons/user";
    import KeyIcon from "@lucide/svelte/icons/key";
    import PaletteIcon from "@lucide/svelte/icons/palette";
    import ShieldIcon from "@lucide/svelte/icons/shield";
    import MenuIcon from "@lucide/svelte/icons/menu";
    import ConnectionsIcon from "@lucide/svelte/icons/link";
    import XIcon from "@lucide/svelte/icons/x";
    import LogOutIcon from "@lucide/svelte/icons/log-out";
    import { slide } from "svelte/transition";
    import { replaceState } from "$app/navigation";
    import { page } from "$app/state";

    interface Props {
        active: string;
        username: string;
    }

    let { active, username }: Props = $props();

    let LL = $derived(getLL());
    let open = $state(false);

    const sections = [
        { id: "profile", label: () => LL.settingsSidebar.profile(), icon: UserIcon },
        { id: "connections", label: () => LL.settingsSidebar.connections(), icon: ConnectionsIcon },
        { id: "privacy", label: () => LL.settingsSidebar.privacy(), icon: ShieldIcon },
        { id: "tokens", label: () => LL.settingsSidebar.apiTokens(), icon: KeyIcon },
        { id: "appearance", label: () => LL.settingsSidebar.appearance(), icon: PaletteIcon },
        { id: "sessions", label: () => LL.settingsSidebar.sessions(), icon: LogOutIcon },
        { id: "account-data", label: () => getLocale() === "es" ? "Datos" : "Data", icon: UserIcon },
    ] as const;

    function scrollTo(id: string) {
        open = false;
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            replaceState(`#${id}`, page);
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) open = false;
    }
</script>

<!-- Mobile trigger -->
<button
    onclick={() => (open = true)}
    class="fixed bottom-4 right-4 z-40 size-12 flex items-center justify-center rounded-full bg-accent text-accent-text shadow-lg md:hidden"
    aria-label={LL.settingsSidebar.menuLabel()}
>
    <MenuIcon size={20} />
</button>

<!-- Mobile backdrop + drawer -->
{#if open}
    <div
        class="fixed inset-0 z-50 bg-black/60 md:hidden"
        role="presentation"
        onclick={handleBackdropClick}
    >
        <div
            class="absolute left-0 top-0 bottom-0 w-64 bg-surface/60 backdrop-blur-md border-r border-border p-4 overflow-y-auto"
            role="navigation"
            transition:slide={{ duration: 200, axis: "x" }}
        >
            <div class="flex items-center justify-between mb-6">
                <span class="text-sm font-semibold">{LL.settingsSidebar.title()}</span>
                <button
                    onclick={() => (open = false)}
                    class="text-tertiary hover:text-primary transition-colors"
                    aria-label={LL.settingsSidebar.close()}
                >
                    <XIcon size={18} />
                </button>
            </div>
            <nav class="space-y-1">
                {#each sections as { id, label, icon: Icon } (id)}
                    <button
                        onclick={() => scrollTo(id)}
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left border-l-2
                            {active === id
                            ? 'border-l-accent bg-active text-primary'
                            : 'border-l-transparent text-tertiary hover:text-primary hover:bg-hover'}"
                    >
                        <Icon size={16} class="shrink-0" />
                        {label()}
                    </button>
                {/each}
            </nav>
            <hr class="my-4 border-border" />
            <a
                href="/user/{username}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-tertiary hover:text-primary hover:bg-hover transition-colors"
            >
                <UserIcon size={16} class="shrink-0" />
                {LL.settingsSidebar.viewProfile()}
            </a>
        </div>
    </div>
{/if}

<!-- Desktop sidebar -->
<aside
    class="hidden md:block bg-card/60 backdrop-blur-md px-2 py-2.5 rounded-lg w-56 shrink-0 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/70"
>
    <span
        class="block text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary mb-4 px-3"
    >
        {LL.settingsSidebar.title()}
    </span>
    <nav class="space-y-1">
        {#each sections as { id, label, icon: Icon } (id)}
            <button
                onclick={() => scrollTo(id)}
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left border-l-2
                    {active === id
                    ? 'border-l-accent bg-active text-primary'
                    : 'border-l-transparent text-tertiary hover:text-primary hover:bg-hover'}"
            >
                <Icon size={16} class="shrink-0" />
                {label()}
            </button>
        {/each}
    </nav>
    <hr class="my-4 mx-3 border-border" />
    <a
        href="/user/{username}"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-tertiary hover:text-primary hover:bg-hover transition-colors"
    >
        <UserIcon size={16} class="shrink-0" />
        {LL.settingsSidebar.viewProfile()}
    </a>
</aside>
