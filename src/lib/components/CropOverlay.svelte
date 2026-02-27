<!--
  svelte-chop-chop — Dark overlay with crop cutout
  Shows dimmed area outside the crop rectangle.
  Positioned to cover imageBounds; cutout at rect.
-->
<script lang="ts">
  import type { Rect } from '../core/types.js';

  let { rect, imageBounds }: { rect: Rect; imageBounds: Rect } = $props();

  const maskX = $derived(rect.x - imageBounds.x);
  const maskY = $derived(rect.y - imageBounds.y);
</script>

<svg
  class="chop-overlay"
  aria-hidden="true"
  style:left="{imageBounds.x}px"
  style:top="{imageBounds.y}px"
  style:width="{imageBounds.width}px"
  style:height="{imageBounds.height}px"
>
  <defs>
    <mask id="chop-crop-mask">
      <rect x="0" y="0" width="100%" height="100%" fill="white" />
      <rect
        x="{maskX}"
        y="{maskY}"
        width="{rect.width}"
        height="{rect.height}"
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
    mask="url(#chop-crop-mask)"
  />
</svg>

<style>
  .chop-overlay {
    position: absolute;
    pointer-events: none;
    z-index: 2;
  }
</style>
