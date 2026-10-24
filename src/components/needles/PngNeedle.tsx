import React from 'react';
import { ImageNeedle, ImageNeedlePivot } from './ImageNeedle';

interface PngNeedleProps {
  radius: number;
  needlePng: string;
  size?: number;
  pivot?: ImageNeedlePivot;
}

export const PngNeedle: React.FC<PngNeedleProps> = ({ radius, needlePng, size, pivot }) => (
  <ImageNeedle radius={radius} href={needlePng} size={size} pivot={pivot} testId="compass-png-needle" />
);
