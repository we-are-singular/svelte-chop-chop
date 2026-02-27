/**
 * Simple toast notification store for the demo site.
 * Uses Svelte 5 runes — import and call toast() to show a message.
 */

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let items = $state<ToastItem[]>([]);
let nextId = 0;

export function toast(message: string, type: ToastType = 'info', duration = 3000): void {
  const id = nextId++;
  items = [...items, { id, message, type }];
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
  }, duration);
}

export function getToasts(): ToastItem[] {
  return items;
}
