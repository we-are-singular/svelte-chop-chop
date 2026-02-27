/**
 * svelte-chop-chop — Transform state (rotate, flip, zoom, pan)
 * Manages view transforms for the image editor.
 */

import type { Point, TransformState } from './types.js';

const DEFAULT_TRANSFORM: TransformState = {
  rotation: 0,
  flipX: false,
  flipY: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

export interface TransformEngineOptions {
  initialTransforms?: Partial<TransformState>;
  minZoom?: number;
  maxZoom?: number;
  onChange?: (transforms: TransformState) => void;
}

/**
 * Create transform engine composable.
 */
export function createTransformEngine(options: TransformEngineOptions = {}) {
  const minZoom = options.minZoom ?? 0.1;
  const maxZoom = options.maxZoom ?? 10;

  let transforms = $state<TransformState>({
    ...DEFAULT_TRANSFORM,
    ...options.initialTransforms,
  });

  $effect(() => {
    options.onChange?.(transforms);
  });

  function setRotation(degrees: number): void {
    transforms = { ...transforms, rotation: ((degrees % 360) + 360) % 360 };
  }

  function rotate(degrees: number): void {
    setRotation(transforms.rotation + degrees);
  }

  function flipX(): void {
    transforms = { ...transforms, flipX: !transforms.flipX };
  }

  function flipY(): void {
    transforms = { ...transforms, flipY: !transforms.flipY };
  }

  function setZoom(zoom: number): void {
    transforms = {
      ...transforms,
      zoom: Math.min(maxZoom, Math.max(minZoom, zoom)),
    };
  }

  function zoomBy(delta: number): void {
    setZoom(transforms.zoom * (1 + delta));
  }

  function setPan(pan: Point): void {
    transforms = { ...transforms, pan: { ...pan } };
  }

  function panBy(delta: Point): void {
    transforms = {
      ...transforms,
      pan: {
        x: transforms.pan.x + delta.x,
        y: transforms.pan.y + delta.y,
      },
    };
  }

  function center(): void {
    transforms = { ...transforms, pan: { x: 0, y: 0 } };
  }

  function reset(): void {
    transforms = { ...DEFAULT_TRANSFORM };
  }

  return {
    get transforms() {
      return transforms;
    },
    setRotation,
    rotate,
    flipX,
    flipY,
    setZoom,
    zoomBy,
    setPan,
    panBy,
    center,
    reset,
  };
}
