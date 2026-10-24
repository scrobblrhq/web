<script lang="ts">
    interface Props {
        checked: boolean;
        onchange: (checked: boolean) => void;
        id?: string;
        name?: string;
        label?: string;
        disabled?: boolean;
    }

    import { getLL } from "$lib/i18n.svelte";

    let LL = $derived(getLL());

    let {
        checked,
        onchange,
        id,
        name,
        label = LL.toggle.defaultLabel(),
        disabled = false,
    }: Props = $props();
</script>

<button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {id}
    {disabled}
    onclick={() => onchange(!checked)}
    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200
        {checked ? 'bg-accent' : 'bg-border'}
        {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
>
    <span
        class="inline-block size-3.5 rounded-full bg-white transition-transform duration-200
            {checked ? 'translate-x-4.5' : 'translate-x-0.75'}"
    ></span>
</button>
{#if name}
    <input type="hidden" {name} value={String(checked)} />
{/if}
