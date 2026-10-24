import React, { useMemo } from 'react';
import { ImageNeedle, ImageNeedlePivot } from './ImageNeedle';
import { normalizeSvgSource } from './svgSource';

interface SvgNeedleProps {
  radius: number;
  needleSvg: string;
  size?: number;
  pivot?: ImageNeedlePivot;
}

export const SvgNeedle: React.FC<SvgNeedleProps> = ({ radius, needleSvg, size, pivot }) => {
  const href = useMemo(() => normalizeSvgSource(needleSvg), [needleSvg]);
  return <ImageNeedle radius={radius} href={href} size={size} pivot={pivot} testId="compass-svg-needle" />;
};
