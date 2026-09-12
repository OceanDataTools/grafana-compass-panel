import React, { useState, useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { useTheme } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { SimpleOptions } from 'types';
import {
  DefaultNeedle,
  ArrowNeedle,
  ShipNeedle,
  AirplaneNeedle,
  HelicopterNeedle,
  UnderwaterDroneNeedle,
  QuadcopterNeedle,
  ROVNeedle,
  SvgNeedle,
  PngNeedle,
} from './needles';

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

  const renderNeedle = () => {
    if (options.needleType === 'arrow') {
      return <ArrowNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'ship') {
      return <ShipNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'airplane') {
      return <AirplaneNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'helicopter') {
      return <HelicopterNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'underwater-drone') {
      return <UnderwaterDroneNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'rov') {
      return <ROVNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'quadcopter') {
      return <QuadcopterNeedle radius={radius} colors={colors} />;
    }
    if (options.needleType === 'svg' && options.needleSvg) {
      return <SvgNeedle radius={radius} needleSvg={options.needleSvg} />;
    }
    if (options.needleType === 'png' && options.needlePng) {
      return <PngNeedle radius={radius} needlePng={options.needlePng} transitionStyle={transitionStyle} />;
    }
    return <DefaultNeedle radius={radius} colors={colors} />;
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
