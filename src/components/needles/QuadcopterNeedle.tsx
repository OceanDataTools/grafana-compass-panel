import React from 'react';
import { NeedleProps } from './types';

export const QuadcopterNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const armLen = radius * 0.4125;
  const diag = armLen * Math.SQRT1_2;
  const rotorR = radius * 0.17;
  const rotorStroke = Math.max(1.5, radius * 0.03);
  const armStroke = Math.max(1, radius * 0.03);
  const bodySize = radius * 0.275;
  const bodyRadius = bodySize * 0.35;
  const bladeLen = rotorR * 0.6;
  const bladeStroke = Math.max(1, radius * 0.015);

  // X-frame arms: front-left/front-right are colored with needleColor, rear two with
  // tailColor - mirrors how real multirotor drones mark front vs. rear with LED color.
  const arms: Array<{ x: number; y: number; front: boolean }> = [
    { x: diag, y: -diag, front: true }, // front-right
    { x: -diag, y: -diag, front: true }, // front-left
    { x: -diag, y: diag, front: false }, // rear-left
    { x: diag, y: diag, front: false }, // rear-right
  ];

  return (
    <g data-testid="compass-quadcopter-needle">
      {arms.map((arm, i) => (
        <line key={`arm-${i}`} x1={0} y1={0} x2={arm.x} y2={arm.y} stroke={colors.text} strokeWidth={armStroke} />
      ))}
      <rect
        x={-bodySize / 2}
        y={-bodySize / 2}
        width={bodySize}
        height={bodySize}
        rx={bodyRadius}
        fill={colors.text}
      />
      {arms.map((arm, i) => (
        <g key={`rotor-${i}`}>
          <circle
            cx={arm.x}
            cy={arm.y}
            r={rotorR}
            fill="none"
            stroke={arm.front ? colors.needle : colors.tail}
            strokeWidth={rotorStroke}
          />
          <line
            x1={arm.x - bladeLen}
            y1={arm.y - bladeLen}
            x2={arm.x + bladeLen}
            y2={arm.y + bladeLen}
            stroke={colors.text}
            strokeWidth={bladeStroke}
          />
          <line
            x1={arm.x - bladeLen}
            y1={arm.y + bladeLen}
            x2={arm.x + bladeLen}
            y2={arm.y - bladeLen}
            stroke={colors.text}
            strokeWidth={bladeStroke}
          />
        </g>
      ))}
    </g>
  );
};
