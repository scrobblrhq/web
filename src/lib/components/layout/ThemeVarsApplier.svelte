<script lang="ts">
    import { onMount } from "svelte";
    import { useTheme } from "svelte-themes";
    import { paletteState, initPalette } from "#lib/stores/palette.svelte";
    import { PALETTES } from "#lib/theme/palettes";
    import { generatePaletteVars, PALETTE_VAR_NAMES } from "#lib/theme/generate";

    const theme = useTheme();

    onMount(() => {
        initPalette();
    });

    $effect(() => {
        const name = paletteState.current;
        const mode = theme.resolvedTheme === "dark" ? "dark" : "light";
        const root = document.documentElement;

        if (name === "default") {
            for (const key of PALETTE_VAR_NAMES) {
                root.style.removeProperty(`--color-${key}`);
            }
            return;
        }

        const vars = generatePaletteVars(PALETTES[name], mode);
        for (const key of PALETTE_VAR_NAMES) {
            root.style.setProperty(`--color-${key}`, vars[key]);
        }
    });
</script>
