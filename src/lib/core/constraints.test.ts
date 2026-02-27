import { describe, it, expect } from 'vitest';
import {
  getAspectRatioValue,
  satisfiesAspectRatio,
  validateSizeConstraints,
} from './constraints.js';

describe('getAspectRatioValue', () => {
  it('returns null for null', () => {
    expect(getAspectRatioValue(null)).toBeNull();
  });

  it('returns number for number', () => {
    expect(getAspectRatioValue(16 / 9)).toBeCloseTo(1.778, 2);
  });

  it('returns average for range', () => {
    expect(getAspectRatioValue({ min: 1, max: 2 })).toBe(1.5);
  });

  it('returns min or max for partial range', () => {
    expect(getAspectRatioValue({ min: 1 })).toBe(1);
    expect(getAspectRatioValue({ max: 2 })).toBe(2);
  });
});

describe('satisfiesAspectRatio', () => {
  it('returns true for matching ratio', () => {
    expect(satisfiesAspectRatio({ x: 0, y: 0, width: 100, height: 100 }, 1)).toBe(true);
    expect(satisfiesAspectRatio({ x: 0, y: 0, width: 160, height: 90 }, 16 / 9)).toBe(true);
  });

  it('returns false for non-matching ratio', () => {
    expect(satisfiesAspectRatio({ x: 0, y: 0, width: 100, height: 50 }, 1)).toBe(false);
  });

  it('returns false for zero dimensions', () => {
    expect(satisfiesAspectRatio({ x: 0, y: 0, width: 0, height: 100 }, 1)).toBe(false);
  });
});

describe('validateSizeConstraints', () => {
  it('returns valid when no constraints', () => {
    expect(validateSizeConstraints({ x: 0, y: 0, width: 100, height: 100 }, undefined)).toEqual({
      valid: true,
    });
  });

  it('fails when below minWidth', () => {
    const result = validateSizeConstraints(
      { x: 0, y: 0, width: 50, height: 100 },
      { minWidth: 100 }
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100');
  });

  it('fails when above maxWidth', () => {
    const result = validateSizeConstraints(
      { x: 0, y: 0, width: 500, height: 100 },
      { maxWidth: 400 }
    );
    expect(result.valid).toBe(false);
  });

  it('fails when below minArea', () => {
    const result = validateSizeConstraints(
      { x: 0, y: 0, width: 10, height: 10 },
      { minArea: 500 }
    );
    expect(result.valid).toBe(false);
  });
});
