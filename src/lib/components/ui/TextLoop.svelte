<script lang="ts">
    import { gsap } from "gsap";

    const VIEW_W = 1200;
    const CX = VIEW_W / 2;
    const EDGE_PAD = 6;

    type Shape = "wave" | "circle" | "infinity" | "arch" | "line";
    type Direction = "forward" | "reverse";
    type WrapperStyle = string | Record<string, string | number>;

    interface Props {
        text?: string;
        shape?: Shape;
        path?: string;
        speed?: number;
        direction?: Direction;
        separator?: string;
        curviness?: number;
        fontSize?: number;
        fontWeight?: number;
        letterSpacing?: number;
        uppercase?: boolean;
        color?: string;
        ribbon?: boolean;
        ribbonColor?: string;
        ribbonWidth?: number;
        viewHeight?: number;
        minWidth?: number;
        pauseOnHover?: boolean;
        class?: string;
        className?: string;
        style?: WrapperStyle;
        id?: string;
    }

    let {
        text = "React ✦ Bits",
        shape = "wave",
        path,
        speed = 90,
        direction = "forward",
        separator = "✦",
        curviness = 90,
        fontSize = 46,
        fontWeight = 800,
        letterSpacing = 2,
        uppercase = true,
        color = "#ffffff",
        ribbon = true,
        ribbonColor = "#5227FF",
        ribbonWidth = 86,
        viewHeight = 140,
        minWidth = 900,
        pauseOnHover = true,
        class: className = "",
        className: legacyClassName = "",
        style = "",
        id,
    }: Props = $props();

    let rootRef = $state<HTMLElement>();
    let pathRef = $state<SVGPathElement>();
    let measureRef = $state<SVGTextElement>();
    let headRef = $state<SVGTextPathElement>();
    let tailRef = $state<SVGTextPathElement>();
    let generatedId = $state("text-loop-path");
    let pathId = $derived(id ?? generatedId);
    let metrics = $state({ length: 0, reps: 1 });

    let curve = $derived(path ?? buildPath(shape, curviness, ribbonWidth, viewHeight / 2));
    let unit = $derived(
        `${uppercase ? text.toUpperCase() : text}${separator ? `\u00a0${separator}\u00a0` : "\u00a0\u00a0\u00a0"}`,
    );
    let textStyle = $derived(
        `font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${letterSpacing}px;`,
    );
    let loopText = $derived(unit.repeat(metrics.reps));
    let fitLength = $derived(metrics.length || undefined);
    let classes = $derived(["text-loop", className, legacyClassName].filter(Boolean).join(" "));
    let wrapperStyle = $derived(styleValue(style));

    function buildPath(shape: Shape, curviness: number, ribbonWidth: number, CY: number) {
        const c = Math.max(0, curviness);
        const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

        switch (shape) {
            case "circle": {
                const radius = Math.min(90 + c * 0.95, room);
                return `M ${CX - radius} ${CY} A ${radius} ${radius} 0 1 1 ${CX + radius} ${CY} A ${radius} ${radius} 0 1 1 ${CX - radius} ${CY} Z`;
            }
            case "infinity": {
                const radius = 150 + c * 1.4;
                const height = Math.min(60 + c * 0.95, room);
                return [
                    `M ${CX} ${CY}`,
                    `C ${CX + radius * 0.55} ${CY - height} ${CX + radius} ${CY - height} ${CX + radius} ${CY}`,
                    `C ${CX + radius} ${CY + height} ${CX + radius * 0.55} ${CY + height} ${CX} ${CY}`,
                    `C ${CX - radius * 0.55} ${CY - height} ${CX - radius} ${CY - height} ${CX - radius} ${CY}`,
                    `C ${CX - radius} ${CY + height} ${CX - radius * 0.55} ${CY + height} ${CX} ${CY}`,
                    "Z",
                ].join(" ");
            }
            case "arch": {
                const rise = Math.min(120 + c * 1.1, room * 2);
                return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
            }
            case "line":
                return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`;
            case "wave":
            default: {
                const amplitude = Math.min(c * 2.2, room * 2);
                return `M -320 ${CY} Q -160 ${CY - amplitude} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`;
            }
        }
    }

    function styleValue(value: WrapperStyle) {
        if (typeof value === "string") return value;
        return Object.entries(value)
            .map(([property, propertyValue]) => `${property}: ${propertyValue};`)
            .join(" ");
    }

    $effect(() => {
        if (!id && generatedId === "text-loop-path") {
            generatedId = `text-loop-${Math.random().toString(36).slice(2, 10)}`;
        }
    });

    $effect(() => {
        curve;
        unit;
        fontSize;
        fontWeight;
        letterSpacing;

        const currentPath = pathRef;
        const measureText = measureRef;
        if (!currentPath || !measureText) return;

        let cancelled = false;
        const measure = () => {
            if (cancelled) return;
            try {
                const length = currentPath.getTotalLength();
                const unitWidth = measureText.getComputedTextLength();
                if (!length) return;
                const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
                if (metrics.length !== length || metrics.reps !== reps) metrics = { length, reps };
            } catch {
                // SVG measurement is unavailable until the element is attached.
            }
        };

        measure();
        document.fonts?.ready.then(measure).catch(() => undefined);
        return () => {
            cancelled = true;
        };
    });

    $effect(() => {
        const length = metrics.length;
        const head = headRef;
        const tail = tailRef;
        if (!head || !tail || !length) return;

        const applyOffset = (offset: number) => {
            const partner = offset >= 0 ? offset - length : offset + length;
            head.setAttribute("startOffset", String(offset));
            tail.setAttribute("startOffset", String(partner));
        };

        applyOffset(0);
        if (speed <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const state = { offset: 0 };
        const tween = gsap.to(state, {
            offset: direction === "reverse" ? -length : length,
            duration: length / speed,
            ease: "none",
            repeat: -1,
            onUpdate: () => applyOffset(state.offset),
        });

        const root = rootRef;
        const pause = () => tween.pause();
        const resume = () => tween.resume();
        if (pauseOnHover && root) {
            root.addEventListener("pointerenter", pause);
            root.addEventListener("pointerleave", resume);
        }

        return () => {
            tween.kill();
            if (pauseOnHover && root) {
                root.removeEventListener("pointerenter", pause);
                root.removeEventListener("pointerleave", resume);
            }
        };
    });
</script>

<div bind:this={rootRef} class={classes} style={wrapperStyle}>
    <svg
        class="text-loop-svg"
        style:min-width={`${minWidth}px`}
        viewBox={`0 0 ${VIEW_W} ${viewHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={text}
    >
        <path
            bind:this={pathRef}
            id={pathId}
            d={curve}
            fill="none"
            style:stroke={ribbon ? ribbonColor : "none"}
            stroke-width={ribbon ? ribbonWidth : 0}
            stroke-linecap="round"
            stroke-linejoin="round"
        />

        <text bind:this={measureRef} class="text-loop-measure" style={textStyle} aria-hidden="true">
            {unit}
        </text>

        <text class="text-loop-text" style={`${textStyle} fill: ${color};`} dominant-baseline="central" aria-hidden="true" textLength={fitLength} lengthAdjust="spacing">
            <textPath bind:this={headRef} href={`#${pathId}`} startOffset="0">{loopText}</textPath>
        </text>

        <text class="text-loop-text" style={`${textStyle} fill: ${color};`} dominant-baseline="central" aria-hidden="true" textLength={fitLength} lengthAdjust="spacing">
            <textPath bind:this={tailRef} href={`#${pathId}`} startOffset="0">{loopText}</textPath>
        </text>
    </svg>
</div>

<style>
    .text-loop {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .text-loop-svg {
        display: block;
        width: 100%;
        height: auto;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
    }

    .text-loop-text {
        user-select: none;
    }

    .text-loop-measure {
        visibility: hidden;
        pointer-events: none;
    }
</style>