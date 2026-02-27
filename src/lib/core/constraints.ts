/**
 * svelte-chop-chop — Constraint enforcement
 * Aspect ratio and size constraint validation for crop rects.
 */

import type { AspectRatio, Rect, Size, SizeConstraints } from './types.js';
import { clampRect, fitRectToAspectRatio } from './coordinate-system.js';

/**
 * Get numeric aspect ratio from AspectRatio type.
 * @param ratio - Aspect ratio (number, range, or null)
 * @returns Numeric ratio or null for free crop
 */
export function getAspectRatioValue(ratio: AspectRatio): number | null {
  if (ratio === null) return null;
  if (typeof ratio === 'number') return ratio;
  if (ratio.min !== undefined && ratio.max !== undefined) {
    return (ratio.min + ratio.max) / 2;
  }
  return ratio.min ?? ratio.max ?? null;
}

/**
 * Check if rect satisfies aspect ratio.
 * @param rect - Rect to check
 * @param ratio - Target aspect ratio
 * @param tolerance - Allowed deviation (default 0.001)
 * @returns True if rect matches aspect ratio
 */
export function satisfiesAspectRatio(
  rect: Rect,
  ratio: number,
  tolerance = 0.001
): boolean {
  if (rect.width <= 0 || rect.height <= 0) return false;
  const current = rect.width / rect.height;
  return Math.abs(current - ratio) <= tolerance;
}

/**
 * Constrain rect to aspect ratio.
 * @param rect - Rect to constrain
 * @param ratio - Target aspect ratio (null = no constraint)
 * @param bounds - Bounds to stay within
 * @param anchor - Anchor for fitting (default: 'center')
 * @returns Constrained rect
 */
export function constrainRectToAspectRatio(
  rect: Rect,
  ratio: AspectRatio,
  bounds: Rect,
  anchor: 'center' | 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se' = 'center'
): Rect {
  const value = getAspectRatioValue(ratio);
  if (value === null) return rect;
  const fitted = fitRectToAspectRatio(rect, value, anchor);
  return clampRect(fitted, bounds);
}

/**
 * Validate rect against size constraints.
 * @param rect - Rect in image pixels
 * @param constraints - Size constraints
 * @returns Object with valid flag and optional error message
 */
export function validateSizeConstraints(
  rect: Rect,
  constraints: SizeConstraints | undefined
): { valid: boolean; error?: string } {
  if (!constraints) return { valid: true };

  if (constraints.minWidth !== undefined && rect.width < constraints.minWidth) {
    return { valid: false, error: `Width must be at least ${constraints.minWidth}px` };
  }
  if (constraints.maxWidth !== undefined && rect.width > constraints.maxWidth) {
    return { valid: false, error: `Width must be at most ${constraints.maxWidth}px` };
  }
  if (constraints.minHeight !== undefined && rect.height < constraints.minHeight) {
    return { valid: false, error: `Height must be at least ${constraints.minHeight}px` };
  }
  if (constraints.maxHeight !== undefined && rect.height > constraints.maxHeight) {
    return { valid: false, error: `Height must be at most ${constraints.maxHeight}px` };
  }
  if (constraints.minArea !== undefined) {
    const area = rect.width * rect.height;
    if (area < constraints.minArea) {
      return { valid: false, error: `Area must be at least ${constraints.minArea}px²` };
    }
  }

  return { valid: true };
}

/**
 * Apply size constraints to rect (shrink if needed).
 * @param rect - Rect in image pixels
 * @param imageSize - Image dimensions
 * @param constraints - Size constraints
 * @returns Adjusted rect
 */
export function applySizeConstraints(
  rect: Rect,
  imageSize: Size,
  constraints: SizeConstraints | undefined
): Rect {
  if (!constraints) return rect;

  let { width, height } = rect;

  if (constraints.maxWidth !== undefined && width > constraints.maxWidth) {
    const scale = constraints.maxWidth / width;
    width = constraints.maxWidth;
    height *= scale;
  }
  if (constraints.maxHeight !== undefined && height > constraints.maxHeight) {
    const scale = constraints.maxHeight / height;
    height = constraints.maxHeight;
    width *= scale;
  }
  if (constraints.minWidth !== undefined && width < constraints.minWidth) {
    width = constraints.minWidth;
  }
  if (constraints.minHeight !== undefined && height < constraints.minHeight) {
    height = constraints.minHeight;
  }

  const bounds: Rect = { x: 0, y: 0, width: imageSize.width, height: imageSize.height };
  return clampRect({ ...rect, width, height }, bounds);
}
