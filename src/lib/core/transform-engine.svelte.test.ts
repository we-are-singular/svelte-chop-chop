import { describe, it, expect } from 'vitest';
import { createTransformEngine } from './transform-engine.svelte.js';
import { flushSync } from 'svelte';

/** Wrap engine creation in $effect.root to satisfy Svelte 5 reactive context requirement. */
function withEngine(
  opts: Parameters<typeof createTransformEngine>[0],
  fn: (engine: ReturnType<typeof createTransformEngine>) => void
) {
  let cleanup: () => void;
  const root = $effect.root(() => {
    const engine = createTransformEngine(opts);
    fn(engine);
    return () => {};
  });
  root();
}

/** Shorthand for default-options engine. */
function run(fn: (engine: ReturnType<typeof createTransformEngine>) => void) {
  withEngine({}, fn);
}

describe('createTransformEngine', () => {
  it('initialises with default transforms', () => {
    run((engine) => {
      expect(engine.transforms).toEqual({
        rotation: 0,
        flipX: false,
        flipY: false,
        zoom: 1,
        pan: { x: 0, y: 0 },
      });
    });
  });

  it('accepts initial transforms', () => {
    withEngine({ initialTransforms: { rotation: 90, flipX: true } }, (engine) => {
      expect(engine.transforms.rotation).toBe(90);
      expect(engine.transforms.flipX).toBe(true);
      expect(engine.transforms.flipY).toBe(false);
    });
  });

  it('rotate adds degrees', () => {
    run((engine) => {
      engine.rotate(90);
      expect(engine.transforms.rotation).toBe(90);
      engine.rotate(90);
      expect(engine.transforms.rotation).toBe(180);
    });
  });

  it('setRotation wraps to 0-359', () => {
    run((engine) => {
      engine.setRotation(450);
      expect(engine.transforms.rotation).toBe(90);
    });
  });

  it('setRotation handles negative values', () => {
    run((engine) => {
      engine.setRotation(-90);
      expect(engine.transforms.rotation).toBe(270);
    });
  });

  it('flipX toggles', () => {
    run((engine) => {
      expect(engine.transforms.flipX).toBe(false);
      engine.flipX();
      expect(engine.transforms.flipX).toBe(true);
      engine.flipX();
      expect(engine.transforms.flipX).toBe(false);
    });
  });

  it('flipY toggles', () => {
    run((engine) => {
      engine.flipY();
      expect(engine.transforms.flipY).toBe(true);
    });
  });

  it('setZoom clamps to range', () => {
    withEngine({ minZoom: 0.5, maxZoom: 5 }, (engine) => {
      engine.setZoom(10);
      expect(engine.transforms.zoom).toBe(5);
      engine.setZoom(0.1);
      expect(engine.transforms.zoom).toBe(0.5);
    });
  });

  it('zoomBy multiplies', () => {
    run((engine) => {
      engine.setZoom(2);
      engine.zoomBy(0.5); // zoom * 1.5 = 3
      expect(engine.transforms.zoom).toBe(3);
    });
  });

  it('setPan sets exact value', () => {
    run((engine) => {
      engine.setPan({ x: 50, y: 100 });
      expect(engine.transforms.pan).toEqual({ x: 50, y: 100 });
    });
  });

  it('panBy adds delta', () => {
    run((engine) => {
      engine.setPan({ x: 10, y: 20 });
      engine.panBy({ x: 5, y: -10 });
      expect(engine.transforms.pan).toEqual({ x: 15, y: 10 });
    });
  });

  it('center resets pan to origin', () => {
    run((engine) => {
      engine.setPan({ x: 100, y: 200 });
      engine.center();
      expect(engine.transforms.pan).toEqual({ x: 0, y: 0 });
    });
  });

  it('reset restores defaults', () => {
    run((engine) => {
      engine.rotate(45);
      engine.flipX();
      engine.setZoom(3);
      engine.setPan({ x: 10, y: 20 });

      engine.reset();
      expect(engine.transforms).toEqual({
        rotation: 0,
        flipX: false,
        flipY: false,
        zoom: 1,
        pan: { x: 0, y: 0 },
      });
    });
  });
});
