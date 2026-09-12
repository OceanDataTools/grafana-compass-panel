import React from 'react';
import { NeedleProps } from './types';

// Icon: Font Awesome Free 7.3.1 "plane" (https://fontawesome.com), CC BY 4.0
// (https://fontawesome.com/license/free). Drawn nose-right in its native 640x640
// viewBox, so it's centered on origin and rotated -90deg to point up (heading 0).
export const AirplaneNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const scale = radius / 500;

  return (
    <path
      d="M552 264C582.9 264 608 289.1 608 320C608 350.9 582.9 376 552 376L424.7 376L265.5 549.6C259.4 556.2 250.9 560 241.9 560L198.2 560C187.3 560 179.6 549.3 183 538.9L237.3 376L137.6 376L84.8 442C81.8 445.8 77.2 448 72.3 448L52.5 448C42.1 448 34.5 438.2 37 428.1L64 320L37 211.9C34.4 201.8 42.1 192 52.5 192L72.3 192C77.2 192 81.8 194.2 84.8 198L137.6 264L237.3 264L183 101.1C179.6 90.7 187.3 80 198.2 80L241.9 80C250.9 80 259.4 83.8 265.5 90.4L424.7 264L552 264z"
      fill={colors.needle}
      stroke={colors.text}
      strokeWidth={6}
      transform={`scale(${scale}) rotate(-90) translate(-320,-320)`}
      data-testid="compass-airplane-needle"
    />
  );
};
