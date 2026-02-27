/**
 * svelte-chop-chop — Standalone transform composable
 * Wraps TransformEngine for use in headless mode.
 */

import type { Point, TransformState } from '../core/types.js';
import { createTransformEngine } from '../core/transform-engine.svelte.js';

export interface TransformOptions {
  initialTransforms?: Partial<TransformState>;
  minZoom?: number;
  maxZoom?: number;
  onChange?: (transforms: TransformState) => void;
}

export interface TransformReturn {
  get transforms(): TransformState;
  rotate: (degrees: number) => void;
  setRotation: (degrees: number) => void;
  flipX: () => void;
  flipY: () => void;
  setZoom: (zoom: number) => void;
  zoomBy: (delta: number) => void;
  setPan: (pan: Point) => void;
  panBy: (delta: Point) => void;
  center: () => void;
  reset: () => void;
}

/**
 * Create standalone transform composable.
 */
export function createTransform(options: TransformOptions = {}): TransformReturn {
  const engine = createTransformEngine(options);
  return {
    get transforms() {
      return engine.transforms;
    },
    rotate: engine.rotate,
    setRotation: engine.setRotation,
    flipX: engine.flipX,
    flipY: engine.flipY,
    setZoom: engine.setZoom,
    zoomBy: engine.zoomBy,
    setPan: engine.setPan,
    panBy: engine.panBy,
    center: engine.center,
    reset: engine.reset,
  };
}
