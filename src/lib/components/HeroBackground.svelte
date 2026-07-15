<script lang="ts">
  import { animate } from "animejs";
  import { onMount, tick } from "svelte";

  const COVER_COUNT = 18;
  const COVER_SIZE = 92;
  const FLOAT_RANGE = 20;
  const MIN_GAP = 10;

  let containerEl: HTMLDivElement;
  let covers = $state<
    Array<{
      id: number;
      x: number;
      y: number;
      radius: number;
      rotation: number;
      scale: number;
      delay: number;
    }>
  >([]);

  function generateCovers(width: number, height: number) {
    const result: typeof covers = [];
    const maxAttempts = COVER_COUNT * 200;
    let attempts = 0;

    while (result.length < COVER_COUNT && attempts < maxAttempts) {
      attempts++;

      const scale = 0.8 + Math.random() * 0.6;
      const radius = (COVER_SIZE * scale) / 2;
      const x = radius + Math.random() * Math.max(width - radius * 2, 0);
      const y = radius + Math.random() * Math.max(height - radius * 2, 0);

      const overlaps = result.some((c) => {
        const dx = c.x - x;
        const dy = c.y - y;
        const minDist = c.radius + radius + FLOAT_RANGE + MIN_GAP;
        return dx * dx + dy * dy < minDist * minDist;
      });

      if (!overlaps) {
        result.push({
          id: result.length,
          x,
          y,
          radius,
          rotation: Math.random() * 30 - 15,
          scale,
          delay: Math.random() * 2000,
        });
      }
    }

    return result;
  }

  onMount(async () => {
    const rect = containerEl.getBoundingClientRect();
    covers = generateCovers(rect.width, rect.height);

    await tick();

    containerEl.querySelectorAll(".floating-cover").forEach((cover) => {
      animate(cover, {
        translateX: [-FLOAT_RANGE, FLOAT_RANGE],
        translateY: [-FLOAT_RANGE * 0.75, FLOAT_RANGE * 0.75],
        rotate: ["-8deg", "8deg"],
        duration: 12000 + Math.random() * 8000,
        alternate: true,
        loop: true,
        ease: "inOutSine",
        delay: Math.random() * 3000,
      });

      animate(cover, {
        scale: [0.95, 1.05],
        duration: 7000,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });

      animate(cover, {
        opacity: [0.1, 0.15],
        duration: 5000,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });
    });
  });
</script>

<div bind:this={containerEl} class="absolute inset-0 -z-20 pointer-events-none">
  {#each covers as cover (cover.id)}
    <img
      class="floating-cover absolute"
      src={`/covers/${cover.id + 1}.jpeg`}
      alt=""
      style="
        left:{cover.x}px;
        top:{cover.y}px;
        transform:
          translate(-50%, -50%)
          rotate({cover.rotation}deg)
          scale({cover.scale});
      "
    />
  {/each}
</div>

<style>
  .floating-cover {
    width: 92px;
    aspect-ratio: 1;
    object-fit: cover;
    opacity: 0.4;
    filter: blur(0.5px) saturate(0.8);
    border-radius: 14px;
    user-select: none;
    will-change: transform;
    position: absolute;
  }
</style>
