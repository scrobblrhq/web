<script lang="ts">
    import { onMount } from "svelte";
    import gsap from "gsap";

    type Item = string | { image: string; alt?: string };

    interface Props {
        items?: Item[];
        cardWidth?: number;
        cardHeight?: number;
        radius?: number;
        tint?: string;
        depth?: number;
        spread?: number;
        tilt?: number;
        tiltDirection?: "left" | "right";
        perspective?: number;
        visibleCards?: number;
        falloff?: number;
        blur?: number;
        duration?: number;
        ease?: string;
        autoplay?: boolean;
        autoplayDelay?: number;
        loop?: boolean;
        showControls?: boolean;
        showIndicators?: boolean;
        centerStack?: boolean; // centra visualmente todo el abanico (no solo la tarjeta activa)
        wheel?: boolean; // captura el scroll de la rueda (desactivado por defecto)
        onchange?: (index: number, item: { image: string; alt?: string }) => void;
        class?: string;
    }

    let {
        items = [],
        cardWidth = 300,
        cardHeight = 380,
        radius = 18,
        tint = "#05060a",
        depth = 220,
        spread = 90,
        tilt = 22,
        tiltDirection = "right",
        perspective = 1400,
        visibleCards = 4,
        falloff = 0.2,
        blur = 6,
        duration = 700,
        ease = "power3.out",
        autoplay = false,
        autoplayDelay = 3200,
        loop = true,
        showControls = true,
        showIndicators = true,
        centerStack = true,
        wheel = false,
        onchange,
        class: className = "",
    }: Props = $props();

    const clamp = (v: number, min: number, max: number) =>
        Math.min(Math.max(v, min), max);

    const data = $derived(
        items.map((it) =>
            typeof it === "string" ? { image: it, alt: "" } : it,
        ),
    );
    const count = $derived(data.length);

    let rootEl: HTMLDivElement | undefined = $state();
    let cardEls: (HTMLDivElement | null)[] = [];
    let overlayEls: (HTMLSpanElement | null)[] = [];

    let active = $state(0);

    // Estado no reactivo (se manipula directamente en el DOM)
    let pos = 0;
    let focusIdx = 0;
    let scale = 1;
    let reduced = false;
    let tween: gsap.core.Tween | null = null;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    type Drag = {
        x: number;
        startPos: number;
        lastX: number;
        lastT: number;
        v: number;
        moved: boolean;
        id: number;
    };
    let drag: Drag | null = null;

    function layout(p: number) {
        const n = count;
        if (!n) return;
        const dir = tiltDirection === "left" ? -1 : 1;

        // Desplazamiento que centra el abanico completo en el contenedor
        const shift = centerStack
            ? -dir * spread * (Math.min(visibleCards, Math.max(n - 1, 0)) / 2)
            : 0;

        for (let i = 0; i < n; i++) {
            const el = cardEls[i];
            if (!el) continue;

            let d = i - p;
            if (loop && n > 1) {
                d = ((d % n) + n) % n;
                if (d > n / 2) d -= n;
            }

            const back = Math.max(0, d);
            const shown = Math.abs(d) <= visibleCards + 0.5;

            const tz = -depth * d;
            const tx = dir * spread * d + shift;
            const ry = dir * tilt * clamp(d, 0, 1);

            let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
            if (!shown) opacity = 0;

            const brightness = Math.max(0.15, 1 - back * falloff);
            const blurPx =
                blur > 0
                    ? Math.min(blur, (back / Math.max(1, visibleCards)) * blur)
                    : 0;

            el.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
            el.style.opacity = opacity.toFixed(3);
            el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
            el.style.zIndex = String(Math.round(2000 - d * 20));
            el.style.pointerEvents =
                shown && opacity > 0.05 ? "auto" : "none";

            const ov = overlayEls[i];
            if (ov)
                ov.style.opacity = clamp(back * falloff * 1.25, 0, 0.86).toFixed(3);
        }
    }

    function tweenTo(target: number, animate: boolean) {
        tween?.kill();
        const proxy = { p: pos };
        tween = gsap.to(proxy, {
            p: target,
            duration: animate && !reduced ? duration / 1000 : 0,
            ease,
            onUpdate: () => {
                pos = proxy.p;
                layout(pos);
            },
            onComplete: () => {
                if (count > 0) pos = ((pos % count) + count) % count;
                layout(pos);
            },
        });
    }

    function setFocus(rawIndex: number, animate = true) {
        const n = count;
        if (!n) return;
        const idx = loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
        let delta = idx - pos;
        if (loop && n > 1) {
            delta = ((delta % n) + n) % n;
            if (delta > n / 2) delta -= n;
        }
        tweenTo(pos + delta, animate);
        if (idx !== focusIdx) {
            focusIdx = idx;
            active = idx;
            onchange?.(idx, data[idx]);
        }
    }

    const navigateBy = (step: number) => setFocus(focusIdx + step, true);

    // ---- Interacción ----
    function onPointerDown(e: PointerEvent) {
        if (count < 2) return;
        tween?.kill();
        drag = {
            x: e.clientX,
            startPos: pos,
            lastX: e.clientX,
            lastT: performance.now(),
            v: 0,
            moved: false,
            id: e.pointerId,
        };
    }

    function onPointerMove(e: PointerEvent) {
        if (!drag) return;
        const stepPx = Math.max(cardWidth * 0.55 * scale, 40);
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 4) {
            drag.moved = true;
            rootEl?.setPointerCapture(drag.id);
        }
        if (!drag.moved) return;
        const now = performance.now();
        const dt = Math.max(now - drag.lastT, 1);
        drag.v = (e.clientX - drag.lastX) / dt;
        drag.lastX = e.clientX;
        drag.lastT = now;
        pos = drag.startPos - dx / stepPx;
        layout(pos);
    }

    function onPointerEnd() {
        const d = drag;
        if (!d) return;
        // se mantiene `moved` un instante para que el click de la tarjeta lo ignore
        if (!d.moved) {
            drag = null;
            return;
        }
        const stepPx = Math.max(cardWidth * 0.55 * scale, 40);
        const projected = pos - (d.v * 180) / stepPx;
        setFocus(Math.round(projected), true);
        setTimeout(() => {
            if (drag === d) drag = null;
        }, 0);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            navigateBy(-1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            navigateBy(1);
        }
    }

    function onCardClick(i: number) {
        if (drag?.moved) return;
        setFocus(i, true);
    }

    // ---- Efectos ----
    onMount(() => {
        reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const ro = new ResizeObserver((entries) => {
            const w = entries[0].contentRect.width;
            const needed = cardWidth + Math.abs(spread) * 2 + 120;
            scale = clamp(w / needed, 0.4, 1);
            layout(pos);
        });
        if (rootEl) ro.observe(rootEl);

        return () => {
            ro.disconnect();
            tween?.kill();
            if (wheelTimer) clearTimeout(wheelTimer);
        };
    });

    // Re-layout cuando cambia cualquier prop usada en layout()
    $effect(() => {
        layout(pos);
    });

    // Rueda del ratón (opcional)
    $effect(() => {
        const el = rootEl;
        if (!el || !wheel) return;
        const onWheel = (e: WheelEvent) => {
            if (count < 2) return;
            e.preventDefault();
            tween?.kill();
            const raw =
                Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            const delta = e.deltaMode === 1 ? raw * 24 : raw;
            pos += clamp(delta / (cardWidth * 0.9), -0.6, 0.6);
            layout(pos);
            if (wheelTimer) clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => setFocus(Math.round(pos), true), 130);
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    });

    // Autoplay: solo avanza si está en pantalla, sin hover/foco y con la pestaña visible
    $effect(() => {
        const root = rootEl;
        if (!autoplay || !root || count < 2) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let hovered = false;
        let focused = false;
        let inView = false;

        const io = new IntersectionObserver(
            (entries) => {
                inView = entries[0]?.isIntersecting ?? false;
            },
            { threshold: 0.35 },
        );
        io.observe(root);

        const timer = setInterval(
            () => {
                if (hovered || focused || !inView || document.hidden) return;
                navigateBy(1);
            },
            Math.max(autoplayDelay, 600),
        );
        const set = (k: "h" | "f", v: boolean) => () => {
            if (k === "h") hovered = v;
            else focused = v;
        };
        const handlers: [string, () => void][] = [
            ["mouseenter", set("h", true)],
            ["mouseleave", set("h", false)],
            ["focusin", set("f", true)],
            ["focusout", set("f", false)],
        ];
        handlers.forEach(([ev, fn]) => root.addEventListener(ev, fn));

        return () => {
            clearInterval(timer);
            io.disconnect();
            handlers.forEach(([ev, fn]) => root.removeEventListener(ev, fn));
        };
    });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    bind:this={rootEl}
    class="depth-carousel {className}"
    style="--dc-perspective: {perspective}px"
    role="group"
    aria-roledescription="carousel"
    aria-label="Galería de imágenes"
    tabindex="0"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerEnd}
    onpointercancel={onPointerEnd}
    onkeydown={onKeyDown}
