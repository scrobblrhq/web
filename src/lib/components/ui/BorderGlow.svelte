<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        class?: string;
        edgeSensitivity?: number;
        glowColor?: string; // "H S L"
        backgroundColor?: string;
        borderRadius?: number;
        glowRadius?: number;
        glowIntensity?: number;
        coneSpread?: number;
        animated?: boolean;
        touchSweep?: boolean;
        colors?: string[];
        fillOpacity?: number;
    }

    let {
        children,
        class: className = "",
        edgeSensitivity = 30,
        glowColor = "40 80 80",
        backgroundColor = "var(--color-card, #120F17)",
        borderRadius = 28,
        glowRadius = 40,
        glowIntensity = 1.0,
        coneSpread = 25,
        animated = false,
        touchSweep = true,
        colors = ["#c084fc", "#f472b6", "#38bdf8"],
        fillOpacity = 0.5,
    }: Props = $props();

    let card = $state<HTMLDivElement>();
    let edge = $state(0); // 0–100
    let angle = $state(45); // grados
    let sweeping = $state(false);

    /* ---------- helpers de variables CSS ---------- */

    function parseHSL(str: string) {
        const m = str.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
        if (!m) return { h: 40, s: 80, l: 80 };
        return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
    }

    function buildGlowVars(color: string, intensity: number) {
        const { h, s, l } = parseHSL(color);
        const base = `${h}deg ${s}% ${l}%`;
        const opacities = [100, 60, 50, 40, 30, 20, 10];
        const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
        return opacities
            .map((o, i) => `--glow-color${keys[i]}: hsl(${base} / ${Math.min(o * intensity, 100)}%);`)
            .join(" ");
    }

    const GRADIENT_POSITIONS = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
    const GRADIENT_KEYS = [
        "--gradient-one",
        "--gradient-two",
        "--gradient-three",
        "--gradient-four",
        "--gradient-five",
        "--gradient-six",
        "--gradient-seven",
    ];
    const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

    function buildGradientVars(cols: string[]) {
        const parts = GRADIENT_KEYS.map((key, i) => {
            const c = cols[Math.min(COLOR_MAP[i], cols.length - 1)];
            return `${key}: radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%);`;
        });
        parts.push(`--gradient-base: linear-gradient(${cols[0]} 0 100%);`);
        return parts.join(" ");
    }

    // Variables estáticas (las dinámicas --edge-proximity / --cursor-angle van con style: directives)
    const staticVars = $derived(
        [
            `--card-bg: ${backgroundColor};`,
            `--edge-sensitivity: ${edgeSensitivity};`,
            `--border-radius: ${borderRadius}px;`,
            `--glow-padding: ${glowRadius}px;`,
            `--cone-spread: ${coneSpread};`,
            `--fill-opacity: ${fillOpacity};`,
            buildGlowVars(glowColor, glowIntensity),
            buildGradientVars(colors),
        ].join(" "),
    );

    /* ---------- seguimiento del puntero ---------- */

    function onPointerMove(e: PointerEvent) {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = e.clientX - rect.left - cx;
        const dy = e.clientY - rect.top - cy;

        const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
        const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
        edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100;

        if (dx === 0 && dy === 0) {
            angle = 0;
        } else {
            let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            if (deg < 0) deg += 360;
            angle = deg;
        }
    }

    /* ---------- barrido de intro ---------- */

    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easeInCubic = (x: number) => x * x * x;

    interface AnimateOpts {
        start?: number;
        end?: number;
        duration?: number;
        delay?: number;
        ease?: (t: number) => number;
        onUpdate: (v: number) => void;
        onEnd?: () => void;
    }

    function runSweep(token: { cancelled: boolean }) {
        const animateValue = ({
            start = 0,
            end = 100,
            duration = 1000,
            delay = 0,
            ease = easeOutCubic,
            onUpdate,
            onEnd,
        }: AnimateOpts) => {
            const t0 = performance.now() + delay;
            const tick = () => {
                if (token.cancelled) return;
                const t = Math.min(Math.max((performance.now() - t0) / duration, 0), 1);
                onUpdate(start + (end - start) * ease(t));
                if (t < 1) requestAnimationFrame(tick);
                else onEnd?.();
            };
            setTimeout(() => !token.cancelled && requestAnimationFrame(tick), delay);
        };

        const angleStart = 110;
        const angleEnd = 465;
        const toAngle = (v: number) => (angleEnd - angleStart) * (v / 100) + angleStart;

        sweeping = true;
        angle = angleStart;

        animateValue({ duration: 500, onUpdate: (v) => (edge = v) });
        animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: (v) => (angle = toAngle(v)) });
        animateValue({
            ease: easeOutCubic,
            delay: 1500,
            duration: 2250,
            start: 50,
            end: 100,
            onUpdate: (v) => (angle = toAngle(v)),
        });
        animateValue({
            ease: easeInCubic,
            delay: 2500,
            duration: 1500,
            start: 100,
            end: 0,
            onUpdate: (v) => (edge = v),
            onEnd: () => (sweeping = false),
        });
    }

    $effect(() => {
        const el = card;
        if (!el) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) return;

        const isTouch = window.matchMedia("(hover: none)").matches;
        const token = { cancelled: false };
        let io: IntersectionObserver | undefined;

        if (animated) {
            runSweep(token);
        } else if (isTouch && touchSweep) {
            io = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        runSweep(token);
                        io?.disconnect(); // una sola vez
                    }
                },
                { threshold: 0.6 },
            );
            io.observe(el);
        }

        return () => {
            token.cancelled = true;
            io?.disconnect();
            sweeping = false;
        };
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={card}
    onpointermove={onPointerMove}
    class={`border-glow-card ${className}`.trim()}
    class:sweep-active={sweeping}
    style={staticVars}
    style:--edge-proximity={edge.toFixed(3)}
    style:--cursor-angle={`${angle.toFixed(3)}deg`}
