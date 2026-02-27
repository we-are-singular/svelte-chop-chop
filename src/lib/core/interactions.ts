/**
 * svelte-chop-chop — Pointer event handlers
 * Drag, pinch, wheel handlers. Returns deltas, doesn't own state.
 */

import type { Point } from './types.js';

/** Internal drag state */
export interface DragState {
  active: boolean;
  startPoint: Point;
  currentPoint: Point;
  pointerId: number;
}

/** Options for createDragHandler */
export interface DragHandlerOptions {
  onStart?: (point: Point, event: PointerEvent) => void;
  onMove?: (delta: Point, event: PointerEvent) => void;
  onEnd?: (event: PointerEvent) => void;
  threshold?: number;
}

/**
 * Create pointer event handlers for drag gestures.
 * @param options - Callbacks and optional threshold
 * @returns Handlers to spread on element
 */
export function createDragHandler(options: DragHandlerOptions): {
  onpointerdown: (event: PointerEvent) => void;
  onpointermove: (event: PointerEvent) => void;
  onpointerup: (event: PointerEvent) => void;
} {
  let state: DragState | null = null;
  const threshold = options.threshold ?? 3;
  let thresholdMet = false;

  function onpointerdown(event: PointerEvent): void {
    if (event.button !== 0) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    state = {
      active: true,
      startPoint: { x: event.clientX, y: event.clientY },
      currentPoint: { x: event.clientX, y: event.clientY },
      pointerId: event.pointerId,
    };
    thresholdMet = false;
  }

  function onpointermove(event: PointerEvent): void {
    if (!state || event.pointerId !== state.pointerId) return;

    const current = { x: event.clientX, y: event.clientY };
    const delta = {
      x: current.x - state.currentPoint.x,
      y: current.y - state.currentPoint.y,
    };

    if (!thresholdMet) {
      const totalDelta = {
        x: current.x - state.startPoint.x,
        y: current.y - state.startPoint.y,
      };
      if (
        Math.abs(totalDelta.x) < threshold &&
        Math.abs(totalDelta.y) < threshold
      )
        return;
      thresholdMet = true;
      options.onStart?.(state.startPoint, event);
    }

    state.currentPoint = current;
    options.onMove?.(delta, event);
  }

  function onpointerup(event: PointerEvent): void {
    if (!state || event.pointerId !== state.pointerId) return;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

    if (thresholdMet) {
      options.onEnd?.(event);
    }
    state = null;
  }

  return { onpointerdown, onpointermove, onpointerup };
}

/**
 * Create a wheel event handler for zoom.
 * @param options - onZoom callback receives a positive scale factor (>1 = zoom in, <1 = zoom out)
 * @returns Handler to attach as onwheel
 */
export function createWheelHandler(options: {
  onZoom: (factor: number) => void;
  sensitivity?: number;
}): { onwheel: (event: WheelEvent) => void } {
  const sensitivity = options.sensitivity ?? 0.001;

  function onwheel(event: WheelEvent): void {
    event.preventDefault();
    // Normalise across deltaMode (pixel vs line vs page)
    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= 400;
    const factor = 1 - delta * sensitivity;
    options.onZoom(Math.max(0.5, Math.min(2, factor)));
  }

  return { onwheel };
}

/**
 * Create pointer event handlers for pinch zoom.
 * @param options - onPinch callback
 * @returns Handlers to spread on element
 */
export function createPinchHandler(options: {
  onPinch: (scale: number, center: Point) => void;
}): {
  onpointerdown: (e: PointerEvent) => void;
  onpointermove: (e: PointerEvent) => void;
  onpointerup: (e: PointerEvent) => void;
} {
  const pointers = new Map<number, PointerEvent>();

  function getDistance(a: PointerEvent, b: PointerEvent): number {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function getCenter(a: PointerEvent, b: PointerEvent): Point {
    return {
      x: (a.clientX + b.clientX) / 2,
      y: (a.clientY + b.clientY) / 2,
    };
  }

  let lastDistance: number | null = null;

  function onpointerdown(e: PointerEvent): void {
    pointers.set(e.pointerId, e);
  }

  function onpointermove(e: PointerEvent): void {
    pointers.set(e.pointerId, e);
    if (pointers.size !== 2) return;

    const [a, b] = [...pointers.values()];
    const distance = getDistance(a, b);
    const center = getCenter(a, b);

    if (lastDistance !== null) {
      const scale = distance / lastDistance;
      options.onPinch(scale, center);
    }
    lastDistance = distance;
  }

  function onpointerup(e: PointerEvent): void {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastDistance = null;
  }

  return { onpointerdown, onpointermove, onpointerup };
}
