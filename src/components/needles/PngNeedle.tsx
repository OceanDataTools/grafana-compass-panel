import React from 'react';

interface PngNeedleProps {
  radius: number;
  needlePng: string;
  transitionStyle: React.CSSProperties;
}

export const PngNeedle: React.FC<PngNeedleProps> = ({ radius, needlePng, transitionStyle }) => {
  // Scale PNG relative to the dial radius
  const pngWidth = 20;
  const pngHeight = 50;
  const scale = radius / 42;

  return (
    <g transform={`scale(${scale})`} style={{ transformOrigin: '0 0', ...transitionStyle }}>
      <image
        href={needlePng}
        x={-pngWidth / 2}
        y={-pngHeight / 1.7}
        width={pngWidth}
        height={pngHeight}
        data-testid="compass-png-needle"
      />
    </g>
  );
};
