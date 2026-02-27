/**
 * svelte-chop-chop — Color matrix utilities for filters
 * 4x5 matrix application and preset matrices.
 */

/**
 * Apply a 4x5 color matrix to ImageData.
 */
export function applyColorMatrix(imageData: ImageData, matrix: number[]): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    data[i] = clamp255(
      matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3] * a + matrix[4]
    );
    data[i + 1] = clamp255(
      matrix[5] * r + matrix[6] * g + matrix[7] * b + matrix[8] * a + matrix[9]
    );
    data[i + 2] = clamp255(
      matrix[10] * r + matrix[11] * g + matrix[12] * b + matrix[13] * a + matrix[14]
    );
    data[i + 3] = clamp255(
      matrix[15] * r + matrix[16] * g + matrix[17] * b + matrix[18] * a + matrix[19]
    );
  }
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

/**
 * Combine multiple 4x5 matrices by multiplication.
 */
export function multiplyMatrices(a: number[], b: number[]): number[] {
  const result = new Array(20).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row * 5 + k] * b[k * 5 + col];
      }
      if (col === 4) sum += a[row * 5 + 4];
      result[row * 5 + col] = sum;
    }
  }
  return result;
}

/** Brightness matrix (value: -100 to 100) */
export function brightnessMatrix(value: number): number[] {
  const v = value / 100;
  return [
    1, 0, 0, 0, v * 255,
    0, 1, 0, 0, v * 255,
    0, 0, 1, 0, v * 255,
    0, 0, 0, 1, 0,
  ];
}

/** Contrast matrix (value: -100 to 100) */
export function contrastMatrix(value: number): number[] {
  const factor = value / 100 + 1;
  const offset = 128 * (1 - factor);
  return [
    factor, 0, 0, 0, offset,
    0, factor, 0, 0, offset,
    0, 0, factor, 0, offset,
    0, 0, 0, 1, 0,
  ];
}

/** Saturation matrix (value: -100 to 100) */
export function saturationMatrix(value: number): number[] {
  const s = value / 100 + 1;
  const invS = 1 - s;
  const r = 0.2126 * invS;
  const g = 0.7152 * invS;
  const b = 0.0722 * invS;
  return [
    r + s, g, b, 0, 0,
    r, g + s, b, 0, 0,
    r, g, b + s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

/**
 * Exposure matrix (value: -100 to 100).
 * Simulates photographic exposure via a power-of-2 gain on all channels.
 */
export function exposureMatrix(value: number): number[] {
  const factor = Math.pow(2, value / 100);
  return [
    factor, 0, 0, 0, 0,
    0, factor, 0, 0, 0,
    0, 0, factor, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

/**
 * Temperature matrix (value: -100 cool to 100 warm).
 * Shifts red/blue channels in opposite directions.
 */
export function temperatureMatrix(value: number): number[] {
  const warm = (value / 100) * 30;
  return [
    1, 0, 0, 0, warm,
    0, 1, 0, 0, warm * 0.15,
    0, 0, 1, 0, -warm,
    0, 0, 0, 1, 0,
  ];
}

/**
 * Clarity matrix (value: 0 to 100).
 * Increases midtone contrast to add presence/structure.
 */
export function clarityMatrix(value: number): number[] {
  const factor = 1 + (value / 100) * 0.5;
  const offset = 128 * (1 - factor);
  return [
    factor, 0, 0, 0, offset,
    0, factor, 0, 0, offset,
    0, 0, factor, 0, offset,
    0, 0, 0, 1, 0,
  ];
}

/**
 * Apply a non-linear gamma correction directly to ImageData.
 * @param imageData - The ImageData to mutate in-place.
 * @param gamma    - Gamma value (1 = no change, <1 = lighter, >1 = darker).
 */
export function applyGamma(imageData: ImageData, gamma: number): void {
  if (gamma === 1) return;
  const data = imageData.data;
  const invGamma = 1 / gamma;
  // Pre-compute lookup table for performance
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(Math.pow(i / 255, invGamma) * 255);
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
}
