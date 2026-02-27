import { describe, it, expect, vi } from 'vitest';
import {
  createDragHandler,
  createWheelHandler,
  createPinchHandler,
} from './interactions.js';

function makePointerEvent(overrides: Partial<PointerEvent> = {}): PointerEvent {
  const el = {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
  };
  return {
    button: 0,
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    currentTarget: el,
    ...overrides,
  } as unknown as PointerEvent;
}

function makeWheelEvent(overrides: Partial<WheelEvent> = {}): WheelEvent {
  return {
    deltaY: 0,
    deltaMode: 0,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as WheelEvent;
}

describe('createDragHandler', () => {
  it('fires onStart after threshold is met', () => {
    const onStart = vi.fn();
    const onMove = vi.fn();
    const { onpointerdown, onpointermove } = createDragHandler({
      onStart,
      onMove,
      threshold: 3,
    });

    onpointerdown(makePointerEvent({ clientX: 100, clientY: 100 }));
    // Move within threshold
    onpointermove(makePointerEvent({ clientX: 101, clientY: 100 }));
    expect(onStart).not.toHaveBeenCalled();

    // Move beyond threshold
    onpointermove(makePointerEvent({ clientX: 104, clientY: 100 }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(onMove).toHaveBeenCalled();
  });

  it('fires onEnd on pointer up after drag', () => {
    const onStart = vi.fn();
    const onMove = vi.fn();
    const onEnd = vi.fn();
    const { onpointerdown, onpointermove, onpointerup } = createDragHandler({
      onStart,
      onMove,
      onEnd,
      threshold: 0,
    });

    onpointerdown(makePointerEvent({ clientX: 0, clientY: 0 }));
    onpointermove(makePointerEvent({ clientX: 10, clientY: 0 }));
    onpointerup(makePointerEvent());
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('does not fire onEnd without threshold met', () => {
    const onEnd = vi.fn();
    const { onpointerdown, onpointerup } = createDragHandler({
      onEnd,
      threshold: 5,
    });

    onpointerdown(makePointerEvent({ clientX: 0, clientY: 0 }));
    onpointerup(makePointerEvent());
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('ignores non-primary button', () => {
    const onStart = vi.fn();
    const { onpointerdown } = createDragHandler({ onStart });
    onpointerdown(makePointerEvent({ button: 2 }));
    // No capture should happen — further moves won't trigger onStart
  });

  it('ignores different pointer ids in move', () => {
    const onMove = vi.fn();
    const { onpointerdown, onpointermove } = createDragHandler({
      onMove,
      threshold: 0,
    });

    onpointerdown(makePointerEvent({ pointerId: 1 }));
    onpointermove(makePointerEvent({ pointerId: 2, clientX: 50 }));
    expect(onMove).not.toHaveBeenCalled();
  });
});

describe('createWheelHandler', () => {
  it('calls onZoom with a factor for scroll down', () => {
    const onZoom = vi.fn();
    const { onwheel } = createWheelHandler({ onZoom });

    onwheel(makeWheelEvent({ deltaY: 100 }));
    expect(onZoom).toHaveBeenCalledOnce();
    const factor = onZoom.mock.calls[0][0];
    expect(factor).toBeLessThan(1); // scroll down = zoom out
  });

  it('calls onZoom with factor > 1 for scroll up', () => {
    const onZoom = vi.fn();
    const { onwheel } = createWheelHandler({ onZoom });

    onwheel(makeWheelEvent({ deltaY: -100 }));
    const factor = onZoom.mock.calls[0][0];
    expect(factor).toBeGreaterThan(1); // scroll up = zoom in
  });

  it('prevents default', () => {
    const onZoom = vi.fn();
    const { onwheel } = createWheelHandler({ onZoom });
    const event = makeWheelEvent({ deltaY: 10 });
    onwheel(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('normalises line delta mode', () => {
    const onZoom = vi.fn();
    const { onwheel } = createWheelHandler({ onZoom });

    onwheel(makeWheelEvent({ deltaY: 3, deltaMode: 1 }));
    expect(onZoom).toHaveBeenCalled();
  });
});

describe('createPinchHandler', () => {
  it('fires onPinch after two pointers with distance change', () => {
    const onPinch = vi.fn();
    const { onpointerdown, onpointermove } = createPinchHandler({ onPinch });

    onpointerdown(makePointerEvent({ pointerId: 1, clientX: 0, clientY: 0 }));
    onpointerdown(makePointerEvent({ pointerId: 2, clientX: 100, clientY: 0 }));

    // First two-pointer move establishes baseline
    onpointermove(makePointerEvent({ pointerId: 1, clientX: 0, clientY: 0 }));
    // onPinch not called until lastDistance is set
    expect(onPinch).not.toHaveBeenCalled();

    // Second two-pointer move fires pinch
    onpointermove(makePointerEvent({ pointerId: 2, clientX: 200, clientY: 0 }));
    expect(onPinch).toHaveBeenCalled();
  });

  it('resets on pointer up', () => {
    const onPinch = vi.fn();
    const { onpointerdown, onpointermove, onpointerup } = createPinchHandler({ onPinch });

    onpointerdown(makePointerEvent({ pointerId: 1, clientX: 0, clientY: 0 }));
    onpointerdown(makePointerEvent({ pointerId: 2, clientX: 100, clientY: 0 }));
    onpointermove(makePointerEvent({ pointerId: 1, clientX: 0, clientY: 0 }));

    onpointerup(makePointerEvent({ pointerId: 2 }));

    // After removing a pointer, moving with one shouldn't fire
    onPinch.mockClear();
    onpointermove(makePointerEvent({ pointerId: 1, clientX: 50, clientY: 0 }));
    expect(onPinch).not.toHaveBeenCalled();
  });
});
