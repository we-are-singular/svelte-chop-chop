/**
 * svelte-chop-chop — Undo/redo history stack
 * Manages editor state snapshots for undo/redo.
 */

import type { EditorSnapshot, HistoryEntry } from './types.js';

export interface HistoryManagerOptions {
  maxEntries?: number;
  onChange?: (entry: HistoryEntry | null) => void;
}

/**
 * Create history manager composable.
 */
export function createHistoryManager(options: HistoryManagerOptions = {}) {
  const maxEntries = options.maxEntries ?? 50;
  let stack = $state<HistoryEntry[]>([]);
  let index = $state(-1);

  const canUndo = $derived(index > 0);
  const canRedo = $derived(index < stack.length - 1);
  const current = $derived(index >= 0 ? stack[index] : null);

  $effect(() => {
    options.onChange?.(current ?? null);
  });

  /** Deep-clone plain-data snapshots without using structuredClone (which can't handle Svelte proxies). */
  function cloneSnapshot(state: EditorSnapshot): EditorSnapshot {
    return JSON.parse(JSON.stringify(state)) as EditorSnapshot;
  }

  function push(label: string, state: EditorSnapshot): void {
    stack = stack.slice(0, index + 1);
    stack = [
      ...stack,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        label,
        state: cloneSnapshot(state),
      },
    ];
    if (stack.length > maxEntries) {
      stack = stack.slice(stack.length - maxEntries);
    }
    index = stack.length - 1;
  }

  function undo(): EditorSnapshot | null {
    if (!canUndo) return null;
    index--;
    return cloneSnapshot(stack[index].state);
  }

  function redo(): EditorSnapshot | null {
    if (!canRedo) return null;
    index++;
    return cloneSnapshot(stack[index].state);
  }

  function clear(): void {
    stack = [];
    index = -1;
  }

  return {
    get canUndo() {
      return canUndo;
    },
    get canRedo() {
      return canRedo;
    },
    get current() {
      return current;
    },
    get entries() {
      return stack;
    },
    push,
    undo,
    redo,
    clear,
  };
}
