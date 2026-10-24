import { renderHook } from '@testing-library/react';
import {
  unwrapAngle,
  useUnwrappedAngle,
  normalizeDegrees,
  overlayRotation,
  computeLayout,
  speedScale,
} from './vectorOverlays';

describe('unwrapAngle', () => {
  it('initializes to the raw value on the first reading', () => {
    expect(unwrapAngle(null, 350)).toBe(350);
  });

  it('returns null when the raw value is missing', () => {
    expect(unwrapAngle(350, null)).toBeNull();
  });

  it('takes the short way across 359°→0°', () => {
    expect(unwrapAngle(350, 10)).toBe(370);
    expect(unwrapAngle(370, 350)).toBe(350);
    expect(unwrapAngle(10, 350)).toBe(-10);
  });
});

describe('useUnwrappedAngle', () => {
  it('accumulates across the 0° boundary', () => {
    const { result, rerender } = renderHook(({ raw }) => useUnwrappedAngle(raw), { initialProps: { raw: 350 } });
    expect(result.current).toBe(350);
    rerender({ raw: 10 });
    expect(result.current).toBe(370);
  });
});

describe('normalizeDegrees', () => {
  it.each([
    [370, 10],
    [-10, 350],
    [0, 0],
  ])('normalizes %d to %d', (input, expected) => {
    expect(normalizeDegrees(input)).toBe(expected);
  });
});

describe('overlayRotation', () => {
  it('returns 0 when the overlay angle is missing', () => {
    expect(overlayRotation(null, 90, 'true', 'rotate-needle')).toBe(0);
  });

  it('draws earth-referenced overlays at their bearing on a north-up dial', () => {
    expect(overlayRotation(170, 327, 'true', 'rotate-needle')).toBe(170);
  });

  it('subtracts heading for earth-referenced overlays on a bow-up dial', () => {
    expect(overlayRotation(170, 30, 'true', 'rotate-dial')).toBe(140);
  });

  it('adds heading for bow-relative overlays on a north-up dial', () => {
    expect(overlayRotation(45, 30, 'relative', 'rotate-needle')).toBe(75);
    expect(overlayRotation(45, 30, 'relative', undefined)).toBe(75);
  });

  it('draws bow-relative overlays at their angle on a bow-up dial', () => {
    expect(overlayRotation(45, 30, 'relative', 'rotate-dial')).toBe(45);
  });

  it('falls back to the raw angle when heading is missing', () => {
    expect(overlayRotation(45, null, 'relative', 'rotate-needle')).toBe(45);
    expect(overlayRotation(170, null, 'true', 'rotate-dial')).toBe(170);
  });
});

describe('computeLayout', () => {
  it('uses the full size with no extra readout rows', () => {
    expect(computeLayout(400, 0, 0)).toEqual({ radius: 200, hOffset: 0 });
  });

  it('shrinks and shifts up for a row below (wind speed)', () => {
    const { radius, hOffset } = computeLayout(400, 0, 1);
    expect(radius).toBeCloseTo(185);
    expect(hOffset).toBeCloseTo(15);
  });

  it('shrinks and shifts down for a row above (current speed)', () => {
    const { radius, hOffset } = computeLayout(400, 1, 0);
    expect(radius).toBeCloseTo(185);
    expect(hOffset).toBeCloseTo(-15);
  });

  it('shrinks further and stays centered with rows above and below', () => {
    const { radius, hOffset } = computeLayout(400, 1, 1);
    expect(radius).toBeCloseTo(170);
    expect(hOffset).toBeCloseTo(0);
  });
});

describe('speedScale', () => {
  it('uses the minimum scale at rest', () => {
    expect(speedScale(0, 3, 0.4, 2.5)).toBeCloseTo(0.4);
  });

  it('grows linearly with speed', () => {
    expect(speedScale(1.5, 3, 0.4, 2.4)).toBeCloseTo(1.4);
  });

  it('caps at the maximum scale at and above the upper limit', () => {
    expect(speedScale(3, 3, 0.4, 2.5)).toBeCloseTo(2.5);
    expect(speedScale(10, 3, 0.4, 2.5)).toBeCloseTo(2.5);
  });

  it('treats negative speeds by magnitude', () => {
    expect(speedScale(-1.5, 3, 0.4, 2.4)).toBeCloseTo(1.4);
  });

  it('falls back to normal size without a speed or a usable limit', () => {
    expect(speedScale(null, 3, 0.4, 2.5)).toBe(1);
    expect(speedScale(1, 0, 0.4, 2.5)).toBe(1);
    expect(speedScale(1, undefined, 0.4, 2.5)).toBe(1);
  });
});
