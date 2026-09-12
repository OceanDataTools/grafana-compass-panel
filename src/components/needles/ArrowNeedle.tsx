import React from 'react';
import { NeedleProps } from './types';

export const ArrowNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const len = radius * 0.7; // full arrow length
  const headLen = radius * 0.25; // arrowhead length
  const halfW = radius * 0.05; // shaft half-width
  const tipW = radius * 0.1; // arrow tip half-width
  const capR = Math.max(2, radius * 0.025);

  const points = [
    [-halfW, len - headLen], // tail left
    [-halfW, -len + headLen], // shaft top-left
    [-tipW, -len + headLen], // arrowhead base-left
    [0, -len], // tip (north)
    [tipW, -len + headLen], // arrowhead base-right
    [halfW, -len + headLen], // shaft top-right
    [halfW, len - headLen], // tail right
  ]
    .map((p) => p.join(','))
    .join(' ');

  return (
    <g>
      <polygon
        points={points}
        fill={colors.needle}
        stroke={colors.text}
        strokeWidth={Math.max(1, radius * 0.01)}
        data-testid="compass-arrow-needle"
      />
      {/* Center pivot */}
      <circle cx={0} cy={0} r={capR} fill="white" stroke={colors.text} strokeWidth={Math.max(1, radius * 0.01)} />
    </g>
  );
};
