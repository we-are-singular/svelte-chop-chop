<!--
  svelte-chop-chop — Resize handle primitive
  Emits resize deltas via onresize. Keyboard accessible.
-->
<script lang="ts">
  import type { HandlePosition, Point } from '../core/types.js';
  import { createDragHandler } from '../core/interactions.js';

  let {
    position,
    onresize,
    onresizestart,
    onresizeend,
    size = 14,
    style = '',
  }: {
    position: HandlePosition;
    onresize: (handle: HandlePosition, delta: Point) => void;
    onresizestart?: () => void;
    onresizeend?: () => void;
    size?: number;
    /** Optional inline style override for positioning (e.g. for CircleStencil) */
    style?: string;
  } = $props();

  const cursor = $derived(getCursorForHandle(position));

  const drag = createDragHandler({
    onStart: () => onresizestart?.(),
    onMove: (delta) => onresize(position, delta),
    onEnd: () => onresizeend?.(),
  });

  function getCursorForHandle(pos: HandlePosition): string {
    const map: Record<HandlePosition, string> = {
      nw: 'nwse-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
      se: 'nwse-resize',
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
    };
    return map[pos];
  }
</script>

<div
  class="chop-handle chop-handle-{position}"
  style="{style}"
  style:cursor={cursor}
  style:width="{size}px"
  style:height="{size}px"
  role="slider"
  aria-label="Resize {position}"
  aria-valuenow="0"
  tabindex="0"
  onpointerdown={(e) => {
    e.stopPropagation();
    drag.onpointerdown(e);
  }}
  onpointermove={drag.onpointermove}
  onpointerup={drag.onpointerup}
  onkeydown={(e) => {
    const step = e.shiftKey ? 10 : 1;
    const deltas: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const delta = deltas[e.key];
    if (delta) {
      e.preventDefault();
      onresize(position, delta);
    }
  }}
></div>

<style>
  .chop-handle {
    position: absolute;
    background: var(--chop-handle-color, #fff);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    z-index: 10;
    touch-action: none;
  }

  .chop-handle:focus-visible {
    outline: 2px solid var(--chop-toolbar-active, #4a9eff);
    outline-offset: 2px;
  }

  .chop-handle-nw {
    left: 0;
    top: 0;
  }
  .chop-handle-ne {
    left: 100%;
    top: 0;
  }
  .chop-handle-sw {
    left: 0;
    top: 100%;
  }
  .chop-handle-se {
    left: 100%;
    top: 100%;
  }
  .chop-handle-n {
    left: 50%;
    top: 0;
  }
  .chop-handle-s {
    left: 50%;
    top: 100%;
  }
  .chop-handle-e {
    left: 100%;
    top: 50%;
  }
  .chop-handle-w {
    left: 0;
    top: 50%;
  }
</style>
