import React from 'react';
import { NeedleProps } from './types';

export const ShipNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const shipHeight = 45;
  const scale = (radius * 0.9) / shipHeight;
  const strokeW = Math.max(0.5, radius * 0.005);

  return (
    <g transform={`scale(${scale})`} data-testid="compass-ship-needle">
      <path
        d="M 0 -30 Q 8 -25 8 0 L 8 23 Q 8 25 0 25 Q -8 25 -8 23 L -8 0 Q -8 -25 0 -30 Z"
        fill={colors.needle}
        stroke={colors.text}
        strokeWidth={strokeW}
      />
    </g>
  );
};
