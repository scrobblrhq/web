<script lang="ts">
  import { motion } from "motion-sv";
  import "./Switch.css";

  interface Props {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    onchange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    trackColor?: string;
    trackOnColor?: string;
    thumbColor?: string;
    thumbOnColor?: string;
    width?: number;
    height?: number;
    radius?: number;
    speed?: number;
    stretch?: number;
    hoverScale?: number;
    colorDuration?: number;
    ariaLabel?: string;
    className?: string;
    class?: string;
    id?: string;
    name?: string;
    form?: string;
  }

  let {
    checked,
    defaultChecked = false,
    onChange,
    onchange,
    label = "",
    disabled = false,
    trackColor = "var(--color-border)",
    trackOnColor = "var(--color-accent)",
    thumbColor = "var(--color-card)",
    thumbOnColor = "var(--color-accent-text)",
    width = 50,
    height = 25,
    radius = 19,
    speed = 100,
    stretch = 20,
    hoverScale = 1.035,
    colorDuration = 320,
    ariaLabel,
    className = "",
    class: classProp = "",
    id,
    name,
    form,
  }: Props = $props();

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  let internalChecked = $state(false);
  let dragValue = $state<number | null>(null);
  let dragging = $state(false);
  let hovered = $state(false);
  const isControlled = $derived(checked !== undefined);

  $effect(() => {
    if (!isControlled) {
      internalChecked = defaultChecked;
    }
  });
  let grip = $state<{
    pointerId: number;
    startX: number;
    startChecked: boolean;
    grab: number | null;
    moved: boolean;
    slop: number;
  } | null>(null);
  let skipClick = $state(false);

  const resolvedChecked = $derived(isControlled ? checked ?? false : internalChecked);
  const inset = $derived(Math.max(3, Math.round(height * 0.11)));
  const thumbSize = $derived(height - inset * 2);
  const minX = $derived(inset);
  const maxX = $derived(width - inset - thumbSize);
  const mid = $derived((minX + maxX) / 2);
  const trackRadius = $derived(Math.min(radius, height / 2));
  const thumbRadius = $derived(Math.max(2, trackRadius - inset));
  const reduceMotion = $derived(
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  const currentX = $derived(dragValue ?? (resolvedChecked ? maxX : minX));
  const gain = $derived(reduceMotion ? 0 : clamp(stretch, 0, 100) / 100);
  const motionScale = $derived(
    1 + Math.min(0.22, Math.abs(currentX - mid) / 320) * gain * (resolvedChecked ? 1 : -1),
  );
  const thumbScaleX = $derived(
    hovered && !disabled && !reduceMotion ? Math.max(1, Math.min(hoverScale, 1.2)) * motionScale : motionScale,
  );
  const thumbScaleY = $derived(
    hovered && !disabled && !reduceMotion ? 1 / Math.max(1, Math.min(hoverScale, 1.2)) : 1 / Math.max(1, motionScale),
  );
  const springTransition = $derived(
    reduceMotion
      ? { duration: 0 }
      : {
          type: "spring",
          stiffness: 170 - (50 - clamp(speed, 0, 100)) * 1.1,
          damping: 21.5,
          mass: 0.9,
          restDelta: 0.001,
          restSpeed: 0.01,
        },
  );

  function commit(next: boolean) {
    if (next === resolvedChecked) return;
    if (!isControlled) internalChecked = next;
    onChange?.(next);
    onchange?.(next);
  }

  function localX(clientX: number) {
    const el = trackEl;
    if (!el) return 0;

    const rect = el.getBoundingClientRect();
    const scale = rect.width / (el.offsetWidth || rect.width) || 1;
    return (clientX - rect.left) / scale;
  }

  function handleToggle() {
    if (skipClick) {
      skipClick = false;
      return;
    }

    if (!disabled) commit(!resolvedChecked);
  }

  function handlePointerDown(event: PointerEvent) {
    if (disabled || grip || event.button !== 0) return;

    grip = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startChecked: resolvedChecked,
      grab: null,
      moved: false,
      slop: event.pointerType === "touch" ? 8 : 4,
    };

    const target = event.currentTarget as HTMLButtonElement | null;
    if (target && typeof target.setPointerCapture === "function") {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Ignore browsers that do not support pointer capture.
      }
    }

    dragging = true;
  }

  function handlePointerMove(event: PointerEvent) {
    const state = grip;
    if (!state || state.pointerId !== event.pointerId) return;

    const nowX = localX(event.clientX);
    if (state.grab === null) {
      state.grab = nowX - currentX;
      return;
    }

    if (!state.moved && Math.abs(event.clientX - state.startX) > state.slop) {
      state.moved = true;
    }

    if (!state.moved) return;

    const nextValue = clamp(nowX - (state.grab ?? 0), minX, maxX);
    dragValue = nextValue;
    commit(nextValue > mid);
  }

  function finishPointer(event: Pick<PointerEvent, "pointerId" | "currentTarget">, cancelled: boolean) {
    const state = grip;
    if (!state || state.pointerId !== event.pointerId) return;

    const next = cancelled ? state.startChecked : !state.moved ? !state.startChecked : (dragValue ?? (resolvedChecked ? maxX : minX)) > mid;

    if (next !== resolvedChecked) commit(next);

    grip = null;
    dragValue = null;
    skipClick = true;
    setTimeout(() => {
      skipClick = false;
    }, 0);
    dragging = false;

    const target = event.currentTarget as HTMLButtonElement | null;
    if (target && typeof target.releasePointerCapture === "function") {
      try {
        target.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore browsers that do not support pointer capture.
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      handleToggle();
    }

    if (event.key === "Escape" && grip) {
      finishPointer(
        {
          pointerId: grip.pointerId,
          currentTarget: event.currentTarget as HTMLButtonElement,
        },
        true,
      );
    }
  }

  let trackEl: HTMLSpanElement | null = null;
  let buttonId = $derived(id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `switch-${Math.random().toString(36).slice(2)}`));
  let rootClasses = $derived(["squish-switch-root", className, classProp].filter(Boolean).join(" ").trim());
