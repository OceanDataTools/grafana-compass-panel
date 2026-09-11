import React from 'react';

interface SvgNeedleProps {
  radius: number;
  needleSvg: string;
}

export const SvgNeedle: React.FC<SvgNeedleProps> = ({ radius, needleSvg }) => {
  const scale = radius / 50;
  return (
    <g transform={`scale(${scale})`}>
      <image href={needleSvg} x={-5} y={-25} width={10} height={50} data-testid="compass-svg-needle" />
    </g>
  );
};
