import { describe, it, expect } from 'vitest';
import {
  fitImageToContainer,
  normalizeRect,
  denormalizeRect,
  clampRect,
  fitRectToAspectRatio,
  viewportToImage,
  imageToViewport,
} from './coordinate-system.js';

describe('fitImageToContainer', () => {
  it('should letterbox a wide image in a tall container', () => {
    const result = fitImageToContainer(
      { width: 1920, height: 1080 },
      { width: 400, height: 600 }
    );
    expect(result.width).toBe(400);
    expect(result.height).toBeCloseTo(225);
    expect(result.x).toBe(0);
    expect(result.y).toBeCloseTo(187.5);
  });

  it('should pillarbox a tall image in a wide container', () => {
    const result = fitImageToContainer(
      { width: 1080, height: 1920 },
      { width: 600, height: 400 }
    );
    expect(result.height).toBe(400);
    expect(result.width).toBeCloseTo(225);
    expect(result.x).toBeCloseTo(187.5);
    expect(result.y).toBe(0);
  });

  it('should center the image', () => {
    const result = fitImageToContainer(
      { width: 1920, height: 1080 },
      { width: 400, height: 600 }
    );
    expect(result.x).toBe(0);
    expect(result.y).toBeCloseTo((600 - 225) / 2);
  });
});

describe('normalizeRect', () => {
  it('should normalize rect to 0-1 range', () => {
    const result = normalizeRect(
      { x: 100, y: 200, width: 400, height: 300 },
      { width: 800, height: 600 }
    );
    expect(result.x).toBe(0.125);
    expect(result.y).toBeCloseTo(0.333, 2);
    expect(result.width).toBe(0.5);
    expect(result.height).toBe(0.5);
  });
});

describe('denormalizeRect', () => {
  it('should convert normalized rect to pixels', () => {
    const result = denormalizeRect(
      { x: 0.125, y: 0.25, width: 0.5, height: 0.5 },
      { width: 800, height: 600 }
    );
    expect(result.x).toBe(100);
    expect(result.y).toBe(150);
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });
});

describe('clampRect', () => {
  it('should clamp rect within bounds', () => {
    const result = clampRect(
      { x: -10, y: -10, width: 100, height: 100 },
      { x: 0, y: 0, width: 500, height: 500 }
    );
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  it('should shrink rect that exceeds bounds', () => {
    const result = clampRect(
      { x: 0, y: 0, width: 1000, height: 1000 },
      { x: 0, y: 0, width: 500, height: 500 }
    );
    expect(result.width).toBe(500);
    expect(result.height).toBe(500);
  });

  it('should clamp position when rect would overflow', () => {
    const result = clampRect(
      { x: 400, y: 400, width: 100, height: 100 },
      { x: 0, y: 0, width: 500, height: 500 }
    );
    expect(result.x).toBe(400);
    expect(result.y).toBe(400);
  });
});

describe('fitRectToAspectRatio', () => {
  it('should fit wide rect to square', () => {
    const result = fitRectToAspectRatio(
      { x: 0, y: 0, width: 200, height: 100 },
      1
    );
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
    expect(result.x).toBe(50);
    expect(result.y).toBe(0);
  });

  it('should fit tall rect to square', () => {
    const result = fitRectToAspectRatio(
      { x: 0, y: 0, width: 100, height: 200 },
      1
    );
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
    expect(result.x).toBe(0);
    expect(result.y).toBe(50);
  });
});

describe('viewportToImage', () => {
  it('should convert viewport point to image space', () => {
    const imageRect = { x: 50, y: 50, width: 200, height: 100 };
    const result = viewportToImage({ x: 150, y: 75 }, imageRect);
    expect(result.x).toBe(0.5);
    expect(result.y).toBe(0.25);
  });
});

describe('imageToViewport', () => {
  it('should convert image point to viewport space', () => {
    const imageRect = { x: 50, y: 50, width: 200, height: 100 };
    const result = imageToViewport({ x: 0.5, y: 0.25 }, imageRect);
    expect(result.x).toBe(150);
    expect(result.y).toBe(75);
  });
});
