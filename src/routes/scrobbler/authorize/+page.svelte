<script lang="ts">
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "$app/forms";
    import type { PageProps } from "./$types";
    import { getLL } from "$lib/i18n.svelte";
    import { addToast } from "$lib/stores/toast.svelte";
    import Loader from "@lucide/svelte/icons/loader-circle";

    let { data, form }: PageProps = $props();
    let LL = $derived(getLL());
    let busy = $state(false);

    const approved = $derived(form?.approved === true);
    const username = $derived(data.user?.username ?? "");
    const canApprove = $derived(
        data.flow === "callback" || (data.flow === "token" && data.status === "pending"),
    );

    const submit: SubmitFunction = () => {
        busy = true;
        return async ({ result, update }) => {
            if (result.type === "redirect") {
                window.location.href = result.location;
                return;
            }
            busy = false;
            if (result.type === "failure") {
                addToast(
                    (result.data?.message as string | undefined) ??
                        LL.scrobbler.error.approveFailed(),
                    "error",
                );
            } else {
                await update({ reset: false });
            }
        };
    };
</script>

<svelte:head>
    <meta name="robots" content="noindex, nofollow" />
    <title>{LL.scrobbler.authorize.title()}</title>
</svelte:head>

<main class="mx-auto w-full max-w-md px-4 py-16">
    <div class="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-6 sm:p-8 space-y-6">
        <h1 class="text-2xl font-semibold tracking-tight text-primary">
            {LL.scrobbler.authorize.title()}
        </h1>
        <p class="text-sm text-secondary">{LL.scrobbler.authorize.intro({ username })}</p>

        <dl class="rounded-xl border border-border/70 divide-y divide-border/60 text-sm">
            <div class="flex justify-between gap-4 px-4 py-3">
                <dt class="text-tertiary">{LL.scrobbler.authorize.appLabel()}</dt>
                <dd class="font-mono text-primary break-all text-right">{data.apiKey}</dd>
            </div>
            <div class="flex justify-between gap-4 px-4 py-3">
                <dt class="text-tertiary">{LL.scrobbler.authorize.accountLabel()}</dt>
                <dd class="text-primary">@{username}</dd>
            </div>
            {#if data.flow === "callback"}
                <div class="flex justify-between gap-4 px-4 py-3">
                    <dt class="text-tertiary">{LL.scrobbler.authorize.destinationLabel()}</dt>
                    <dd class="font-mono text-primary break-all text-right">{data.callbackHost}</dd>
                </div>
            {/if}
        </dl>

        {#if approved}
            <p class="text-sm text-primary" role="status">{LL.scrobbler.authorize.approved()}</p>
        {:else if data.flow === "token" && data.status === "approved"}
            <p class="text-sm text-secondary">{LL.scrobbler.authorize.alreadyApproved()}</p>
        {:else if data.flow === "token" && data.status === "expired"}
            <p class="text-sm text-secondary">{LL.scrobbler.authorize.expired()}</p>
        {:else if canApprove}
            <p class="text-sm text-secondary">
                {data.flow === "callback"
                    ? LL.scrobbler.authorize.nextCallback({ host: data.callbackHost })
                    : LL.scrobbler.authorize.nextToken()}
            </p>

            <form
                method="POST"
                action={data.flow === "callback" ? "?/approveCallback" : "?/approveToken"}
                use:enhance={submit}
                class="flex items-center justify-end gap-2"
            >
                {#if data.flow === "callback"}
                    <input type="hidden" name="api_key" value={data.apiKey} />
                    <input type="hidden" name="callback" value={data.callback} />
                {:else}
                    <input type="hidden" name="token" value={data.token} />
                {/if}
                <a href="/" class="text-sm px-3 py-2 text-tertiary hover:text-primary transition-colors">
                    {LL.scrobbler.authorize.cancel()}
                </a>
                <button
                    type="submit"
                    disabled={busy}
                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-inverse text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-40"
                >
                    {#if busy}<Loader class="size-4 animate-spin" />{/if}
                    {busy ? LL.scrobbler.authorize.approving() : LL.scrobbler.authorize.approve()}
                </button>
            </form>
        {/if}
    </div>
</main>
