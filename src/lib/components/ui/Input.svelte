<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends HTMLInputAttributes {
        id: string;
        label: string;
        sublabel?: string;
    }

    let { id, label, sublabel, class: className, ...rest }: Props = $props();
</script>

<div>
    <label for={id} class="block text-xs font-medium text-tertiary mb-1.5">
        {label}
        {#if sublabel}
            <span class="text-tertiary">({sublabel})</span>
        {/if}
    </label>
    <input
        {id}
        name={id}
        {...rest}
        class="w-full bg-card border border-border placeholder-tertiary
               rounded-lg px-3 py-2.5 text-sm text-primary outline-none
               focus:border-border-active focus:ring-1 focus:ring-border-active transition-colors {className ??
            ''}"
    />
</div>
