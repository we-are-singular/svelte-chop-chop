import { describe, it, expect } from 'vitest';
import { createHistoryManager } from './history-manager.svelte.js';
import type { EditorSnapshot } from './types.js';
import type { HistoryManagerOptions } from './history-manager.svelte.js';

function makeSnapshot(overrides: Partial<EditorSnapshot> = {}): EditorSnapshot {
  return {
    crop: { x: 0, y: 0, width: 100, height: 100 },
    transforms: {
      rotation: 0,
      flipX: false,
      flipY: false,
      zoom: 1,
      pan: { x: 0, y: 0 },
    },
    filters: {
      preset: null,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      temperature: 0,
      clarity: 0,
      gamma: 1,
    },
    ...overrides,
  };
}

/** Wrap in $effect.root to satisfy Svelte 5 reactive context requirement. */
function run(
  fn: (hm: ReturnType<typeof createHistoryManager>) => void,
  opts: HistoryManagerOptions = {}
) {
  const cleanup = $effect.root(() => {
    const hm = createHistoryManager(opts);
    fn(hm);
  });
  cleanup();
}

describe('createHistoryManager', () => {
  it('starts with empty state', () => {
    run((hm) => {
      expect(hm.canUndo).toBe(false);
      expect(hm.canRedo).toBe(false);
      expect(hm.current).toBeNull();
      expect(hm.entries).toEqual([]);
    });
  });

  it('push adds entry and updates index', () => {
    run((hm) => {
      hm.push('initial', makeSnapshot());
      expect(hm.entries.length).toBe(1);
      expect(hm.current).not.toBeNull();
      expect(hm.current?.label).toBe('initial');
    });
  });

  it('undo returns previous state', () => {
    run((hm) => {
      const snap1 = makeSnapshot();
      const snap2 = makeSnapshot({ crop: { x: 10, y: 10, width: 50, height: 50 } });

      hm.push('first', snap1);
      hm.push('second', snap2);

      expect(hm.canUndo).toBe(true);
      const result = hm.undo();
      expect(result).not.toBeNull();
      expect(result!.crop).toEqual(snap1.crop);
      expect(hm.current?.label).toBe('first');
    });
  });

  it('redo returns next state', () => {
    run((hm) => {
      const snap1 = makeSnapshot();
      const snap2 = makeSnapshot({ crop: { x: 10, y: 10, width: 50, height: 50 } });

      hm.push('first', snap1);
      hm.push('second', snap2);

      hm.undo();
      expect(hm.canRedo).toBe(true);

      const result = hm.redo();
      expect(result!.crop).toEqual(snap2.crop);
      expect(hm.current?.label).toBe('second');
    });
  });

  it('undo at beginning returns null', () => {
    run((hm) => {
      hm.push('only', makeSnapshot());
      expect(hm.undo()).toBeNull();
    });
  });

  it('redo at end returns null', () => {
    run((hm) => {
      hm.push('only', makeSnapshot());
      expect(hm.redo()).toBeNull();
    });
  });

  it('push after undo truncates redo stack', () => {
    run((hm) => {
      hm.push('a', makeSnapshot());
      hm.push('b', makeSnapshot());
      hm.push('c', makeSnapshot());

      hm.undo();
      hm.push('d', makeSnapshot());

      expect(hm.entries.length).toBe(3);
      expect(hm.entries[2].label).toBe('d');
      expect(hm.canRedo).toBe(false);
    });
  });

  it('respects maxEntries limit', () => {
    run(
      (hm) => {
        hm.push('a', makeSnapshot());
        hm.push('b', makeSnapshot());
        hm.push('c', makeSnapshot());
        hm.push('d', makeSnapshot());

        expect(hm.entries.length).toBe(3);
        expect(hm.entries[0].label).toBe('b');
        expect(hm.entries[2].label).toBe('d');
      },
      { maxEntries: 3 }
    );
  });

  it('clear empties all state', () => {
    run((hm) => {
      hm.push('a', makeSnapshot());
      hm.push('b', makeSnapshot());

      hm.clear();
      expect(hm.entries.length).toBe(0);
      expect(hm.current).toBeNull();
      expect(hm.canUndo).toBe(false);
      expect(hm.canRedo).toBe(false);
    });
  });

  it('deep-clones snapshot to prevent mutation leaks', () => {
    run((hm) => {
      const snap = makeSnapshot();
      hm.push('test', snap);

      snap.crop.x = 999;
      expect(hm.current!.state.crop.x).toBe(0);
    });
  });

  it('undo returns a deep clone', () => {
    run((hm) => {
      hm.push('a', makeSnapshot());
      hm.push('b', makeSnapshot());

      const result = hm.undo()!;
      result.crop.x = 999;
      expect(hm.current!.state.crop.x).toBe(0);
    });
  });
});
