import React, { useState, useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { useTheme } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { SimpleOptions } from 'types';

export const CompassPanel: React.FC<PanelProps<SimpleOptions>> = ({
  data,
  width,
  height,
  options,
  fieldConfig,
  id,
}) => {
  const size = Math.min(width, height);
  const showWindSpd = options.apparentWindSpdField || options.trueWindSpdField;
  const radius = showWindSpd ? (size / 2) * 0.925 : size / 2;
  const h_offset = showWindSpd ? size * 0.0375 : 0;

  const theme = useTheme();

  const animationMs = options.animationDurationMs ?? 600;
  const transitionStyle = animationMs > 0 ? { transition: `transform ${animationMs}ms ease-in-out` } : {};

  // === Extract helpers ===
  const extractLatest = (fieldName?: string): number | null => {
    if (!fieldName) {
      return null;
    }
    for (const series of data.series) {
      const field = series.fields.find((f) => f.name === fieldName);
      if (field && field.values.length) {
        return field.values[field.values.length - 1] as number;
      }
    }
    return null;
  };

  const heading = extractLatest(options.headingField) ?? null;
  const trueWindDir = extractLatest(options.trueWindDirField) ?? null;
  const trueWindSpd = extractLatest(options.trueWindSpdField) ?? null;
  const apparentWindDir = extractLatest(options.apparentWindDirField) ?? null;
  const apparentWindSpd = extractLatest(options.apparentWindSpdField) ?? null;

  // === Smooth direction interpolation ===
  const [displayHeading, setDisplayHeading] = useState(heading);
  const cumulativeHeadingRef = useRef(heading);

  const [displayTruewind, setDisplayTruewind] = useState(trueWindDir);
  const cumulativeTruewindRef = useRef(trueWindDir);

  const [displayApparent, setDisplayApparent] = useState(apparentWindDir);
  const cumulativeApparentRef = useRef(apparentWindDir);

  function unwrapAngle(prev: number | null, raw: number | null): number | null {
    // Initialize on first reading
    if (prev == null) {
      return raw;
    }

    if (raw == null) {
      return null;
    }

    let delta = raw - (prev % 360);

    if (delta > 180) {
      delta -= 360;
    }
    if (delta < -180) {
      delta += 360;
    }

    return prev + delta;
  }

  useEffect(() => {
    const prev = cumulativeHeadingRef.current;
    const next = unwrapAngle(prev, heading);
    cumulativeHeadingRef.current = next;
    setDisplayHeading(next);
  }, [heading]);

  useEffect(() => {
    const prev = cumulativeTruewindRef.current;
    const next = unwrapAngle(prev, trueWindDir);
    cumulativeTruewindRef.current = next;
    setDisplayTruewind(next);
  }, [trueWindDir]);

  useEffect(() => {
    const prev = cumulativeApparentRef.current;
    const next = unwrapAngle(prev, apparentWindDir);
    cumulativeApparentRef.current = next;
    setDisplayApparent(next);
  }, [apparentWindDir]);

  // === Colors ===
  const colors = {
    text: theme.visualization.getColorByName(options.textColor || '#111827'),
    needle: theme.visualization.getColorByName(options.needleColor || 'red'),
    tail: theme.visualization.getColorByName(options.tailColor || 'gray'),
    dial: theme.visualization.getColorByName(options.dialColor || 'white'),
    bezel: theme.visualization.getColorByName(options.bezelColor || '#c6c6c6'),
    trueWind: theme.visualization.getColorByName(options.trueWindColor || 'blue'),
    apparentWind: theme.visualization.getColorByName(options.apparentWindColor || 'yellow'),
  };

  // === Helpers ===
  const polarToCartesian = (r: number, angleRad: number) => ({
    x: r * Math.sin(angleRad),
    y: -r * Math.cos(angleRad),
  });

  const renderTicks = (
    count: number,
    innerFrac: number,
    outerFrac: number,
    skip?: (i: number) => boolean,
    stroke = colors.text,
    strokeWFrac = 0.01
  ) =>
    Array.from({ length: count }).map((_, i) => {
      if (skip?.(i)) {
        return null;
      }
      const angle = (i * (360 / count) * Math.PI) / 180;
      const p1 = polarToCartesian(radius * outerFrac, angle);
      const p2 = polarToCartesian(radius * innerFrac, angle);
      return (
        <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={stroke} strokeWidth={radius * strokeWFrac} />
      );
    });

  // === Needles ===
  // === Arrow ===
  const renderArrowNeedle = () => {
    const len = radius * 0.7; // full arrow length
    const headLen = radius * 0.25; // arrowhead length
    const halfW = radius * 0.05; // shaft half-width
    const tipW = radius * 0.1; // arrow tip half-width
    const capR = Math.max(2, radius * 0.025);

    const points = [
      [-halfW, len - headLen], // tail left
      [-halfW, -len + headLen], // shaft top-left
      [-tipW, -len + headLen], // arrowhead base-left
      [0, -len], // tip (north)
      [tipW, -len + headLen], // arrowhead base-right
      [halfW, -len + headLen], // shaft top-right
      [halfW, len - headLen], // tail right
    ]
      .map((p) => p.join(','))
      .join(' ');

    return (
      <g>
        <polygon
          points={points}
          fill={colors.needle}
          stroke={colors.text}
          strokeWidth={Math.max(1, radius * 0.01)}
          data-testid="compass-arrow-needle"
        />
        {/* Center pivot */}
        <circle cx={0} cy={0} r={capR} fill="white" stroke={colors.text} strokeWidth={Math.max(1, radius * 0.01)} />
      </g>
    );
  };

  // === Ship Profile ===
  const renderShipNeedle = () => {
    const shipHeight = 45;
    const scale = (radius * 0.9) / shipHeight;
    const strokeW = Math.max(0.5, radius * 0.005);
    return (
      <g transform={`scale(${scale})`} data-testid="compass-ship-needle">
        <path
          d="M 0 -30 Q 8 -25 8 0 L 8 23 Q 8 25 0 25 Q -8 25 -8 23 L -8 0 Q -8 -25 0 -30 Z"
          fill={colors.needle}
          stroke={colors.text}
          strokeWidth={strokeW}
        />
      </g>
    );
  };

  // === Airplane ===
  // Icon: Font Awesome Free 7.3.1 "plane" (https://fontawesome.com), CC BY 4.0
  // (https://fontawesome.com/license/free). Drawn nose-right in its native 640x640
  // viewBox, so it's centered on origin and rotated -90deg to point up (heading 0).
  const renderAirplaneNeedle = () => {
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

  // === Helicopter ===
  const renderHelicopterNeedle = () => {
    const bodyRx = radius * 0.09;
    const bodyRy = radius * 0.2;
    const bodyCy = -radius * 0.05;
    const tailStartY = bodyCy + bodyRy * 0.7;
    const tailEndY = radius * 0.5;
    const bodyStroke = Math.max(1, radius * 0.01);

    // Main rotor: 4 solid X-shaped blades meeting at a small hub, instead of a
    // dashed "spinning blur" circle - reads more like a helicopter at a glance.
    const bladeLen = radius * 0.42;
    const bladeWidth = Math.max(2, radius * 0.05);
    const hubR = radius * 0.045;
    const bladeDiag = bladeLen * Math.SQRT1_2;
    const bladeAngles: Array<[number, number]> = [
      [bladeDiag, -bladeDiag],
      [bladeDiag, bladeDiag],
      [-bladeDiag, bladeDiag],
      [-bladeDiag, -bladeDiag],
    ];

    // Tail rotor: a small T-shaped crossbar at the end of the tail boom, instead
    // of a small circle.
    const tailRotorHalfWidth = radius * 0.08;
    const tailRotorStroke = Math.max(1.5, radius * 0.03);

    return (
      <g data-testid="compass-helicopter-needle">
        {bladeAngles.map(([dx, dy], i) => (
          <line
            key={`blade-${i}`}
            x1={0}
            y1={bodyCy}
            x2={dx}
            y2={bodyCy + dy}
            stroke={colors.text}
            strokeWidth={bladeWidth}
            strokeLinecap="round"
          />
        ))}
        <circle cx={0} cy={bodyCy} r={hubR} fill={colors.text} />
        <line
          x1={0}
          y1={tailStartY}
          x2={0}
          y2={tailEndY}
          stroke={colors.needle}
          strokeWidth={Math.max(1, radius * 0.02)}
        />
        <line
          x1={-tailRotorHalfWidth}
          y1={tailEndY}
          x2={tailRotorHalfWidth}
          y2={tailEndY}
          stroke={colors.text}
          strokeWidth={tailRotorStroke}
          strokeLinecap="round"
        />
        <ellipse cx={0} cy={bodyCy} rx={bodyRx} ry={bodyRy} fill={colors.needle} stroke={colors.text} strokeWidth={bodyStroke} />
      </g>
    );
  };

  // === Underwater Drone (ROV/AUV) ===
  const renderUnderwaterDroneNeedle = () => {
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

  // === Quadcopter ===
  const renderQuadcopterNeedle = () => {
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

  // === Custom SVG ===
  const renderSvgNeedle = () => {
    const scale = radius / 50;
    return (
      <g transform={`scale(${scale})`}>
        <image href={options.needleSvg!} x={-5} y={-25} width={10} height={50} data-testid="compass-svg-needle" />
      </g>
    );
  };

  // === Custom PNG ===
  const renderPngNeedle = () => {
    // Scale PNG relative to the dial radius
    const pngWidth = 20;
    const pngHeight = 50;
    const scale = radius / 42;

    return (
      <g transform={`scale(${scale})`} style={{ transformOrigin: '0 0', ...transitionStyle }}>
        <image
          href={options.needlePng!}
          x={-pngWidth / 2}
          y={-pngHeight / 1.7}
          width={pngWidth}
          height={pngHeight}
          data-testid="compass-png-needle"
        />
      </g>
    );
  };

  // === Wind arrows ===
  const renderWindArrow = (angleDeg: number, color: string, label: string) => {
    const rOuter = radius * 0.9;
    const rNotch = radius * 0.85;
    const rInner = radius * 0.4;
    const rText = radius * 0.75;
    const rwidthRad = 0.2;

    const angleRad = (angleDeg * Math.PI) / 180;
    const pNotch = polarToCartesian(rNotch, angleRad);
    const pOuter1 = polarToCartesian(rOuter, angleRad - rwidthRad / 2);
    const pOuter2 = polarToCartesian(rOuter, angleRad + rwidthRad / 2);
    const pInner = polarToCartesian(rInner, angleRad);
    const pText = polarToCartesian(rText, angleRad);

    return (
      <g>
        <polygon
          points={`${pInner.x},${pInner.y} ${pOuter2.x},${pOuter2.y} ${pNotch.x},${pNotch.y} ${pOuter1.x},${pOuter1.y}`}
          fill={color}
          stroke={colors.text}
        />
        <text
          x={pText.x}
          y={pText.y + radius * 0.025}
          fontFamily="system-ui, sans-serif"
          fontSize={radius * 0.075}
          fill={colors.text}
          textAnchor="middle"
          fontWeight="600"
        >
          {label}
        </text>
      </g>
    );
  };

  const renderDefaultNeedle = () => {
    const lenN = radius * 0.7;
    const lenS = radius * 0.45;
    const halfW = Math.max(2, radius * 0.06);
    const notch = Math.max(3, radius * 0.08);
    const capR = Math.max(2, radius * 0.05);
    const capStroke = Math.max(1, radius * 0.01);

    return (
      <g>
        <polygon points={`0,${-lenN} ${halfW},0 0,${-notch} ${-halfW},0`} fill={colors.needle} />
        <polygon points={`0,${lenS} ${halfW},0 0,${notch} ${-halfW},0`} fill={colors.tail} />
        <circle cx={0} cy={0} r={capR} fill="white" stroke="#111827" strokeWidth={capStroke} />
      </g>
    );
  };

  const renderNeedle = () => {
    if (options.needleType === 'arrow') {
      return renderArrowNeedle();
    }
    if (options.needleType === 'ship') {
      return renderShipNeedle();
    }
    if (options.needleType === 'airplane') {
      return renderAirplaneNeedle();
    }
    if (options.needleType === 'helicopter') {
      return renderHelicopterNeedle();
    }
    if (options.needleType === 'underwater-drone') {
      return renderUnderwaterDroneNeedle();
    }
    if (options.needleType === 'quadcopter') {
      return renderQuadcopterNeedle();
    }
    if (options.needleType === 'svg' && options.needleSvg) {
      return renderSvgNeedle();
    }
    if (options.needleType === 'png' && options.needlePng) {
      return renderPngNeedle();
    }
    return renderDefaultNeedle();
  };

  // Early return if no data
  if (!data.series || data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <g transform={`translate(${width / 2}, ${height / 2 - h_offset})`}>
        {/* Outer bezel */}
        <circle cx={0} cy={0} r={radius * 0.98} fill={colors.bezel} stroke="#9ca3af" strokeWidth={radius * 0.01} />

        {/* Dial */}
        <circle cx={0} cy={0} r={radius * 0.88} fill={colors.dial} stroke={colors.text} strokeWidth={radius * 0.015} />

        {/* Needle */}
        <g
          transform={options.rotationMode === 'rotate-needle' ? `rotate(${displayHeading})` : undefined}
          style={options.rotationMode === 'rotate-needle' ? transitionStyle : {}}
          data-testid="compass-needle"
        >
          {heading !== null && renderNeedle()}
        </g>

        <g
          transform={
            options.rotationMode === 'rotate-dial' && displayHeading !== null ? `rotate(${-displayHeading})` : undefined
          }
          style={options.rotationMode === 'rotate-dial' ? transitionStyle : {}}
          data-testid="compass-dial"
        >
          {/* Labels */}
          {options.showLabels && (
            <g
              fontFamily="system-ui, sans-serif"
              fontSize={radius * 0.12}
              fill={colors.text}
              textAnchor="middle"
              dominantBaseline="central"
              fontWeight="700"
            >
              {['N', 'E', 'S', 'W'].map((dir, i) => {
                const angle = (i * 90 * Math.PI) / 180;
                const { x, y } = polarToCartesian(radius * 0.8, angle);
                return (
                  <text key={dir} x={x} y={y}>
                    {dir}
                  </text>
                );
              })}
            </g>
          )}

          {/* Minor ticks */}
          {renderTicks(48, 0.8, 0.86, (i) => i % 12 === 0, colors.text, 0.01)}

          {/* Major ticks (skip cardinal if labels are shown) */}
          {renderTicks(8, 0.72, 0.86, (i) => !!options.showLabels && [0, 2, 4, 6].includes(i), colors.text, 0.02)}
        </g>

        {/* Wind arrows */}
        {options.apparentWindDirField && (
          <g
            transform={
              options.rotationMode !== 'rotate-dial' && displayHeading !== null && displayApparent !== null
                ? `rotate(${displayApparent + displayHeading})`
                : `rotate(${displayApparent})`
            }
            style={transitionStyle}
          >
            {options.apparentWindDirField && apparentWindDir !== null && renderWindArrow(0, colors.apparentWind, 'A')}
          </g>
        )}

        {options.trueWindDirField && (
          <g
            transform={
              options.rotationMode === 'rotate-dial' && displayHeading !== null && displayTruewind !== null
                ? `rotate(${displayTruewind - displayHeading})`
                : `rotate(${displayTruewind})`
            }
            style={transitionStyle}
          >
            {options.trueWindDirField && trueWindDir !== null && renderWindArrow(0, colors.trueWind, 'T')}
          </g>
        )}

        {/* Numeric heading */}
        {options.showHeadingValue && (
          <text
            x={0}
            y={radius * 0.65}
            fontFamily="system-ui, sans-serif"
            fontSize={radius * 0.15}
            fill={colors.text}
            textAnchor="middle"
            fontWeight="600"
            data-testid="compass-numeric-heading"
          >
            {heading !== null ? `${Math.round(((heading % 360) + 360) % 360)}°` : 'No data'}
          </text>
        )}

        {options.showHeadingValue && options.trueWindDirField && (
          <text
            x={-radius}
            y={radius * 0.95}
            fontFamily="system-ui, sans-serif"
            fontSize={radius * 0.15}
            fill={colors.trueWind}
            textAnchor="start"
            fontWeight="600"
            data-testid="windrose-numeric-truewind-dir"
          >
            {trueWindDir !== null ? `${Math.round(((trueWindDir % 360) + 360) % 360)}°` : 'No data'}
          </text>
        )}

        {options.trueWindSpdField && (
          <text
            x={-radius}
            y={radius * 1.1}
            fontFamily="system-ui, sans-serif"
            fontSize={radius * 0.15}
            fill={colors.trueWind}
            textAnchor="start"
            fontWeight="600"
            data-testid="windrose-numeric-truewind-spd"
          >
            {trueWindSpd !== null ? `${trueWindSpd.toFixed(2)} ${options.trueWindSpdUom}` : 'No data'}
          </text>
        )}

        {options.showHeadingValue && options.apparentWindDirField && (
          <text
            x={radius}
            y={radius * 0.95}
            fontFamily="system-ui, sans-serif"
            fontSize={radius * 0.15}
            fill={colors.apparentWind}
            textAnchor="end"
            fontWeight="600"
            data-testid="windrose-numeric-apparent-dir"
          >
            {apparentWindDir !== null ? `${Math.round(((apparentWindDir % 360) + 360) % 360)}°` : 'No data'}
          </text>
        )}

        {options.apparentWindSpdField && (
          <text
            x={radius}
            y={radius * 1.1}
            fontFamily="system-ui, sans-serif"
            fontSize={radius * 0.15}
            fill={colors.apparentWind}
            textAnchor="end"
            fontWeight="600"
            data-testid="windrose-numeric-apparentwind-spd"
          >
            {apparentWindSpd !== null ? `${apparentWindSpd.toFixed(2)} ${options.apparentWindSpdUom}` : 'No data'}
          </text>
        )}
      </g>
    </svg>
  );
};