>
    <span class="edge-light"></span>
    <div class="border-glow-inner">
        {@render children?.()}
    </div>
</div>

<style>
    .border-glow-card {
        --edge-proximity: 0;
        --cursor-angle: 45deg;
        --edge-sensitivity: 30;
        --color-sensitivity: calc(var(--edge-sensitivity) + 20);
        --border-radius: 28px;
        --glow-padding: 40px;
        --cone-spread: 25;

        position: relative;
        border-radius: var(--border-radius);
        isolation: isolate;
        transform: translate3d(0, 0, 0.01px);
        display: grid;
        border: 1px solid var(--color-border, rgb(255 255 255 / 15%));
        background: var(--card-bg, #120f17);
        overflow: visible;
        box-shadow:
            rgba(0, 0, 0, 0.06) 0px 1px 2px,
            rgba(0, 0, 0, 0.06) 0px 4px 8px,
            rgba(0, 0, 0, 0.06) 0px 16px 32px;
    }

    /* En tema claro, plus-lighter sobre fondo claro no se vería: usa blend normal */
    :global(:root:not(.dark)) .border-glow-card > .edge-light {
        mix-blend-mode: normal;
    }

    .border-glow-card::before,
    .border-glow-card::after,
    .border-glow-card > .edge-light {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        transition: opacity 0.25s ease-out;
        z-index: -1;
    }

    .border-glow-card:not(:hover):not(.sweep-active)::before,
    .border-glow-card:not(:hover):not(.sweep-active)::after,
    .border-glow-card:not(:hover):not(.sweep-active) > .edge-light {
        opacity: 0;
        transition: opacity 0.75s ease-in-out;
    }

    /* borde con gradiente de malla */
    .border-glow-card::before {
        border: 1px solid transparent;
        background:
            linear-gradient(var(--card-bg, #120f17) 0 100%) padding-box,
            linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box,
            var(--gradient-one, radial-gradient(at 80% 55%, hsla(268, 100%, 76%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-two, radial-gradient(at 69% 34%, hsla(349, 100%, 74%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-three, radial-gradient(at 8% 6%, hsla(136, 100%, 78%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-four, radial-gradient(at 41% 38%, hsla(192, 100%, 64%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-five, radial-gradient(at 86% 85%, hsla(186, 100%, 74%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-six, radial-gradient(at 82% 18%, hsla(52, 100%, 65%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-seven, radial-gradient(at 51% 4%, hsla(12, 100%, 72%, 1) 0px, transparent 50%)) border-box,
            var(--gradient-base, linear-gradient(#c299ff 0 100%)) border-box;

        opacity: calc((var(--edge-proximity) - var(--color-sensitivity)) / (100 - var(--color-sensitivity)));

        mask-image: conic-gradient(
            from var(--cursor-angle) at center,
            black calc(var(--cone-spread) * 1%),
            transparent calc((var(--cone-spread) + 15) * 1%),
            transparent calc((100 - var(--cone-spread) - 15) * 1%),
            black calc((100 - var(--cone-spread)) * 1%)
        );
    }

    /* relleno de malla cerca de los bordes */
    .border-glow-card::after {
        border: 1px solid transparent;
        background:
            var(--gradient-one, radial-gradient(at 80% 55%, hsla(268, 100%, 76%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-two, radial-gradient(at 69% 34%, hsla(349, 100%, 74%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-three, radial-gradient(at 8% 6%, hsla(136, 100%, 78%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-four, radial-gradient(at 41% 38%, hsla(192, 100%, 64%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-five, radial-gradient(at 86% 85%, hsla(186, 100%, 74%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-six, radial-gradient(at 82% 18%, hsla(52, 100%, 65%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-seven, radial-gradient(at 51% 4%, hsla(12, 100%, 72%, 1) 0px, transparent 50%)) padding-box,
            var(--gradient-base, linear-gradient(#c299ff 0 100%)) padding-box;

        mask-image:
            linear-gradient(to bottom, black, black),
            radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%),
            radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%),
            radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%),
            radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%),
            radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%),
            conic-gradient(from var(--cursor-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%);

        mask-composite: subtract, add, add, add, add, add;
        opacity: calc(
            var(--fill-opacity, 0.5) * (var(--edge-proximity) - var(--color-sensitivity)) /
                (100 - var(--color-sensitivity))
        );
        mix-blend-mode: soft-light;
    }

    /* resplandor exterior */
    .border-glow-card > .edge-light {
        inset: calc(var(--glow-padding) * -1);
        pointer-events: none;
        z-index: 1;

        mask-image: conic-gradient(
            from var(--cursor-angle) at center,
            black 2.5%,
            transparent 10%,
            transparent 90%,
            black 97.5%
        );

        opacity: calc((var(--edge-proximity) - var(--edge-sensitivity)) / (100 - var(--edge-sensitivity)));
        mix-blend-mode: plus-lighter;
    }

    .border-glow-card > .edge-light::before {
        content: "";
        position: absolute;
        inset: var(--glow-padding);
        border-radius: inherit;
        box-shadow:
            inset 0 0 0 1px var(--glow-color, hsl(40deg 80% 80% / 100%)),
            inset 0 0 1px 0 var(--glow-color-60, hsl(40deg 80% 80% / 60%)),
            inset 0 0 3px 0 var(--glow-color-50, hsl(40deg 80% 80% / 50%)),
            inset 0 0 6px 0 var(--glow-color-40, hsl(40deg 80% 80% / 40%)),
            inset 0 0 15px 0 var(--glow-color-30, hsl(40deg 80% 80% / 30%)),
            inset 0 0 25px 2px var(--glow-color-20, hsl(40deg 80% 80% / 20%)),
            inset 0 0 50px 2px var(--glow-color-10, hsl(40deg 80% 80% / 10%)),
            0 0 1px 0 var(--glow-color-60, hsl(40deg 80% 80% / 60%)),
            0 0 3px 0 var(--glow-color-50, hsl(40deg 80% 80% / 50%)),
            0 0 6px 0 var(--glow-color-40, hsl(40deg 80% 80% / 40%)),
            0 0 15px 0 var(--glow-color-30, hsl(40deg 80% 80% / 30%)),
            0 0 25px 2px var(--glow-color-20, hsl(40deg 80% 80% / 20%)),
            0 0 50px 2px var(--glow-color-10, hsl(40deg 80% 80% / 10%));
    }

    .border-glow-inner {
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }
</style>