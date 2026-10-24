import React from 'react';

export type ImageNeedlePivot = 'center' | 'bottom';

interface ImageNeedleProps {
  radius: number;
  href: string;
  size?: number;
  pivot?: ImageNeedlePivot;
  testId: string;
}

// Draws a custom image needle in a square box that keeps the image's aspect ratio.
// 'center' spins the image around its middle (vehicle icons) and at 1x is about the
// size of the built-in needles; 'bottom' spins it around its bottom edge (clock-hand
// style) and at 1x reaches the major tick marks.
export const ImageNeedle: React.FC<ImageNeedleProps> = ({ radius, href, size = 1, pivot = 'center', testId }) => {
  const side = radius * (pivot === 'bottom' ? 0.72 : 1.2) * size;
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
