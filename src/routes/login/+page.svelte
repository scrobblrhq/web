<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";
    import Input from "$lib/components/Input.svelte";
    import { addToast } from "$lib/stores/toast.svelte";
    import { getLL } from "$lib/i18n.svelte";
    import Loader from "@lucide/svelte/icons/loader-circle";

    let LL = $derived(getLL());
    let { form }: PageProps = $props();

    let pressed = $state(false);
</script>

<svelte:head>
    <title>{LL.login.meta.title()}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center -mt-18">
    <div class="w-full max-w-sm bg-card/40 p-16 rounded-xl">
        <div class="mb-10 text-center">
            <span class="text-2xl font-bold tracking-tight">{LL.login.brand()}</span>
            <p class="mt-2 text-sm text-tertiary">
                {LL.login.subtitle()}
            </p>
        </div>

        <form
            method="POST"
            onsubmit={() => (pressed = true)}
            use:enhance={() =>
                async ({ result, update }) => {
                    if (result.type === "failure") {
                        pressed = false;
                        const data = result.data as
                            | { message?: string }
                            | undefined;
                        addToast(
                            data?.message ?? LL.login.error.fallback(),
                            "error",
                        );
                    } else {
                        update();
                    }
                }}
            class="space-y-4"
        >
            <Input
                id="username"
                label={LL.login.label.username()}
                type="text"
                value={form?.username ?? ""}
                required
                autocomplete="username"
                placeholder={LL.login.placeholder.username()}
            />

            <Input
                id="password"
                label={LL.login.label.password()}
                type="password"
                required
                autocomplete="current-password"
                placeholder={LL.login.placeholder.password()}
            />

            <button
                type="submit"
                class="w-full bg-accent text-accent-text font-medium text-sm rounded-lg py-2.5 hover:opacity-90 transition-colors mt-2"
            >
            {#if pressed}
                    <span class="flex items-center justify-center gap-2">
                        <Loader class="w-4 h-4 animate-spin" />
                    </span>
                {:else}
                    {LL.login.submit()}
                {/if}
            </button>
        </form>

        <p class="mt-6 text-center text-xs text-tertiary">
            {LL.login.prompt()}
            <a
                href="/register"
                class="text-quaternary hover:text-primary transition-colors ml-1"
            >
                {LL.login.signupLink()}
            </a>
        </p>
    </div>
</div>
