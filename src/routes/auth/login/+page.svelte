<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";
    import { addToast } from "$lib/stores/toast.svelte";
    import { page } from "$app/state";
    import { fade, fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    import Input from "$lib/components/ui/Input.svelte";
    import { getLL, getLocale } from "$lib/i18n.svelte";
    import { featureCopy } from "$lib/i18n/features";
    import { formatDate } from "$lib/utils/format";
    import Loader from "@lucide/svelte/icons/loader-circle";
    import LogIn from "@lucide/svelte/icons/log-in";
    import UserPlus from "@lucide/svelte/icons/user-plus";

    let LL = $derived(getLL());
    const accountCopy = $derived(featureCopy(getLocale()).account);
    let { form }: PageProps = $props();

    let mode = $state<"login" | "register">("login");
    let pressed = $state(false);
    let shake = $state(false);

    let t = $derived(LL[mode]);
    let isRegister = $derived(mode === "register");

    function switchMode(next: "login" | "register") {
        if (mode === next) return;
        mode = next;
        pressed = false;
    }

    function triggerShake() {
        shake = false;
        requestAnimationFrame(() => (shake = true));
        setTimeout(() => (shake = false), 400);
    }

    function handleSubmit(event: SubmitEvent) {
        const form = event.currentTarget as HTMLFormElement;
        const email = form.elements.namedItem("email") as HTMLInputElement | null;
        const emailConfirm = form.elements.namedItem(
            "email_confirm",
        ) as HTMLInputElement | null;

        if (isRegister && email && emailConfirm) {
            emailConfirm.setCustomValidity(
                email.value !== emailConfirm.value
                    ? LL.register.error.emailMismatch()
                    : "",
            );
        }

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            pressed = false;
            return;
        }

        pressed = true;
    }
</script>

<svelte:head>
    <meta name="robots" content="noindex, nofollow" />
    <title
        >{isRegister ? LL.register.meta.title() : LL.login.meta.title()}</title
    >
</svelte:head>

<div
    class="relative min-h-screen isolate flex items-center justify-center overflow-hidden {isRegister
        ? '-mt-14'
        : '-mt-18'}"