</script>

<div class={rootClasses}>
  <button
    id={buttonId}
    type="button"
    role="switch"
    aria-checked={resolvedChecked}
    aria-disabled={disabled || undefined}
    aria-label={ariaLabel ?? (label ? undefined : "Toggle switch")}
    class="squish-switch"
    data-on={resolvedChecked ? "true" : undefined}
    data-held={dragging ? "true" : undefined}
    style={`--ss-w: ${width}px; --ss-h: ${height}px; --ss-inset: ${inset}px; --ss-thumb: ${thumbSize}px; --ss-r: ${trackRadius}px; --ss-thumb-r: ${thumbRadius}px; --ss-track: ${trackColor}; --ss-track-on: ${trackOnColor}; --ss-thumb-color: ${thumbColor || "color-mix(in srgb, var(--color-accent) 19%, var(--color-border))"}; --ss-thumb-on: ${thumbOnColor || "var(--color-accent-text)"}; --ss-fade: ${colorDuration}ms;`}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={(event) => finishPointer(event, false)}
    onpointercancel={(event) => finishPointer(event, true)}
    onpointerenter={() => {
      if (!disabled) hovered = true;
    }}
    onpointerleave={() => {
      hovered = false;
    }}
    onkeydown={handleKeydown}
    onclick={handleToggle}
    {disabled}
  >
    <span bind:this={trackEl} class="squish-switch__track">
      <motion.span
        class="squish-switch__thumb"
        aria-hidden="true"
        animate={{
          x: currentX,
          scaleX: thumbScaleX,
          scaleY: thumbScaleY,
        }}
        transition={springTransition}
      />
    </span>
  </button>

  {#if label}
    <label for={buttonId} class="squish-switch__label">{label}</label>
  {/if}
</div>

{#if name}
  <input type="hidden" {name} {form} value={String(resolvedChecked)} />
{/if}
