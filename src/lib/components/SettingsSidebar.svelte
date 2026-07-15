<script lang="ts">
    import { getLL } from "$lib/i18n.svelte";
    import UserIcon from "@lucide/svelte/icons/user";
    import KeyIcon from "@lucide/svelte/icons/key";
    import PaletteIcon from "@lucide/svelte/icons/palette";
    import ShieldIcon from "@lucide/svelte/icons/shield";
    import Settings2Icon from "@lucide/svelte/icons/settings-2";
    import MenuIcon from "@lucide/svelte/icons/menu";
    import XIcon from "@lucide/svelte/icons/x";
    import { slide } from "svelte/transition";
    import { replaceState } from "$app/navigation";
    import { page } from "$app/state";

    interface Props {
        active: string;
    }

    let { active }: Props = $props();

    let LL = $derived(getLL());
    let open = $state(false);

    const sections = [
        { id: "profile", label: () => LL.settingsSidebar.profile(), icon: UserIcon },
        { id: "privacy", label: () => LL.settingsSidebar.privacy(), icon: ShieldIcon },
        { id: "tokens", label: () => LL.settingsSidebar.apiTokens(), icon: KeyIcon },
        { id: "appearance", label: () => LL.settingsSidebar.appearance(), icon: PaletteIcon },
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
            class="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-border p-4 overflow-y-auto"
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
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                            {active === id
                            ? 'bg-active'
                            : 'text-tertiary hover:text-primary hover:bg-hover'}"
                    >
                        <Icon size={16} class="shrink-0" />
                        {label()}
                    </button>
                {/each}
            </nav>
            <hr class="my-4 border-border" />
            <a
                href="/user"
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
    class="hidden md:block w-56 shrink-0 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4"
>
    <span
        class="block text-xs font-semibold uppercase tracking-widest text-tertiary mb-4 px-3"
    >
        {LL.settingsSidebar.title()}
    </span>
    <nav class="space-y-1">
        {#each sections as { id, label, icon: Icon } (id)}
            <button
                onclick={() => scrollTo(id)}
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left
                    {active === id
                    ? 'bg-active'
                    : 'text-tertiary hover:text-primary hover:bg-hover'}"
            >
                <Icon size={16} class="shrink-0" />
                {label()}
            </button>
        {/each}
    </nav>
    <hr class="my-4 mx-3 border-border" />
    <a
        href="/user"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-tertiary hover:text-primary hover:bg-hover transition-colors"
    >
        <UserIcon size={16} class="shrink-0" />
        {LL.settingsSidebar.viewProfile()}
    </a>
</aside>
