/**
 * svelte-chop-chop — Coordinate system math
 * Pure functions for viewport ↔ image coordinate transforms, rect fitting, clamping.
 */

import type { Point, Rect, Size, TransformState } from './types.js';

/** Anchor point for fitRectToAspectRatio */
export type Anchor = 'center' | 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

/**
 * Convert a point from viewport space to image space (0-1 normalized).
 * @param point - Point in viewport coordinates
 * @param imageRect - Image position/size in viewport
 * @returns Point in image space (0-1)
 */
export function viewportToImage(
  point: Point,
  imageRect: Rect
): Point {
  if (imageRect.width <= 0 || imageRect.height <= 0) {
    throw new Error('imageRect must have positive width and height');
  }
  return {
    x: (point.x - imageRect.x) / imageRect.width,
    y: (point.y - imageRect.y) / imageRect.height,
  };
}

/**
 * Convert a point from image space (0-1) to viewport space.
 * @param point - Point in image space (0-1)
 * @param imageRect - Image position/size in viewport
 * @returns Point in viewport coordinates
 */
export function imageToViewport(
  point: Point,
  imageRect: Rect
): Point {
  return {
    x: imageRect.x + point.x * imageRect.width,
    y: imageRect.y + point.y * imageRect.height,
  };
}

/**
 * Normalize a rect to 0-1 range relative to image size.
 * @param rect - Rect in image pixels
 * @param imageSize - Original image dimensions
 * @returns Rect in 0-1 normalized space
 */
export function normalizeRect(rect: Rect, imageSize: Size): Rect {
  if (imageSize.width <= 0 || imageSize.height <= 0) {
    throw new Error('imageSize must have positive width and height');
  }
  return {
    x: rect.x / imageSize.width,
    y: rect.y / imageSize.height,
    width: rect.width / imageSize.width,
    height: rect.height / imageSize.height,
  };
}

/**
 * Convert a normalized rect (0-1) back to image pixels.
 * @param rect - Rect in 0-1 normalized space
 * @param imageSize - Original image dimensions
 * @returns Rect in image pixels
 */
export function denormalizeRect(rect: Rect, imageSize: Size): Rect {
  return {
    x: rect.x * imageSize.width,
    y: rect.y * imageSize.height,
    width: rect.width * imageSize.width,
    height: rect.height * imageSize.height,
  };
}

/**
 * Clamp rect to stay within bounds.
 * @param rect - Rect to clamp
 * @param bounds - Bounding rect
 * @returns Clamped rect
 */
export function clampRect(rect: Rect, bounds: Rect): Rect {
  let { x, y, width, height } = rect;

  width = Math.min(width, bounds.width);
  height = Math.min(height, bounds.height);

  x = Math.max(bounds.x, Math.min(x, bounds.x + bounds.width - width));
  y = Math.max(bounds.y, Math.min(y, bounds.y + bounds.height - height));

  return { x, y, width, height };
}

/**
 * Fit a rect to an aspect ratio, anchoring at center by default.
 * @param rect - Rect to fit
 * @param ratio - Target aspect ratio (width/height)
 * @param anchor - Anchor point (default: 'center')
 * @returns Fitted rect
 */
export function fitRectToAspectRatio(
  rect: Rect,
  ratio: number,
  anchor: Anchor = 'center'
): Rect {
  if (ratio <= 0) {
    throw new Error('ratio must be positive');
  }
  const currentRatio = rect.width / rect.height;
  let newWidth = rect.width;
  let newHeight = rect.height;

  if (currentRatio > ratio) {
    newWidth = rect.height * ratio;
  } else {
    newHeight = rect.width / ratio;
  }

  let dx = rect.width - newWidth;
  let dy = rect.height - newHeight;

  switch (anchor) {
    case 'center':
      return {
        x: rect.x + dx / 2,
        y: rect.y + dy / 2,
        width: newWidth,
        height: newHeight,
      };
    case 'n':
      return { x: rect.x + dx / 2, y: rect.y, width: newWidth, height: newHeight };
    case 's':
      return { x: rect.x + dx / 2, y: rect.y + dy, width: newWidth, height: newHeight };
    case 'e':
      return { x: rect.x + dx, y: rect.y + dy / 2, width: newWidth, height: newHeight };
    case 'w':
      return { x: rect.x, y: rect.y + dy / 2, width: newWidth, height: newHeight };
    case 'nw':
      return { x: rect.x, y: rect.y, width: newWidth, height: newHeight };
    case 'ne':
      return { x: rect.x + dx, y: rect.y, width: newWidth, height: newHeight };
    case 'sw':
      return { x: rect.x, y: rect.y + dy, width: newWidth, height: newHeight };
    case 'se':
      return { x: rect.x + dx, y: rect.y + dy, width: newWidth, height: newHeight };
    default:
      return {
        x: rect.x + dx / 2,
        y: rect.y + dy / 2,
        width: newWidth,
        height: newHeight,
      };
  }
}

/**
 * Calculate image rect that fits inside container while preserving aspect ratio.
 * @param imageSize - Original image dimensions
 * @param containerSize - Container dimensions
 * @returns Rect for image in viewport (letterbox/pillarbox)
 */
export function fitImageToContainer(imageSize: Size, containerSize: Size): Rect {
  if (imageSize.width <= 0 || imageSize.height <= 0) {
    throw new Error('imageSize must have positive dimensions');
  }
  if (containerSize.width <= 0 || containerSize.height <= 0) {
    throw new Error('containerSize must have positive dimensions');
  }

  const imageAspect = imageSize.width / imageSize.height;
  const containerAspect = containerSize.width / containerSize.height;

  let width: number;
  let height: number;
  if (imageAspect > containerAspect) {
    width = containerSize.width;
    height = width / imageAspect;
  } else {
    height = containerSize.height;
    width = height * imageAspect;
  }

  return {
    x: (containerSize.width - width) / 2,
    y: (containerSize.height - height) / 2,
    width,
    height,
  };
}

/**
 * Apply transform (rotation, flip, zoom, pan) to a point.
 * @param point - Point to transform
 * @param transform - Transform state
 * @param center - Center point for rotation
 * @returns Transformed point
 */
export function applyTransformToPoint(
  point: Point,
  transform: TransformState,
  center: Point
): Point {
  let { x, y } = point;

  x -= center.x;
  y -= center.y;

  const rad = (transform.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rx = x * cos - y * sin;
  const ry = x * sin + y * cos;

  x = rx * (transform.flipX ? -1 : 1);
  y = ry * (transform.flipY ? -1 : 1);

  x = x * transform.zoom + center.x + transform.pan.x;
  y = y * transform.zoom + center.y + transform.pan.y;

  return { x, y };
}