>
    <div
        class="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
    ></div>
    <div
        class="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
    ></div>
    <div
        class="pointer-events-none absolute inset-0 bg-linear-to-b from-accent/10 to-surface transition-opacity duration-700 ease-in-out"
        style:opacity={isRegister ? 1 : 0}
        aria-hidden="true"
    ></div>

    <div
        class="relative z-10 w-full max-w-sm bg-card/40 backdrop-blur-xl border border-primary/10 p-16 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        class:shake
        in:fly={{ duration: 400, easing: cubicOut }}
    >
        <div class="mb-8 text-center">
            <span class="text-2xl font-bold tracking-tight text-primary">
                {t.brand()}
            </span>
            {#key mode}
                <p
                    class="mt-2 text-sm text-tertiary"
                    in:fade={{ duration: 200, delay: 100 }}
                    out:fade={{ duration: 100 }}
                >
                    {t.subtitle()}
                </p>
            {/key}
        </div>

        {#if page.url.searchParams.get("deleted") === "1"}
            <p class="mb-6 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-secondary" role="status">
                {accountCopy.deleteScheduled.replace(
                        "{date}",
                        page.url.searchParams.get("until")
                            ? formatDate(page.url.searchParams.get("until")!)
                            : "",
                    )}
            </p>
        {/if}

        <div
            class="relative grid grid-cols-2 gap-1 p-1 mb-8 rounded-lg bg-surface/60 shadow-inner"
        >
            <div
                class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-card shadow-sm ring-1 ring-black/5 transition-transform duration-300 ease-out"
                style:transform={isRegister
                    ? "translateX(calc(100% + 0.25rem))"
                    : "translateX(0)"}
            ></div>

            <button
                type="button"
                onclick={() => switchMode("login")}
                class="relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 {mode ===
                'login'
                    ? 'text-primary'
                    : 'text-tertiary hover:text-primary'}"
            >
                <LogIn class="w-3.5 h-3.5" />
                {LL.login.submit()}
            </button>
            <button
                type="button"
                onclick={() => switchMode("register")}
                class="relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 {mode ===
                'register'
                    ? 'text-primary'
                    : 'text-tertiary hover:text-primary'}"
            >
                <UserPlus class="w-3.5 h-3.5" />
                {LL.register.submit()}
            </button>
        </div>

        <form
            method="POST"
            action={isRegister ? "?/register" : "?/login"}
            onsubmit={handleSubmit}
            use:enhance={() =>
                async ({ result, update }) => {
                    if (result.type === "failure") {
                        pressed = false;
                        triggerShake();
                        const data = result.data as
                            | { message?: string }
                            | undefined;
                        addToast(data?.message ?? t.error.fallback(), "error");
                    } else {
                        update();
                    }
                }}
            class="space-y-4 [&>.register-fields]:mt-0 [&>.register-fields.open]:mt-4"
        >
            <input type="hidden" name="redirectTo" value={page.url.searchParams.get("redirectTo") ?? ""} />
            <Input
                id="username"
                label={t.label.username()}
                sublabel={isRegister
                    ? LL.register.sublabel.username()
                    : undefined}
                type="text"
                value={form?.username ?? ""}
                required
                minlength={isRegister ? 2 : undefined}
                maxlength={isRegister ? 32 : undefined}
                pattern={isRegister ? "[a-zA-Z0-9_-]+" : undefined}
                title={isRegister
                    ? LL.register.error.usernameInvalidChars()
                    : undefined}
                autocomplete="username"
                placeholder={t.placeholder.username()}
            />

            {#if isRegister}
                <div class="register-fields" class:open={isRegister}>
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
                    id="email_confirm"
                    label={LL.register.label.emailConfirm()}
                    type="email"
                    required
                    autocomplete="email"
                    placeholder={LL.register.placeholder.emailConfirm()}
                />
            </div>
            {/if}

            <Input
                id="password"
                label={t.label.password()}
                sublabel={isRegister
                    ? LL.register.sublabel.password()
                    : undefined}
                type="password"
                required
                minlength={isRegister ? 8 : undefined}
                maxlength={isRegister ? 128 : undefined}
                pattern={isRegister ? "[^\\u0000-\\u001F\\u007F]*" : undefined}
                title={isRegister
                    ? LL.register.error.passwordInvalidChars()
                    : undefined}
                autocomplete={isRegister ? "new-password" : "current-password"}
                placeholder={t.placeholder.password()}
            />

            <button
                type="submit"
                class="w-full bg-accent text-accent-text font-medium text-sm rounded-lg py-2.5 mt-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={pressed}
            >
                {#if pressed}
                    <span class="flex items-center justify-center gap-2">
                        <Loader class="w-4 h-4 animate-spin" />
                    </span>
                {:else}
                    {#key mode}
                        <span in:fade={{ duration: 150 }}>{t.submit()}</span>
                    {/key}
                {/if}
            </button>
        </form>

        <p class="mt-6 text-center text-xs text-tertiary">
            {isRegister ? LL.register.prompt() : LL.login.prompt()}
            <button
                type="button"
                onclick={() => switchMode(isRegister ? "login" : "register")}
                class="text-quaternary hover:text-primary transition-colors ml-1 underline-offset-2 hover:underline"
            >
                {isRegister ? LL.register.loginLink() : LL.login.signupLink()}
            </button>
        </p>
    </div>
</div>

<style>
    .register-fields {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
            grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1),
            opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .register-fields > :global(*) {
        overflow: hidden;
    }

    .register-fields.open {
        grid-template-rows: 1fr;
        opacity: 1;
    }

    @keyframes shake {
        10%,
        90% {
            transform: translateX(-1px);
        }
        20%,
        80% {
            transform: translateX(2px);
        }
        30%,
        50%,
        70% {
            transform: translateX(-4px);
        }
        40%,
        60% {
            transform: translateX(4px);
        }
    }

    .shake {
        animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @media (prefers-reduced-motion: reduce) {
        .shake {
            animation: none;
        }
        .register-fields {
            transition: none;
        }
    }
</style>
