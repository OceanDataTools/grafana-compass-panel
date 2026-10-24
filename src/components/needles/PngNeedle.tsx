import React, { useEffect, useState } from 'react';
import { ImageAspect, ImageNeedle, ImageNeedlePivot } from './ImageNeedle';

interface PngNeedleProps {
  radius: number;
  needlePng: string;
  size?: number;
  pivot?: ImageNeedlePivot;
}

// The image's natural width/height once it has loaded; null until then.
function useImageAspect(href: string): ImageAspect | null {
  const [aspect, setAspect] = useState<ImageAspect | null>(null);

  useEffect(() => {
    setAspect(null);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspect({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.src = href;
    return () => {
      img.onload = null;
    };
  }, [href]);

  return aspect;
}

export const PngNeedle: React.FC<PngNeedleProps> = ({ radius, needlePng, size, pivot }) => {
  const aspect = useImageAspect(needlePng);
  return (
    <ImageNeedle
      radius={radius}
      href={needlePng}
      size={size}
      pivot={pivot}
      aspect={aspect}
      testId="compass-png-needle"
    />
  );
};
