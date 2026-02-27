<!--
  svelte-chop-chop — Grid overlay (rule of thirds, grid, golden ratio)
-->
<script lang="ts">
  import type { GridType, Rect } from '../core/types.js';

  let {
    rect,
    grid = 'rule-of-thirds',
    active = true,
  }: { rect: Rect; grid?: GridType; active?: boolean } = $props();

  const showGrid = $derived(grid !== 'none' && rect.width > 0 && rect.height > 0);

  const lines = $derived(getGridLines(rect, grid));

  function getGridLines(r: Rect, g: GridType): Array<{ x1: number; y1: number; x2: number; y2: number }> {
    if (g === 'none') return [];

    const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    if (g === 'rule-of-thirds') {
      const t1 = 1 / 3;
      const t2 = 2 / 3;
      result.push(
        { x1: r.width * t1, y1: 0, x2: r.width * t1, y2: r.height },
        { x1: r.width * t2, y1: 0, x2: r.width * t2, y2: r.height },
        { x1: 0, y1: r.height * t1, x2: r.width, y2: r.height * t1 },
        { x1: 0, y1: r.height * t2, x2: r.width, y2: r.height * t2 }
      );
    } else if (g === 'grid') {
      for (let i = 1; i < 3; i++) {
        result.push(
          { x1: (r.width * i) / 3, y1: 0, x2: (r.width * i) / 3, y2: r.height },
          { x1: 0, y1: (r.height * i) / 3, x2: r.width, y2: (r.height * i) / 3 }
        );
      }
    } else if (g === 'golden-ratio') {
      const phi = 1.618;
      const t1 = 1 / (1 + phi);
      const t2 = phi / (1 + phi);
      result.push(
        { x1: r.width * t1, y1: 0, x2: r.width * t1, y2: r.height },
        { x1: r.width * t2, y1: 0, x2: r.width * t2, y2: r.height },
        { x1: 0, y1: r.height * t1, x2: r.width, y2: r.height * t1 },
        { x1: 0, y1: r.height * t2, x2: r.width, y2: r.height * t2 }
      );
    }

    return result;
  }
</script>

{#if showGrid}
  <svg
    class="chop-grid"
    aria-hidden="true"
    viewBox="0 0 {rect.width} {rect.height}"
    preserveAspectRatio="none"
  >
    {#each lines as line}
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke="var(--chop-grid-color, rgba(255, 255, 255, 0.6))"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
    {/each}
  </svg>
{/if}

<style>
  .chop-grid {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
  }
</style>
