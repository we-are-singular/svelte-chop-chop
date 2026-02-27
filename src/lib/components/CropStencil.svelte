<!--
  svelte-chop-chop — Default rectangular stencil
  Uses DragHandle, CropOverlay, GridOverlay.
-->
<script lang="ts">
  import type { HandlePosition, Point, StencilProps } from '../core/types.js';
  import { createDragHandler } from '../core/interactions.js';
  import DragHandle from './DragHandle.svelte';
  import GridOverlay from './GridOverlay.svelte';

  let {
    rect,
    aspectRatio,
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
</script>

<div
  class="chop-stencil chop-stencil-rect"
  class:chop-stencil-active={active}
  class:chop-stencil-transitions={transitions}
  style:left="{rect.x}px"
  style:top="{rect.y}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
  role="group"
  aria-label="Crop area"
  onpointerdown={drag.onpointerdown}
  onpointermove={drag.onpointermove}
  onpointerup={drag.onpointerup}
>
  {#if !aspectRatio || aspectRatio === null}
    <DragHandle position="nw" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="ne" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="sw" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="se" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="n" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="s" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="e" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="w" {onresize} {onresizestart} {onresizeend} />
  {:else}
    <DragHandle position="nw" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="ne" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="sw" {onresize} {onresizestart} {onresizeend} />
    <DragHandle position="se" {onresize} {onresizestart} {onresizeend} />
  {/if}

  <GridOverlay {rect} {grid} {active} />
</div>

<style>
  .chop-stencil {
    position: absolute;
    border: 2px solid var(--chop-stencil-border, rgba(255, 255, 255, 0.8));
    box-sizing: border-box;
    z-index: 5;
    touch-action: none;
  }

  .chop-stencil-active {
    border-color: var(--chop-stencil-border-active, #fff);
  }

  .chop-stencil-transitions {
    transition: border-color var(--chop-transition-duration, 300ms)
      var(--chop-transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }
</style>
