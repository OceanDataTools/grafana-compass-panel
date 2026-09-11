import React from 'react';
import { NeedleProps } from './types';

export const HelicopterNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const bodyRx = radius * 0.09;
  const bodyRy = radius * 0.2;
  const bodyCy = -radius * 0.05;
  const tailStartY = bodyCy + bodyRy * 0.7;
  const tailEndY = radius * 0.5;
  const bodyStroke = Math.max(1, radius * 0.01);

  // Main rotor: 4 solid X-shaped blades meeting at a small hub, instead of a
  // dashed "spinning blur" circle - reads more like a helicopter at a glance.
  const bladeLen = radius * 0.42;
  const bladeWidth = Math.max(2, radius * 0.05);
  const hubR = radius * 0.045;
  const bladeDiag = bladeLen * Math.SQRT1_2;
  const bladeAngles: Array<[number, number]> = [
    [bladeDiag, -bladeDiag],
    [bladeDiag, bladeDiag],
    [-bladeDiag, bladeDiag],
    [-bladeDiag, -bladeDiag],
  ];

  // Tail rotor: a small T-shaped crossbar at the end of the tail boom, instead
  // of a small circle.
  const tailRotorHalfWidth = radius * 0.08;
  const tailRotorStroke = Math.max(1.5, radius * 0.03);

  return (
    <g data-testid="compass-helicopter-needle">
      {bladeAngles.map(([dx, dy], i) => (
        <line
          key={`blade-${i}`}
          x1={0}
          y1={bodyCy}
          x2={dx}
          y2={bodyCy + dy}
          stroke={colors.text}
          strokeWidth={bladeWidth}
          strokeLinecap="round"
        />
      ))}
      <circle cx={0} cy={bodyCy} r={hubR} fill={colors.text} />
      <line x1={0} y1={tailStartY} x2={0} y2={tailEndY} stroke={colors.needle} strokeWidth={Math.max(1, radius * 0.02)} />
      <line
        x1={-tailRotorHalfWidth}
        y1={tailEndY}
        x2={tailRotorHalfWidth}
        y2={tailEndY}
        stroke={colors.text}
        strokeWidth={tailRotorStroke}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={bodyCy} rx={bodyRx} ry={bodyRy} fill={colors.needle} stroke={colors.text} strokeWidth={bodyStroke} />
    </g>
  );
};
