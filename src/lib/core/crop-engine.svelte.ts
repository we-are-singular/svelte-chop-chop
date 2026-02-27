/**
 * svelte-chop-chop — Crop state machine
 * Manages crop rect, enforces constraints, handles move/resize deltas.
 */

import type {
  AspectRatio,
  CropCoordinates,
  Point,
  Rect,
  Size,
  SizeConstraints,
} from './types.js';
import {
  clampRect,
  denormalizeRect,
  fitImageToContainer,
  fitRectToAspectRatio,
} from './coordinate-system.js';
import {
  constrainRectToAspectRatio,
  getAspectRatioValue,
} from './constraints.js';

export interface CropEngineOptions {
  aspectRatio?: AspectRatio;
  sizeConstraints?: SizeConstraints;
  initialCrop?: Partial<Rect>;
  cropOutsideImage?: boolean;
  onChange?: (coordinates: CropCoordinates) => void;
}

const DEFAULT_RECT: Rect = { x: 0, y: 0, width: 0, height: 0 };

/**
 * Create crop engine composable.
 * Manages crop rect in viewport coordinates, enforces aspect ratio and bounds.
 */
export function createCropEngine(options: CropEngineOptions = {}) {
  let cropRect = $state<Rect>({ ...DEFAULT_RECT });
  let aspectRatio = $state<AspectRatio>(options.aspectRatio ?? null);
  let interacting = $state(false);
  let imageSize = $state<Size>({ width: 1, height: 1 });
  let imageRect = $state<Rect>({ ...DEFAULT_RECT });
  let containerSize = $state<Size>({ width: 1, height: 1 });

  const cropOutsideImage = options.cropOutsideImage ?? false;
  const bounds = $derived(cropOutsideImage
    ? ({ x: -Infinity, y: -Infinity, width: Infinity, height: Infinity } satisfies Rect)
    : imageRect);

  const coordinates = $derived(computeCoordinates(cropRect, imageRect, imageSize));

  $effect(() => {
    options.onChange?.(coordinates);
  });

  function computeCoordinates(
    rect: Rect,
    imgRect: Rect,
    imgSize: Size
  ): CropCoordinates {
    if (imgRect.width <= 0 || imgRect.height <= 0) {
      return {
        normalized: { x: 0, y: 0, width: 1, height: 1 },
        pixels: { x: 0, y: 0, width: imgSize.width, height: imgSize.height },
        viewport: rect,
      };
    }

    const normalized: Rect = {
      x: (rect.x - imgRect.x) / imgRect.width,
      y: (rect.y - imgRect.y) / imgRect.height,
      width: rect.width / imgRect.width,
      height: rect.height / imgRect.height,
    };

    const pixels = denormalizeRect(normalized, imgSize);

    return {
      normalized,
      pixels,
      viewport: rect,
    };
  }

  function setImageSize(size: Size): void {
    imageSize = size;
  }

  function setContainerSize(size: Size): void {
    containerSize = size;
    if (imageSize.width > 0 && imageSize.height > 0) {
      imageRect = fitImageToContainer(imageSize, size);
      initCropRectIfNeeded();
    }
  }

  function initCropRectIfNeeded(): void {
    if (cropRect.width > 0 && cropRect.height > 0) return;
    fitToImage();
  }

  function fitToImage(): void {
    let rect = { ...bounds };
    const ratio = getAspectRatioValue(aspectRatio);
    if (ratio !== null) {
      rect = fitRectToAspectRatio(rect, ratio);
    }
    cropRect = rect;
  }

  function setCrop(rect: Partial<Rect>): void {
    const next = { ...cropRect, ...rect };
    cropRect = constrainRectToAspectRatio(next, aspectRatio, bounds);
  }

  function moveBy(delta: Point): void {
    cropRect = clampRect(
      {
        ...cropRect,
        x: cropRect.x + delta.x,
        y: cropRect.y + delta.y,
      },
      bounds
    );
  }

  function resizeBy(handle: string, delta: Point): void {
    let { x, y, width, height } = cropRect;
    const ratio = getAspectRatioValue(aspectRatio);

    const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
    if (!handles.includes(handle)) return;

    if (handle.includes('e')) {
      width += delta.x;
    }
    if (handle.includes('w')) {
      x += delta.x;
      width -= delta.x;
    }
    if (handle.includes('s')) {
      height += delta.y;
    }
    if (handle.includes('n')) {
      y += delta.y;
      height -= delta.y;
    }

    if (ratio !== null && width > 0 && height > 0) {
      const currentRatio = width / height;
      if (Math.abs(currentRatio - ratio) > 0.001) {
        if (currentRatio > ratio) {
          height = width / ratio;
        } else {
          width = height * ratio;
        }
      }
    }

    let newRect = { x, y, width, height };
    newRect = clampRect(newRect, bounds);
    if (newRect.width > 0 && newRect.height > 0) {
      cropRect = newRect;
    }
  }

  function setAspectRatio(ratio: AspectRatio): void {
    const currentVal = getAspectRatioValue(aspectRatio);
    const newVal = getAspectRatioValue(ratio);
    if (currentVal === newVal) return;
    aspectRatio = ratio;
    fitToImage();
  }

  /**
   * Scale the crop rect uniformly from its centre.
   * Used for wheel/pinch zoom within the crop view.
   */
  function scaleBy(factor: number): void {
    const MIN_SIZE = 20;
    const cx = cropRect.x + cropRect.width / 2;
    const cy = cropRect.y + cropRect.height / 2;
    let newW = cropRect.width * factor;
    let newH = cropRect.height * factor;

    const ratio = getAspectRatioValue(aspectRatio);
    if (ratio !== null) {
      newH = newW / ratio;
    }

    if (newW < MIN_SIZE || newH < MIN_SIZE) return;
    if (!cropOutsideImage) {
      newW = Math.min(newW, bounds.width);
      newH = Math.min(newH, bounds.height);
    }

    let newRect: Rect = {
      x: cx - newW / 2,
      y: cy - newH / 2,
      width: newW,
      height: newH,
    };
    if (!cropOutsideImage) {
      newRect = clampRect(newRect, imageRect);
    }
    if (newRect.width > 0 && newRect.height > 0) {
      cropRect = newRect;
    }
  }

  function setInteracting(value: boolean): void {
    interacting = value;
  }

  return {
    get crop() {
      return cropRect;
    },
    get coordinates() {
      return coordinates;
    },
    get interacting() {
      return interacting;
    },
    get imageRect() {
      return imageRect;
    },
    get imageSize() {
      return imageSize;
    },
    get bounds() {
      return bounds;
    },
    setImageSize,
    setContainerSize,
    setCrop,
    moveBy,
    resizeBy,
    setAspectRatio,
    setInteracting,
    scaleBy,
    fitToImage,
  };
}
