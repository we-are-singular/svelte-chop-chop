import { describe, it, expect } from 'vitest';
import { createCropEngine } from './crop-engine.svelte.js';
import type { CropEngineOptions } from './crop-engine.svelte.js';

/** Wrap engine creation in $effect.root to satisfy Svelte 5 reactive context requirement. */
function run(
  fn: (engine: ReturnType<typeof createCropEngine>) => void,
  opts: CropEngineOptions = {}
) {
  const cleanup = $effect.root(() => {
    const engine = createCropEngine(opts);
    fn(engine);
  });
  cleanup();
}

/** Helper: set up engine with image and container sizes for common test pattern. */
function runWithImage(
  fn: (engine: ReturnType<typeof createCropEngine>) => void,
  opts: CropEngineOptions = {},
  imageW = 800,
  imageH = 600,
  containerW = 400,
  containerH = 300
) {
  run((engine) => {
    engine.setImageSize({ width: imageW, height: imageH });
    engine.setContainerSize({ width: containerW, height: containerH });
    fn(engine);
  }, opts);
}

describe('createCropEngine', () => {
  it('initialises with default state', () => {
    run((engine) => {
      expect(engine.crop).toEqual({ x: 0, y: 0, width: 0, height: 0 });
      expect(engine.interacting).toBe(false);
    });
  });

  it('sets image and container size and initialises crop', () => {
    runWithImage((engine) => {
      expect(engine.crop.width).toBeGreaterThan(0);
      expect(engine.crop.height).toBeGreaterThan(0);
    });
  });

  it('fitToImage fills the image bounds', () => {
    runWithImage((engine) => {
      engine.fitToImage();
      expect(engine.crop.width).toBeCloseTo(engine.imageRect.width, 0);
      expect(engine.crop.height).toBeCloseTo(engine.imageRect.height, 0);
    });
  });

  it('fitToImage respects aspect ratio', () => {
    runWithImage(
      (engine) => {
        engine.fitToImage();
        const ratio = engine.crop.width / engine.crop.height;
        expect(ratio).toBeCloseTo(1, 1);
      },
      { aspectRatio: 1 }
    );
  });

  it('moveBy shifts crop position', () => {
    runWithImage((engine) => {
      // Set a smaller crop so there's room to move
      engine.setCrop({
        x: engine.imageRect.x + 10,
        y: engine.imageRect.y + 10,
        width: engine.imageRect.width - 40,
        height: engine.imageRect.height - 40,
      });

      const before = { ...engine.crop };
      engine.moveBy({ x: 5, y: 5 });
      expect(engine.crop.x).toBeCloseTo(before.x + 5, 0);
      expect(engine.crop.y).toBeCloseTo(before.y + 5, 0);
    });
  });

  it('moveBy clamps to bounds', () => {
    runWithImage((engine) => {
      engine.moveBy({ x: 9999, y: 9999 });
      expect(engine.crop.x + engine.crop.width).toBeLessThanOrEqual(
        engine.imageRect.x + engine.imageRect.width + 1
      );
    });
  });

  it('resizeBy adjusts width from east handle', () => {
    runWithImage((engine) => {
      // Shrink crop to give room to grow
      engine.setCrop({
        x: engine.imageRect.x + 10,
        y: engine.imageRect.y + 10,
        width: engine.imageRect.width - 40,
        height: engine.imageRect.height - 40,
      });

      const widthBefore = engine.crop.width;
      engine.resizeBy('e', { x: 10, y: 0 });
      expect(engine.crop.width).toBeCloseTo(widthBefore + 10, 0);
    });
  });

  it('resizeBy ignores invalid handle', () => {
    runWithImage((engine) => {
      const before = { ...engine.crop };
      engine.resizeBy('invalid', { x: 10, y: 10 });
      expect(engine.crop).toEqual(before);
    });
  });

  it('setAspectRatio refits crop', () => {
    runWithImage((engine) => {
      engine.setAspectRatio(16 / 9);
      const ratio = engine.crop.width / engine.crop.height;
      expect(ratio).toBeCloseTo(16 / 9, 1);
    });
  });

  it('setAspectRatio no-ops when value unchanged', () => {
    runWithImage(
      (engine) => {
        const before = { ...engine.crop };
        engine.setAspectRatio(1);
        expect(engine.crop).toEqual(before);
      },
      { aspectRatio: 1 }
    );
  });

  it('scaleBy enlarges crop from center', () => {
    runWithImage((engine) => {
      engine.setCrop({
        x: engine.imageRect.x + 50,
        y: engine.imageRect.y + 50,
        width: engine.imageRect.width - 100,
        height: engine.imageRect.height - 100,
      });

      const widthBefore = engine.crop.width;
      engine.scaleBy(1.2);
      expect(engine.crop.width).toBeGreaterThan(widthBefore);
    });
  });

  it('scaleBy rejects below minimum size', () => {
    runWithImage((engine) => {
      engine.setCrop({ x: 100, y: 100, width: 25, height: 25 });
      const before = { ...engine.crop };
      engine.scaleBy(0.1);
      expect(engine.crop).toEqual(before);
    });
  });

  it('setInteracting toggles interacting state', () => {
    run((engine) => {
      expect(engine.interacting).toBe(false);
      engine.setInteracting(true);
      expect(engine.interacting).toBe(true);
      engine.setInteracting(false);
      expect(engine.interacting).toBe(false);
    });
  });

  it('coordinates are computed correctly', () => {
    runWithImage((engine) => {
      const coords = engine.coordinates;
      expect(coords).toHaveProperty('normalized');
      expect(coords).toHaveProperty('pixels');
      expect(coords).toHaveProperty('viewport');
      expect(coords.normalized.width).toBeGreaterThan(0);
      expect(coords.pixels.width).toBeGreaterThan(0);
    });
  });

  it('cropOutsideImage allows crop beyond image bounds', () => {
    runWithImage(
      (engine) => {
        engine.setCrop({ x: -100, y: -100, width: 600, height: 500 });
        expect(engine.crop.width).toBe(600);
      },
      { cropOutsideImage: true }
    );
  });
});