>
    <div class="depth-carousel__stage">
        {#each data as item, i (i)}
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <div
                class="depth-carousel__card"
                bind:this={cardEls[i]}
                style="width: {cardWidth}px; height: {cardHeight}px; border-radius: {radius}px;"
                aria-roledescription="slide"
                aria-label="{i + 1} de {count}"
                aria-hidden={active !== i}
                onclick={() => onCardClick(i)}
            >
                <img
                    class="depth-carousel__img"
                    src={item.image}
                    alt={item.alt || ""}
                    draggable="false"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                />
                <span
                    class="depth-carousel__tint"
                    bind:this={overlayEls[i]}
                    style="background: {tint}"
                ></span>
            </div>
        {/each}
    </div>

    {#if showControls && count > 1}
        <button
            type="button"
            class="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Anterior"
            onclick={() => navigateBy(-1)}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
        <button
            type="button"
            class="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Siguiente"
            onclick={() => navigateBy(1)}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    {/if}

    {#if showIndicators && count > 1}
        <div class="depth-carousel__dots" role="tablist" aria-label="Imágenes">
            {#each data as _, i (i)}
                <button
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    aria-label="Ir a imagen {i + 1}"
                    class="depth-carousel__dot"
                    class:is-active={active === i}
                    onclick={() => setFocus(i, true)}
                ></button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .depth-carousel {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: var(--dc-perspective, 1400px);
        perspective-origin: 50% 50%;
        touch-action: pan-y;
        outline: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: grab;
    }
    .depth-carousel:active { cursor: grabbing; }
    .depth-carousel:focus-visible {
        /* visible en tema claro y oscuro */
        outline: 2px solid var(--color-accent, currentColor);
        outline-offset: 4px;
        border-radius: 12px;
    }
    .depth-carousel__stage {
        position: absolute;
        inset: 0;
        transform-style: preserve-3d;
    }
    .depth-carousel__card {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-origin: center center;
        overflow: hidden;
        background: #0b0d12;
        box-shadow:
            0 30px 60px -20px rgba(0, 0, 0, 0.65),
            0 8px 20px -10px rgba(0, 0, 0, 0.5);
        will-change: transform, opacity, filter;
        cursor: pointer;
        transform: translate(-50%, -50%);
    }
    .depth-carousel__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
        -webkit-user-drag: none;
    }
    .depth-carousel__tint {
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        mix-blend-mode: multiply;
    }
    .depth-carousel__arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 3000;
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        background: rgba(18, 20, 26, 0.55);
        backdrop-filter: blur(8px);
        color: #fff;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }
    .depth-carousel__arrow:hover {
        background: rgba(28, 31, 40, 0.85);
        border-color: rgba(255, 255, 255, 0.4);
    }
    .depth-carousel__arrow:active { transform: translateY(-50%) scale(0.94); }
    .depth-carousel__arrow:focus-visible,
    .depth-carousel__dot:focus-visible {
        outline: 2px solid var(--color-accent, #fff);
        outline-offset: 2px;
    }
    .depth-carousel__arrow--prev { left: 16px; }
    .depth-carousel__arrow--next { right: 16px; }
    .depth-carousel__dots {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3000;
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(14, 16, 22, 0.4);
        backdrop-filter: blur(6px);
    }
    .depth-carousel__dot {
        width: 7px;
        height: 7px;
        padding: 0;
        border: none;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.32);
        cursor: pointer;
        transition: width 0.25s ease, background 0.25s ease;
    }
    .depth-carousel__dot.is-active { width: 20px; background: #fff; }

    @media (prefers-reduced-motion: reduce) {
        .depth-carousel__card { will-change: auto; }
        .depth-carousel__arrow,
        .depth-carousel__dot { transition: none; }
    }
</style>