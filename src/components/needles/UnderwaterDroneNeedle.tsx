import React from 'react';
import { NeedleProps } from './types';

export const UnderwaterDroneNeedle: React.FC<NeedleProps> = ({ radius, colors }) => {
  const noseY = -radius * 0.55;
  const bodyTopY = -radius * 0.35;
  const bodyBottomY = radius * 0.35;
  const tailY = radius * 0.55;
  const bodyHalfW = radius * 0.12;
  const strokeW = Math.max(1, radius * 0.01);

  // Mid-body X-wing, positioned like an underwater glider's main wing rather than a
  // tail fin. A rounded "bowtie" - one continuous path with curved lobes and tips
  // instead of a sharp-cornered diamond, matching the rounded style of the ship/plane
  // needles. (An earlier attempt with two mirrored triangle polygons only rendered one
  // side, for reasons that weren't fully pinned down - a single closed path avoids that.)
  const roundedBowtie = (centerY: number, halfChord: number, tipX: number) => {
    const nearTipX = tipX * 0.85;
    const nearChord = halfChord * 0.35;
    return `M 0 ${centerY - halfChord}
      Q ${nearTipX} ${centerY - nearChord} ${tipX} ${centerY}
      Q ${nearTipX} ${centerY + nearChord} 0 ${centerY + halfChord}
      Q ${-nearTipX} ${centerY + nearChord} ${-tipX} ${centerY}
      Q ${-nearTipX} ${centerY - nearChord} 0 ${centerY - halfChord}
      Z`;
  };

  const wingPath = roundedBowtie(radius * 0.18, radius * 0.12, radius * 0.45);

  // Small tail fin (rudder) right at the back, separate from the main wing
  const tailFinFrontY = radius * 0.42;
  const tailFinPath = roundedBowtie((tailFinFrontY + tailY) / 2, (tailY - tailFinFrontY) / 2, radius * 0.14);

  // Gentle outward bulge on the sides (instead of straight edges) for a smoother,
  // more torpedo-like silhouette, matching the ship needle's fully-curved profile.
  const bodyBulge = bodyHalfW * 1.08;
  const bodyMidY = bodyBottomY / 2;
  const bodyPath = `M 0 ${noseY}
    Q ${bodyHalfW} ${bodyTopY} ${bodyHalfW} 0
    Q ${bodyBulge} ${bodyMidY} ${bodyHalfW} ${bodyBottomY}
    Q ${bodyHalfW} ${tailY} 0 ${tailY}
    Q ${-bodyHalfW} ${tailY} ${-bodyHalfW} ${bodyBottomY}
    Q ${-bodyBulge} ${bodyMidY} ${-bodyHalfW} 0
    Q ${-bodyHalfW} ${bodyTopY} 0 ${noseY}
    Z`;

  // Small darker nose cap, kept narrower than the body outline at that point so it
  // reads as a two-tone nose without needing to clip it to the body's curve.
  const noseCapLen = radius * 0.12;
  const noseCapHalfW = bodyHalfW * 0.6;
  const noseCapPath = `M 0 ${noseY} L ${noseCapHalfW} ${noseY + noseCapLen} L ${-noseCapHalfW} ${noseY + noseCapLen} Z`;

  return (
    <g data-testid="compass-underwater-drone-needle">
      <path d={wingPath} fill={colors.tail} stroke={colors.text} strokeWidth={strokeW} />
      <path d={tailFinPath} fill={colors.tail} stroke={colors.text} strokeWidth={strokeW} />
      <path d={bodyPath} fill={colors.needle} stroke={colors.text} strokeWidth={strokeW} />
      <path d={noseCapPath} fill={colors.text} />
    </g>
  );
};
