<script lang="ts">
  import { motion } from "motion-sv";

  type Size = "Small" | "Large";
  type Point = [number, number];

  interface Props {
    size?: Size;
    count?: number;
    pull?: number;
    bounce?: number;
    give?: number;
    marks?: string[];
    selected?: number | null;
    onSelect?: (index: number) => void;
  }

  let {
    size = "Large",
    count,
    pull = 55,
    bounce = 55,
    give = 50,
    marks = [],
    selected,
    onSelect,
  }: Props = $props();
  
  const MARKS = $derived(marks.length ? marks : []);

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const CHIP = 44;
  const H_PAD = 26;
  const PITCH = 45;
  const SPREAD = 2.8;

  const validSize = (value: Size) => (value === "Small" ? 3 : 7);
  const buildCluster = (itemCount: number): Point[] => {
    const safeCount = Math.max(1, itemCount);

    if (safeCount === 1) return [[0, 0]];

    const positions: Point[] = [];
    const ringRadius = safeCount <= 3 ? 28 : 45;

    if (safeCount === 2) {
      return [
        [0, 0],
        [ringRadius, 0],
      ];
    }

    if (safeCount === 3) {
      return [
        [0, -26],
        [22.5, 13],
        [-22.5, 13],
      ];
    }

    const ringCount = safeCount - 1;
    positions.push([0, 0]);

    for (let i = 0; i < ringCount; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / ringCount;
      positions.push([
        Math.cos(angle) * ringRadius,
        Math.sin(angle) * ringRadius,
      ]);
    }

    return positions;
  };

  let localSelected = $state<number | null>(null);

  $effect(() => {
    if (selected !== undefined && selected !== localSelected) {
      localSelected = selected;
    }
  });

  const n = $derived(Math.max(1, (count ?? MARKS.length) || validSize(size)));
  const p = $derived(clamp(pull, 0, 100) / 100);
  const pts = $derived(buildCluster(n));
  const activeSelected = $derived(selected === null ? null : selected ?? localSelected ?? 0);
  const at = $derived(activeSelected === null || activeSelected >= n ? null : activeSelected);

  const grow = $derived(1.16 + 0.22 * p);
  const room = $derived((CHIP * (grow - 1)) / 2);
  const aura = $derived(3 + 9 * p);
  const tilt = $derived(5 * p);
  const cower = $derived(0.04 + 0.09 * p);

  const xs = $derived((pts ?? []).map((q) => q[0]));
  const ys = $derived((pts ?? []).map((q) => q[1]));
  const minX = $derived(Math.min(...xs));
  const minY = $derived(Math.min(...ys));
  const W = $derived(Math.max(...xs) - minX + CHIP + H_PAD * 2);
  const H = $derived(Math.max(...ys) - minY + CHIP + H_PAD * 2);

  const field = $derived(
    (pts ?? []).map(([px, py], i) => {
      if (at === null) {
        return {
          far: 0,
          fall: 0,
          push: 0,
          ux: 0,
          uy: 0,
          cx: px - minX + H_PAD + CHIP / 2,
          cy: py - minY + H_PAD + CHIP / 2,
        };
      }

      const [ax, ay] = pts[at];
      const dx = px - ax;
      const dy = py - ay;
      const gap = Math.hypot(dx, dy);
      const far = gap / PITCH;
      const fall = i === at ? 0 : Math.exp(-(far - 1) / SPREAD);
      const push = i === at ? 0 : room + aura;
      const ux = gap ? dx / gap : 0;
      const uy = gap ? dy / gap : 0;

      return {
        far,
        fall,
        push,
        ux,
        uy,
        cx: px - minX + H_PAD + CHIP / 2 + ux * push,
        cy: py - minY + H_PAD + CHIP / 2 + uy * push,
      };
    }),
  );

  const choose = (i: number) => {
    if (i === at || i < 0 || i >= n) return;
    localSelected = i;
    onSelect?.(i);
  };

  const spring = (k: number, mass: number, zeta: number) => ({
    type: "spring" as const,
    stiffness: k,
    damping: 2 * Math.sqrt(k * mass) * zeta,
    mass,
  });
</script>

{#if pts && pts.length}
  <div class="mag" role="radiogroup" aria-label="Shape" style="width: {W}px; height: {H}px;">
    {#each pts as [px, py], i}
      {@const on = i === at}
      {@const detail = field[i]}
      <motion.button
        class="mag-chip"
        type="button"
        role="radio"
        aria-checked={on}
        aria-label={`Option ${i + 1}`}
        data-on={on || undefined}
        style={{
          left: `${px - minX + H_PAD}px`,
          top: `${py - minY + H_PAD}px`,
          width: `${CHIP}px`,
          height: `${CHIP}px`,
        }}
        onclick={() => choose(i)}
        initial={false}
        animate={{
          x: detail.ux * detail.push,
          y: detail.uy * detail.push,
          scaleX: on ? grow : 1 - cower * detail.fall,
          scaleY: on ? grow : 1 - cower * detail.fall,
          rotate: detail.ux * tilt * detail.fall,
        }}
        transition={{
          x: spring(300 + 280 * (1 - Math.min(detail.far, 3) / 4), 0.9, 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100)),
          y: spring(300 + 280 * (1 - Math.min(detail.far, 3) / 4), 0.9, 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100)),
          scaleX: spring(372 + 280 * (1 - Math.min(detail.far, 3) / 4), 0.8, 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100)),
          scaleY: spring(258 + 280 * (1 - Math.min(detail.far, 3) / 4), 0.95, 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100)),
          rotate: spring(240 + 280 * (1 - Math.min(detail.far, 3) / 4), 1, 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100)),
          delay: detail.far * 0.022,
        }}
      >
        <span class="mag-skin">
          {#if MARKS[i]}
            <span class="mag-mark" style:background={MARKS[i]} style="filter: blur(8px);" aria-hidden="true"></span>
          {:else}
            <span class="mag-mark mag-mark-placeholder" aria-hidden="true"></span>
          {/if}
        </span>
      </motion.button>
    {/each}
  </div>
{/if}
