import { describe, it, expect } from 'vitest';
import {
  applyColorMatrix,
  applyGamma,
  multiplyMatrices,
  brightnessMatrix,
  contrastMatrix,
  saturationMatrix,
  exposureMatrix,
  temperatureMatrix,
  clarityMatrix,
} from './color-matrix.js';

// Identity matrix: no transformation
const IDENTITY = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

/** Create a 1-pixel ImageData with given RGBA values. */
function makePixel(r: number, g: number, b: number, a = 255): ImageData {
  const data = new Uint8ClampedArray([r, g, b, a]);
  return { data, width: 1, height: 1, colorSpace: 'srgb' } as ImageData;
}

describe('applyColorMatrix', () => {
  it('identity matrix leaves pixel unchanged', () => {
    const img = makePixel(128, 64, 32, 255);
    applyColorMatrix(img, IDENTITY);
    expect(img.data[0]).toBe(128);
    expect(img.data[1]).toBe(64);
    expect(img.data[2]).toBe(32);
    expect(img.data[3]).toBe(255);
  });

  it('clamps values above 255', () => {
    const boost = [...IDENTITY];
    boost[4] = 300; // red offset
    const img = makePixel(200, 0, 0);
    applyColorMatrix(img, boost);
    expect(img.data[0]).toBe(255);
  });

  it('clamps values below 0', () => {
    const dim = [...IDENTITY];
    dim[4] = -300; // red offset
    const img = makePixel(50, 0, 0);
    applyColorMatrix(img, dim);
    expect(img.data[0]).toBe(0);
  });
});

describe('multiplyMatrices', () => {
  it('identity * identity = identity', () => {
    const result = multiplyMatrices(IDENTITY, IDENTITY);
    for (let i = 0; i < 20; i++) {
      expect(result[i]).toBeCloseTo(IDENTITY[i], 10);
    }
  });

  it('identity * M = M', () => {
    const m = brightnessMatrix(50);
    const result = multiplyMatrices(IDENTITY, m);
    for (let i = 0; i < 20; i++) {
      expect(result[i]).toBeCloseTo(m[i], 10);
    }
  });
});

describe('brightnessMatrix', () => {
  it('zero returns identity-like matrix', () => {
    const m = brightnessMatrix(0);
    expect(m[0]).toBe(1); // diagonal
    expect(m[4]).toBe(0); // offset
  });

  it('positive shifts channels up', () => {
    const m = brightnessMatrix(100);
    expect(m[4]).toBe(255);
    expect(m[9]).toBe(255);
    expect(m[14]).toBe(255);
  });

  it('negative shifts channels down', () => {
    const m = brightnessMatrix(-100);
    expect(m[4]).toBe(-255);
  });
});

describe('contrastMatrix', () => {
  it('zero returns identity-like matrix', () => {
    const m = contrastMatrix(0);
    expect(m[0]).toBeCloseTo(1);
    expect(m[4]).toBeCloseTo(0);
  });

  it('positive increases contrast', () => {
    const m = contrastMatrix(50);
    expect(m[0]).toBeGreaterThan(1);
  });
});

describe('saturationMatrix', () => {
  it('zero returns identity-like matrix', () => {
    const m = saturationMatrix(0);
    // With s=1, diagonal should be r+s, g+s, b+s ≈ ~1
    expect(m[0]).toBeCloseTo(1, 1);
    expect(m[6]).toBeCloseTo(1, 1);
    expect(m[12]).toBeCloseTo(1, 1);
  });

  it('-100 fully desaturates', () => {
    const m = saturationMatrix(-100);
    // s=0, so all channels become luminance coefficients
    expect(m[0]).toBeCloseTo(0.2126);
    expect(m[1]).toBeCloseTo(0.7152);
    expect(m[2]).toBeCloseTo(0.0722);
  });
});

describe('exposureMatrix', () => {
  it('zero returns identity', () => {
    const m = exposureMatrix(0);
    expect(m[0]).toBeCloseTo(1);
  });

  it('positive doubles exposure at 100', () => {
    const m = exposureMatrix(100);
    expect(m[0]).toBeCloseTo(2);
  });
});

describe('temperatureMatrix', () => {
  it('zero returns identity offsets', () => {
    const m = temperatureMatrix(0);
    expect(m[4]).toBe(0);
    expect(m[14]).toBeCloseTo(0);
  });

  it('warm shifts red up and blue down', () => {
    const m = temperatureMatrix(100);
    expect(m[4]).toBeGreaterThan(0);  // red offset up
    expect(m[14]).toBeLessThan(0);    // blue offset down
  });
});

describe('clarityMatrix', () => {
  it('zero returns identity-like matrix', () => {
    const m = clarityMatrix(0);
    expect(m[0]).toBeCloseTo(1);
    expect(m[4]).toBeCloseTo(0);
  });

  it('positive increases midtone contrast', () => {
    const m = clarityMatrix(100);
    expect(m[0]).toBeGreaterThan(1);
  });
});

describe('applyGamma', () => {
  it('gamma 1 leaves pixel unchanged', () => {
    const img = makePixel(128, 64, 32);
    applyGamma(img, 1);
    expect(img.data[0]).toBe(128);
    expect(img.data[1]).toBe(64);
    expect(img.data[2]).toBe(32);
  });

  it('gamma < 1 darkens (invGamma > 1)', () => {
    const img = makePixel(128, 128, 128);
    applyGamma(img, 0.5);
    expect(img.data[0]).toBeLessThan(128);
  });

  it('gamma > 1 lightens (invGamma < 1)', () => {
    const img = makePixel(128, 128, 128);
    applyGamma(img, 2);
    expect(img.data[0]).toBeGreaterThan(128);
  });

  it('does not modify alpha channel', () => {
    const img = makePixel(128, 128, 128, 200);
    applyGamma(img, 0.5);
    expect(img.data[3]).toBe(200);
  });

  it('extremes: 0 stays 0, 255 stays 255', () => {
    const img = makePixel(0, 255, 128);
    applyGamma(img, 2.2);
    expect(img.data[0]).toBe(0);
    expect(img.data[1]).toBe(255);
  });
});
