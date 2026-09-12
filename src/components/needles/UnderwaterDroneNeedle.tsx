import React from 'react';
import { NeedleProps } from './types';

// Icon: derived from Font Awesome Free 7.3.1 "plane" (https://fontawesome.com),
// CC BY 4.0 (https://fontawesome.com/license/free), with the tail removed and the
// path recentered on origin to read as a tailless underwater drone silhouette.
// Rotated -90deg to point up (heading 0).
export const UnderwaterDroneNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const scale = radius / 500;

  return (
    <path
      d="m52.0139-68.9983-115.1945-115.17c-2.7098-2.7093-6.385-4.2312-10.2168-4.2308l-70.6993.0075c-3.8318.0004-7.5068 1.523-10.216 4.2329-5.6418 5.6431-5.6409 14.7912.0022 20.4329l94.7474 94.7273h-169.3097c-50.8835 0-64.2469 31.0457-64.2469 69.947 0 38.9012 13.3634 70.9994 64.2469 70.9994h169.3097l-94.7474 94.7273c-5.6431 5.6418-5.6439 14.79-.0022 20.4329 2.7092 2.7099 6.3841 4.2325 10.216 4.2329l70.6993.0075c3.8318.0004 7.5071-1.5214 10.2168-4.2308L52.0139 71.9481H201.3015c50.8835 0 92.1802-31.572 92.1802-70.4732s-41.2967-70.4732-92.1802-70.4732z"
      fill={colors.needle}
      stroke={colors.text}
      strokeWidth={6}
      transform={`scale(${scale}) rotate(-90) translate(0,0)`}
      data-testid="compass-underwaterdrone-needle"
    />
  );
};
