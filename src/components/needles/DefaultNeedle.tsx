import React from 'react';
import { NeedleProps } from './types';

export const DefaultNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const lenN = radius * 0.7;
  const lenS = radius * 0.45;
  const halfW = Math.max(2, radius * 0.06);
  const notch = Math.max(3, radius * 0.08);
  const capR = Math.max(2, radius * 0.05);
  const capStroke = Math.max(1, radius * 0.01);

  return (
    <g>
      <polygon points={`0,${-lenN} ${halfW},0 0,${-notch} ${-halfW},0`} fill={colors.needle} />
      <polygon points={`0,${lenS} ${halfW},0 0,${notch} ${-halfW},0`} fill={colors.tail} />
      <circle cx={0} cy={0} r={capR} fill="white" stroke="#111827" strokeWidth={capStroke} />
    </g>
  );
};
