/**
 * svelte-chop-chop — Keyboard shortcut handling
 * Matches key combinations and invokes actions.
 */

import type { KeyboardShortcut } from './types.js';

/**
 * Create a keyboard event handler that matches shortcuts.
 * @param shortcuts - Array of shortcut definitions
 * @returns Handler to attach to keydown
 */
export function createKeyboardHandler(
  shortcuts: KeyboardShortcut[]
): (event: KeyboardEvent) => void {
  return function handleKeyboard(event: KeyboardEvent): void {
    for (const shortcut of shortcuts) {
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrl &&
        !!event.shiftKey === !!shortcut.shift &&
        !!event.altKey === !!shortcut.alt
      ) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  };
}
