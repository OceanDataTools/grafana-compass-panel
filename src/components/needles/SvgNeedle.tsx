import React, { useMemo } from 'react';
import { ImageNeedle, ImageNeedlePivot } from './ImageNeedle';
import { normalizeSvgSource, svgAspect } from './svgSource';

interface SvgNeedleProps {
  radius: number;
  needleSvg: string;
  size?: number;
  pivot?: ImageNeedlePivot;
}

export const SvgNeedle: React.FC<SvgNeedleProps> = ({ radius, needleSvg, size, pivot }) => {
  const href = useMemo(() => normalizeSvgSource(needleSvg), [needleSvg]);
  const aspect = useMemo(() => svgAspect(needleSvg), [needleSvg]);
  return (
    <ImageNeedle radius={radius} href={href} size={size} pivot={pivot} aspect={aspect} testId="compass-svg-needle" />
  );
};
