import { describe, it, expect, vi } from 'vitest';
import { createKeyboardHandler } from './keyboard.js';

function makeKeyEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: 'a',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as KeyboardEvent;
}

describe('createKeyboardHandler', () => {
  it('invokes matching shortcut action', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'r', action }]);
    handler(makeKeyEvent({ key: 'r' }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('calls preventDefault on match', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'r', action }]);
    const event = makeKeyEvent({ key: 'r' });
    handler(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does not invoke for non-matching key', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'r', action }]);
    handler(makeKeyEvent({ key: 'x' }));
    expect(action).not.toHaveBeenCalled();
  });

  it('matches case-insensitively', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'R', action }]);
    handler(makeKeyEvent({ key: 'r' }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('requires ctrl modifier when specified', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'z', ctrl: true, action }]);

    handler(makeKeyEvent({ key: 'z', ctrlKey: false }));
    expect(action).not.toHaveBeenCalled();

    handler(makeKeyEvent({ key: 'z', ctrlKey: true }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('requires shift modifier when specified', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'z', shift: true, action }]);

    handler(makeKeyEvent({ key: 'z', shiftKey: false }));
    expect(action).not.toHaveBeenCalled();

    handler(makeKeyEvent({ key: 'z', shiftKey: true }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('requires alt modifier when specified', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'a', alt: true, action }]);

    handler(makeKeyEvent({ key: 'a', altKey: false }));
    expect(action).not.toHaveBeenCalled();

    handler(makeKeyEvent({ key: 'a', altKey: true }));
    expect(action).toHaveBeenCalledOnce();
  });

  it('rejects when ctrl is pressed but not in shortcut', () => {
    const action = vi.fn();
    const handler = createKeyboardHandler([{ key: 'r', action }]);
    handler(makeKeyEvent({ key: 'r', ctrlKey: true }));
    expect(action).not.toHaveBeenCalled();
  });

  it('stops at first match', () => {
    const first = vi.fn();
    const second = vi.fn();
    const handler = createKeyboardHandler([
      { key: 'r', action: first },
      { key: 'r', action: second },
    ]);
    handler(makeKeyEvent({ key: 'r' }));
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });
});
