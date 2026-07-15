<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";
    import Input from "$lib/components/Input.svelte";
    import { addToast } from "$lib/stores/toast.svelte";
    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());
    let { form }: PageProps = $props();
</script>

<svelte:head>
    <title>{LL.register.meta.title()}</title>
</svelte:head>

<div class="min-h-screen bg-surface flex items-center justify-center -mt-18">
    <div class="w-full max-w-sm">
        <div class="mb-10 text-center">
            <span class="text-2xl font-bold tracking-tight text-primary"
                >{LL.register.brand()}</span
            >
            <p class="mt-2 text-sm text-tertiary">
                {LL.register.subtitle()}
            </p>
        </div>

        <form
            method="POST"
            use:enhance={() =>
                async ({ result, update }) => {
                    if (result.type === "failure") {
                        const data = result.data as
                            | { message?: string }
                            | undefined;
                        addToast(
                            data?.message ?? LL.register.error.fallback(),
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
                label={LL.register.label.username()}
                sublabel={LL.register.sublabel.username()}
                type="text"
                value={form?.username ?? ""}
                required
                minlength={2}
                autocomplete="username"
                placeholder={LL.register.placeholder.username()}
            />

            <Input
                id="display_name"
                label={LL.register.label.displayName()}
                sublabel={LL.register.sublabel.displayName()}
                type="text"
                value={form?.display_name ?? ""}
                autocomplete="name"
                placeholder={LL.register.placeholder.displayName()}
            />

            <Input
                id="email"
                label={LL.register.label.email()}
                type="email"
                value={form?.email ?? ""}
                required
                autocomplete="email"
                placeholder={LL.register.placeholder.email()}
            />

            <Input
                id="password"
                label={LL.register.label.password()}
                sublabel={LL.register.sublabel.password()}
                type="password"
                required
                minlength={8}
                autocomplete="new-password"
                placeholder={LL.register.placeholder.password()}
            />

            <button
                type="submit"
                class="w-full bg-accent text-accent-text font-medium text-sm rounded-lg py-2.5 hover:opacity-90 transition-colors mt-2"
            >
                {LL.register.submit()}
            </button>
        </form>

        <p class="mt-6 text-center text-xs text-tertiary">
            {LL.register.prompt()}
            <a
                href="/login"
                class="text-quaternary hover:text-primary transition-colors ml-1"
            >
                {LL.register.loginLink()}
            </a>
        </p>
    </div>
</div>
