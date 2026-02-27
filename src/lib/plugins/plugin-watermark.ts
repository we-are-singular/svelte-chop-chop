/**
 * svelte-chop-chop — Watermark plugin
 * Text watermark applied as a post-processor on export.
 */

import type { ChopPlugin, WatermarkSettings } from '../core/types.js';

/**
 * Resolve pixel coordinates for a watermark position string.
 */
function resolvePosition(
  position: WatermarkSettings['position'],
  canvasWidth: number,
  canvasHeight: number,
  fontSize: number,
  padding: number
): { x: number; y: number; textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline } {
  const left = padding;
  const center = canvasWidth / 2;
  const right = canvasWidth - padding;

  const isTop    = position.startsWith('top');
  const isMid    = position === 'center';
  const isBottom = position.startsWith('bottom');

  let x: number;
  let textAlign: CanvasTextAlign;

  if (position.endsWith('left')) { x = left; textAlign = 'left'; }
  else if (position.endsWith('right')) { x = right; textAlign = 'right'; }
  else { x = center; textAlign = 'center'; }

  let y: number;
  let textBaseline: CanvasTextBaseline;
  if (isTop) { y = padding + fontSize; textBaseline = 'top'; }
  else if (isBottom) { y = canvasHeight - padding; textBaseline = 'alphabetic'; }
  else { y = canvasHeight / 2; textBaseline = 'middle'; }

  return { x, y, textAlign, textBaseline };
}

/**
 * Create watermark plugin.
 * Registers a 'watermark' tab and overlays text on the exported canvas.
 */
export function pluginWatermark(): ChopPlugin {
  return {
    name: 'watermark',
    setup(ctx) {
      ctx.registerAction({
        id: 'watermark-tab',
        label: 'Watermark',
        icon: 'droplet',
        group: 'tabs',
        execute: () => ctx.showPanel(ctx.editor.activeTab === 'watermark' ? null : 'watermark'),
      });

      ctx.registerPostProcessor(async (drawCtx, canvas) => {
        const w = ctx.editor.watermarkSettings;
        if (!w.text.trim()) return;

        const { width: W, height: H } = canvas;
        const padding = Math.round(Math.min(W, H) * 0.03);
        const scaledFontSize = Math.round(w.fontSize * (Math.min(W, H) / 600));
        const font = `bold ${scaledFontSize}px sans-serif`;

        const { x, y, textAlign, textBaseline } = resolvePosition(
          w.position, W, H, scaledFontSize, padding
        );

        drawCtx.save();
        drawCtx.globalAlpha = Math.max(0, Math.min(1, w.opacity));
        drawCtx.font = font;
        drawCtx.fillStyle = w.color;
        drawCtx.textAlign = textAlign;
        drawCtx.textBaseline = textBaseline;

        // Drop shadow for legibility
        drawCtx.shadowColor = 'rgba(0,0,0,0.5)';
        drawCtx.shadowBlur = scaledFontSize * 0.3;
        drawCtx.shadowOffsetX = 1;
        drawCtx.shadowOffsetY = 1;

        drawCtx.fillText(w.text, x, y);

        drawCtx.restore();
      });

      return () => {};
    },
  };
}
