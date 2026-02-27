/**
 * svelte-chop-chop — Frame plugin
 * Decorative frames (solid, line, hook) applied as a post-processor on export.
 */

import type { ChopPlugin } from '../core/types.js';

export type FrameType = 'none' | 'solid' | 'line' | 'hook';

/**
 * Create frame plugin.
 * Registers a 'frame' tab and draws the selected frame on the exported canvas.
 */
export function pluginFrame(): ChopPlugin {
  return {
    name: 'frame',
    setup(ctx) {
      // Register the tab button
      ctx.registerAction({
        id: 'frame-tab',
        label: 'Frame',
        icon: 'square',
        group: 'tabs',
        execute: () => ctx.showPanel(ctx.editor.activeTab === 'frame' ? null : 'frame'),
      });

      // Register post-processor — runs at export time, reads current frame state
      ctx.registerPostProcessor(async (drawCtx, canvas) => {
        const f = ctx.editor.frameSettings;
        if (f.type === 'none' || f.width <= 0) return;

        const { width: W, height: H } = canvas;
        const bw = f.width; // border width in pixels

        drawCtx.save();
        drawCtx.strokeStyle = f.color;

        if (f.type === 'solid') {
          // Solid filled border
          drawCtx.fillStyle = f.color;
          // Top, bottom, left, right bars
          drawCtx.fillRect(0, 0, W, bw);
          drawCtx.fillRect(0, H - bw, W, bw);
          drawCtx.fillRect(0, 0, bw, H);
          drawCtx.fillRect(W - bw, 0, bw, H);
        } else if (f.type === 'line') {
          // Single hairline stroke inset by half line width
          const half = bw / 2;
          drawCtx.lineWidth = bw;
          drawCtx.strokeRect(half, half, W - bw, H - bw);
        } else if (f.type === 'hook') {
          // Corner hooks (L-shaped lines at each corner)
          const hookLength = Math.min(bw * 4, Math.min(W, H) * 0.15);
          drawCtx.lineWidth = bw;
          drawCtx.lineCap = 'square';
          const half = bw / 2;

          // Top-left
          drawCtx.beginPath();
          drawCtx.moveTo(half, hookLength + half);
          drawCtx.lineTo(half, half);
          drawCtx.lineTo(hookLength + half, half);
          drawCtx.stroke();

          // Top-right
          drawCtx.beginPath();
          drawCtx.moveTo(W - hookLength - half, half);
          drawCtx.lineTo(W - half, half);
          drawCtx.lineTo(W - half, hookLength + half);
          drawCtx.stroke();

          // Bottom-left
          drawCtx.beginPath();
          drawCtx.moveTo(half, H - hookLength - half);
          drawCtx.lineTo(half, H - half);
          drawCtx.lineTo(hookLength + half, H - half);
          drawCtx.stroke();

          // Bottom-right
          drawCtx.beginPath();
          drawCtx.moveTo(W - hookLength - half, H - half);
          drawCtx.lineTo(W - half, H - half);
          drawCtx.lineTo(W - half, H - hookLength - half);
          drawCtx.stroke();
        }

        drawCtx.restore();
      });

      return () => {};
    },
  };
}
