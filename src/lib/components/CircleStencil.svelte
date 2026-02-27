<!--
  svelte-chop-chop — Circular crop stencil
  Same contract as CropStencil, but with circular mask.
-->
<script lang="ts">
  import type { HandlePosition, Point, StencilProps } from '../core/types.js';
  import { createDragHandler } from '../core/interactions.js';
  import DragHandle from './DragHandle.svelte';

  let {
    rect,
    aspectRatio = 1,
    active,
    imageBounds,
    grid,
    transitions,
    onmove,
    onresize,
    onresizestart,
    onresizeend,
  }: StencilProps & {
    onmove: (delta: Point) => void;
    onresize: (handle: HandlePosition, delta: Point) => void;
    onresizestart?: () => void;
    onresizeend?: () => void;
  } = $props();

  const drag = createDragHandler({
    onMove: (delta) => onmove(delta),
  });

  // The circle is inscribed in a 1:1 square bounding rect.
  // cx/cy are used for the circle border positioning only.
  const size = $derived(Math.min(rect.width, rect.height));
  const cx   = $derived(rect.width / 2);
  const cy   = $derived(rect.height / 2);
</script>

<div
  class="chop-stencil chop-stencil-circle"
  class:chop-stencil-active={active}
  style:left="{rect.x}px"
  style:top="{rect.y}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
  role="group"
  aria-label="Circular crop area"
  onpointerdown={drag.onpointerdown}
  onpointermove={drag.onpointermove}
  onpointerup={drag.onpointerup}
>
  <svg class="chop-circle-overlay" aria-hidden="true">
    <defs>
      <mask id="chop-circle-mask">
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        <circle
          cx="{cx}"
          cy="{cy}"
          r="{size / 2}"
          fill="black"
        />
      </mask>
    </defs>
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="var(--chop-overlay, rgba(0, 0, 0, 0.55))"
      mask="url(#chop-circle-mask)"
    />
  </svg>

  <div
    class="chop-circle-border"
    style:left="{cx}px"
    style:top="{cy}px"
    style:width="{size}px"
    style:height="{size}px"
    style:margin-left="-{size / 2}px"
    style:margin-top="-{size / 2}px"
  ></div>

  <!-- Handles at the 4 bounding-box corners — correct for a 1:1 square crop with circular mask -->
  <DragHandle position="nw" {onresize} {onresizestart} {onresizeend} size={16} />
  <DragHandle position="ne" {onresize} {onresizestart} {onresizeend} size={16} />
  <DragHandle position="sw" {onresize} {onresizestart} {onresizeend} size={16} />
  <DragHandle position="se" {onresize} {onresizestart} {onresizeend} size={16} />
</div>

<style>
  .chop-stencil-circle {
    position: absolute;
    border: none;
    box-sizing: border-box;
    z-index: 5;
    touch-action: none;
  }

  .chop-circle-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .chop-circle-border {
    position: absolute;
    border: 2px solid var(--chop-stencil-border, rgba(255, 255, 255, 0.8));
    border-radius: 50%;
    box-sizing: border-box;
    pointer-events: none;
  }

  .chop-stencil-active .chop-circle-border {
    border-color: var(--chop-stencil-border-active, #fff);
  }

  /* Give circle handles a subtle dark outline so they're visible on light images */
  :global(.chop-stencil-circle .chop-handle) {
    border: 2px solid rgba(0, 0, 0, 0.35);
    box-sizing: border-box;
  }
</style>
