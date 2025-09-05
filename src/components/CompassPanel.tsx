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
  id
}) => {
  const size = Math.min(width, height);
  const radius = size / 2;
  
  const theme = useTheme();

  // === Extract heading ===
  const rawHeading = (() => {
    if (!options.headingField) { return 0 };
    for (const series of data.series) {
      const field = series.fields.find(f => f.name === options.headingField);
      if (field && field.values.length) {
        return field.values[field.values.length - 1] as number;
      }
    }
    return 0;
  })();

  // === Smooth heading interpolation ===
  const [displayHeading, setDisplayHeading] = useState(rawHeading);
  const cumulativeHeadingRef = useRef(rawHeading);

  useEffect(() => {
    const prev = cumulativeHeadingRef.current;
    let delta = rawHeading - (prev % 360);

    // Shortest rotation path
    if (delta > 180) { delta -= 360 };
    if (delta < -180) { delta += 360 };

    const next = prev + delta;
    cumulativeHeadingRef.current = next;
    setDisplayHeading(next);
  }, [rawHeading]);

  // === Colors ===
  const colors = {
    text: theme.visualization.getColorByName(options.textColor || '#111827'),
    needle: theme.visualization.getColorByName(options.needleColor || 'red'),
    tail: theme.visualization.getColorByName(options.tailColor || 'gray'),
    dial: theme.visualization.getColorByName(options.dialColor || 'white'),
    bezel: theme.visualization.getColorByName(options.bezelColor || '#c6c6c6'),
  };

  // === Helpers ===
  const polarToCartesian = (r: number, angleRad: number) => ({
    x: r * Math.sin(angleRad),
    y: r * Math.cos(angleRad),
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
      if (skip?.(i)) { return null };
      const angle = (i * (360 / count) * Math.PI) / 180;
      const p1 = polarToCartesian(radius * outerFrac, angle);
      const p2 = polarToCartesian(radius * innerFrac, angle);
      return (
        <line
          key={i}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={stroke}
          strokeWidth={radius * strokeWFrac}
        />
      );
    });

  // === Needles ===
const renderArrowNeedle = () => {
  const len = radius * 0.7;      // full arrow length
  const headLen = radius * 0.25; // arrowhead length
  const halfW = radius * 0.05;   // shaft half-width
  const tipW = radius * 0.1;     // arrow tip half-width
  const capR = Math.max(2, radius * 0.025);

  const points = [
    [-halfW, len - headLen],        // tail left
    [-halfW, -len + headLen],       // shaft top-left
    [-tipW, -len + headLen],        // arrowhead base-left
    [0, -len],                      // tip (north)
    [tipW, -len + headLen],         // arrowhead base-right
    [halfW, -len + headLen],        // shaft top-right
    [halfW, len - headLen],         // tail right
  ]
  .map(p => p.join(','))
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

  const renderShipNeedle = () => {
    const shipHeight = 45;
    const scale = (radius * 0.9) / shipHeight;
    const strokeW = Math.max(0.5, radius * 0.005);
    return (
      <g
        transform={`scale(${scale})`}
        data-testid="compass-ship-needle"
      >
        <path
          d="M 0 -30 Q 8 -25 8 0 L 8 23 Q 8 25 0 25 Q -8 25 -8 23 L -8 0 Q -8 -25 0 -30 Z"
          fill={colors.needle}
          stroke={colors.text}
          strokeWidth={strokeW}
        />
      </g>
    );
  };

  const renderSvgNeedle = () => {
    const scale = radius / 50;
    return (
      <g
        transform={`scale(${scale})`}
      >
        <image href={options.needleSvg!} x={-5} y={-25} width={10} height={50} data-testid="compass-svg-needle"/>
      </g>
    );
  };

  const renderPngNeedle = () => {
    // Scale PNG relative to the dial radius
    const pngWidth = 20;
    const pngHeight = 50;
    const scale = radius / 50;
  
    return (
      <g
        transform={`scale(${scale})`}
        style={{ transformOrigin: '0 0', transition: 'transform 0.6s ease-in-out' }}
      >
        <image
          href={options.needlePng!}
          x={-pngWidth / 2}
          y={-pngHeight / 2}
          width={pngWidth}
          height={pngHeight}
          data-testid="compass-png-needle"
        />
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
    if (options.needleType === 'arrow') { return renderArrowNeedle() };
    if (options.needleType === 'ship') { return renderShipNeedle() };
    if (options.needleType === 'svg' && options.needleSvg) { return renderSvgNeedle() };
    if (options.needleType === 'png' && options.needlePng) { return renderPngNeedle() };
    return renderDefaultNeedle();
  };

  // Early return if no data
  if (!data.series || data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {/* Outer bezel */}
        <circle
          cx={0}
          cy={0}
          r={radius * 0.98}
          fill={colors.bezel}
          stroke="#9ca3af"
          strokeWidth={radius * 0.01}
        />

        {/* Dial */}
        <circle
          cx={0}
          cy={0}
          r={radius * 0.88}
          fill={colors.dial}
          stroke={colors.text}
          strokeWidth={radius * 0.015}
        />

        {/* Labels */}
        {options.showLabels && (
          <g
            fontFamily="system-ui, sans-serif"
            fontSize={radius * 0.12}
            fill={colors.text}
            textAnchor="middle"
            fontWeight="700"
          >
            {['N', 'E', 'S', 'W'].map((dir, i) => {
              const angle = (i * 90 * Math.PI) / 180;
              const { x, y } = polarToCartesian(radius * 0.8, angle);
              return (
                <text key={dir} x={x} y={y + radius * 0.04}>
                  {dir}
                </text>
              );
            })}
          </g>
        )}

        {/* Minor ticks */}
        {renderTicks(48, 0.80, 0.86, i => i % 12 === 0, colors.text, 0.01)}

        {/* Major ticks (skip cardinal if labels are shown) */}
        {renderTicks(
          8,
          0.72,
          0.86,
          i => !!options.showLabels && [0, 2, 4, 6].includes(i),
          colors.text,
          0.02
        )}

        {/* Needle */}
        <g transform={`rotate(${displayHeading})`}
          style={{ transition: 'transform 0.6s ease-in-out' }}
          data-testid="compass-needle"
        >
          {renderNeedle()}
        </g>

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
            {`${Math.round(((rawHeading % 360) + 360) % 360)}°`}
          </text>
        )}
      </g>
    </svg>
  );
};
