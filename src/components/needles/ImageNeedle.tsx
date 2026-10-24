import React from 'react';

export type ImageNeedlePivot = 'center' | 'bottom';

export interface ImageAspect {
  width: number;
  height: number;
}

interface ImageNeedleProps {
  radius: number;
  href: string;
  size?: number;
  pivot?: ImageNeedlePivot;
  aspect?: ImageAspect | null;
  testId: string;
}

// Largest box side for which an image fitted into the box stays within `limit` of the
// pivot at every rotation. An unknown aspect assumes the worst case: a square that
// fills the box.
export function maxNeedleSide(aspect: ImageAspect | null, pivot: ImageNeedlePivot, limit: number): number {
  const known = aspect && aspect.width > 0 && aspect.height > 0;
  const longest = known ? Math.max(aspect.width, aspect.height) : 1;
  const w = known ? aspect.width / longest : 1;
  const h = known ? aspect.height / longest : 1;
  // Distance from the pivot to the image's farthest corner, per unit of box side.
  const reach = pivot === 'bottom' ? Math.hypot(w / 2, h) : Math.hypot(w / 2, h / 2);
  return limit / reach;
}

// Draws a custom image needle in a square box that keeps the image's aspect ratio.
// 'center' spins the image around its middle (vehicle icons) and at 1x is about the
// size of the built-in needles; 'bottom' spins it around its bottom edge (clock-hand
// style) and at 1x reaches the major tick marks. Either way it's capped so it never
// extends past the dial face.
export const ImageNeedle: React.FC<ImageNeedleProps> = ({
  radius,
  href,
  size = 1,
  pivot = 'center',
  aspect = null,
  testId,
}) => {
  const requested = radius * (pivot === 'bottom' ? 0.72 : 1.2) * size;
  const side = Math.min(requested, maxNeedleSide(aspect, pivot, radius * 0.88));
  return (
    <image
      href={href}
      x={-side / 2}
      y={pivot === 'bottom' ? -side : -side / 2}
      width={side}
      height={side}
      preserveAspectRatio={pivot === 'bottom' ? 'xMidYMax meet' : 'xMidYMid meet'}
      data-testid={testId}
    />
  );
};
