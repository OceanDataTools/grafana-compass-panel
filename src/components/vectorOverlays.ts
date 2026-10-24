import { useState, useEffect, useRef } from 'react';
import { SimpleOptions } from 'types';

// Where the overlay's direction is measured from:
// - 'true': an absolute compass bearing (true wind, current set)
// - 'relative': an angle off the vessel's bow (apparent wind)
export type OverlayReference = 'true' | 'relative';

// Which way the reported direction points:
// - 'from': the direction the flow is coming from (meteorological wind convention)
// - 'to': the direction the flow is heading toward (oceanographic current "set")
export type OverlayConvention = 'from' | 'to';

export interface VectorOverlay {
  key: string;
  label: string;
  color: string;
  reference: OverlayReference;
  convention: OverlayConvention;
  dirField?: string;
  spdField?: string;
  spdUom?: string;
  dir: number | null;
  spd: number | null;
  displayDir: number | null;
  testIds: { arrow: string; dir: string; spd: string };
}

export function unwrapAngle(prev: number | null, raw: number | null): number | null {
  // Initialize on first reading
  if (prev == null) {
    return raw;
  }

  if (raw == null) {
    return null;
  }

  let delta = raw - (prev % 360);

  if (delta > 180) {
    delta -= 360;
  }
  if (delta < -180) {
    delta += 360;
  }

  return prev + delta;
}

// Tracks a cumulative (non-modulo) angle so CSS rotation transitions always
// animate the short way across the 359°→0° boundary.
export function useUnwrappedAngle(raw: number | null): number | null {
  const [display, setDisplay] = useState(raw);
  const cumulativeRef = useRef(raw);

  useEffect(() => {
    const next = unwrapAngle(cumulativeRef.current, raw);
    cumulativeRef.current = next;
    setDisplay(next);
  }, [raw]);

  return display;
}

export function normalizeDegrees(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Rotation (in screen space) for an overlay arrow given the current rotation mode.
// Earth-referenced overlays sit on the dial, so they only need correcting when the
// dial itself is rotated (bow up). Bow-relative overlays sit on the vessel, so they
// need the heading added when the dial is fixed (north up).
export function overlayRotation(
  angle: number | null,
  heading: number | null,
  reference: OverlayReference,
  rotationMode: SimpleOptions['rotationMode']
): number {
  if (angle === null) {
    return 0;
  }
  if (heading === null) {
    return angle;
  }
  if (reference === 'relative') {
    return rotationMode !== 'rotate-dial' ? angle + heading : angle;
  }
  return rotationMode === 'rotate-dial' ? angle - heading : angle;
}

// Panel radius and vertical offset, shrinking the dial to make room for the extra
// speed readout rows below (wind) and above (current) it.
export function computeLayout(size: number, rowsAbove: number, rowsBelow: number) {
  return {
    radius: (size / 2) * (1 - 0.075 * (rowsAbove + rowsBelow)),
    hOffset: size * 0.0375 * (rowsBelow - rowsAbove),
  };
}
