<script lang="ts">
    import { getLL, getLocale } from "$lib/i18n.svelte";
    import type { ActivityDay } from "$lib/api/types";
    // import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { useTheme } from "svelte-themes";
    import { paletteState } from "$lib/stores/palette.svelte";
    import { PALETTES } from "$lib/theme/palettes";
    import { generateHeatmapScale } from "$lib/theme/generate";

    interface Props {
        data: ActivityDay[];
    }

    const { data }: Props = $props();

    let LL = $derived(getLL());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // svelte-ignore state_referenced_locally
    const countMap = new Map(
        data.map((d) => [d.day.slice(0, 10), d.scrobble_count]),
    );

    const days: { date: Date; count: number }[] = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({ date: d, count: countMap.get(key) ?? 0 });
    }

    const firstDay = days[0].date;
    const startOffset = firstDay.getDay(); // 0 = sunday
    const paddedDays = [...Array(startOffset).fill(null), ...days];
    const weeks: ({ date: Date; count: number } | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
        weeks.push(paddedDays.slice(i, i + 7));
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1);

    function colorLevel(count: number): number {
        if (count === 0) return 0;
        const ratio = count / maxCount;
        if (ratio < 0.25) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 0.75) return 3;
        return 4;
    }

    const { resolvedTheme } = useTheme();
    let colors: string[] = $derived.by(() => {
        const mode = resolvedTheme === "dark" ? "dark" : "light";
        const palette = paletteState.current;
        if (palette === "default") {
            return mode === "dark"
                ? ["#051a0d", "#004d00", "#007300", "#26a100", "#4ade80"]
                : ["#f0faf0", "#dcfce7", "#86efac", "#4ade80", "#16a34a"];
        }
        return generateHeatmapScale(PALETTES[palette], mode);
    });

    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
        const firstReal = week.find((d) => d !== null);
        if (firstReal) {
            const m = firstReal.date.getMonth();
            if (m !== lastMonth) {
                monthLabels.push({
                    label: firstReal.date.toLocaleDateString(getLocale() === "es" ? "es-MX" : "en-US", {
                        month: "short",
                    }),
                    col,
                });
                lastMonth = m;
            }
        }
    });

    const CELL = 11;
    const OFFSET_TOP = 18;
    const OFFSET_LEFT = 24;
    const DAY_LABELS = $derived(["", LL.heatmap.dayLabels.mon(), "", LL.heatmap.dayLabels.wed(), "", LL.heatmap.dayLabels.fri(), ""]);

    const svgWidth = OFFSET_LEFT + weeks.length * CELL;
    const svgHeight = OFFSET_TOP + 7 * CELL;

    // Tooltip
    let heatmapRoot: HTMLDivElement;
    let tooltip = $state<{ text: string; x: number; y: number } | null>(null);

    function showTooltip(e: MouseEvent, day: { date: Date; count: number }) {
        // Position relative to this component so ancestor backdrop filters cannot
        // shift a fixed, viewport-positioned tooltip away from the hovered cell.
        const cell = (e.currentTarget as SVGRectElement).getBoundingClientRect();
        const root = heatmapRoot.getBoundingClientRect();
        const x = Math.max(0, Math.min(cell.left - root.left, root.width - 240));
        const y = cell.bottom - root.top + 6;

        const formatted = day.date.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        const label = LL.heatmap.tooltip.format({ count: day.count, label: day.count === 1 ? LL.heatmap.tooltip.singular() : LL.heatmap.tooltip.plural(), date: formatted });
        tooltip = { text: label, x, y };
    }

    const totalScrobbles = days.reduce((sum, d) => sum + d.count, 0);
    const activeDays = days.filter((d) => d.count > 0).length;
</script>

<div bind:this={heatmapRoot} class="relative space-y-2">
    <div class="flex items-center justify-between">
        <h2
            class="text-xs font-semibold uppercase tracking-widest text-tertiary"
        >
            {LL.heatmap.title()}
        </h2>
        <p class="text-xs text-quaternary">
            {LL.heatmap.summary({ totalScrobbles, activeDays })}
        </p>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="relative w-full overflow-x-auto z-10"
        onmouseleave={() => (tooltip = null)}
    >
        <svg width={svgWidth} height={svgHeight} class="block">
            <!-- Month labels -->
            {#each monthLabels as { label, col }}
                <text
                    x={OFFSET_LEFT + col * CELL}
                    y={OFFSET_TOP - 6}
                    font-size="9"
                    fill="#52525b"
                    font-family="system-ui, sans-serif"
                >
                    {label}
                </text>
            {/each}

            <!-- Week day labels -->
            {#each DAY_LABELS as label, row}
                {#if label}
                    <text
                        x={OFFSET_LEFT - 4}
                        y={OFFSET_TOP + row * CELL + 8}
                        font-size="9"
                        fill="#52525b"
                        text-anchor="end"
                        font-family="system-ui, sans-serif"
                    >
                        {label}
                    </text>
                {/if}
            {/each}

            <!-- Cells -->
            {#each weeks as week, col}
                {#each week as day, row}
                    {#if day}
                        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
                        <rect
                            x={OFFSET_LEFT + col * CELL}
                            y={OFFSET_TOP + row * CELL}
                            width={CELL - 2}
                            height={CELL - 2}
                            rx="2"
                            fill={colors[colorLevel(day.count)]}
                            onmouseover={(e) => showTooltip(e, day)}
                        />
                    {:else}
                        <rect
                            x={OFFSET_LEFT + col * CELL}
                            y={OFFSET_TOP + row * CELL}
                            width={CELL - 2}
                            height={CELL - 2}
                            rx="2"
                            fill="transparent"
                        />
                    {/if}
                {/each}
            {/each}
        </svg>

    </div>

    {#if tooltip}
        <div
            role="tooltip"
            class="pointer-events-none absolute z-50 max-w-60 rounded-md border border-border/70 bg-card px-2.5 py-1.5 text-xs text-primary shadow-lg"
            style:left="{tooltip.x}px"
            style:top="{tooltip.y}px"
        >
            {tooltip.text}
        </div>
    {/if}

    <!-- Legend -->
    <div class="flex items-center gap-1.5 justify-end">
        <span class="text-[10px] text-quaternary">{LL.heatmap.legendLess()}</span>
        {#each colors as color, i (i)}
            <rect style="display:none" />
            <svg width="10" height="10">
                <rect width="10" height="10" rx="2" fill={color} />
            </svg>
        {/each}
        <span class="text-[10px] text-quaternary">{LL.heatmap.legendMore()}</span>
    </div>
</div>
