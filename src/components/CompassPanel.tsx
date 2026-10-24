import React from 'react';
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
import {
  VectorOverlay,
  useUnwrappedAngle,
  normalizeDegrees,
  overlayRotation,
  computeLayout,
  speedScale,
} from './vectorOverlays';

export const CompassPanel: React.FC<PanelProps<SimpleOptions>> = ({
  data,
  width,
  height,
  options,
  fieldConfig,
  id,
}) => {
  const size = Math.min(width, height);
  const rowsBelow = options.apparentWindSpdField || options.trueWindSpdField ? 1 : 0;
  const rowsAbove = options.currentSpdField ? 1 : 0;
  const { radius, hOffset: h_offset } = computeLayout(size, rowsAbove, rowsBelow);

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
  const apparentWindDir = extractLatest(options.apparentWindDirField) ?? null;
  const currentDir = extractLatest(options.currentDirField) ?? null;

  // === Smooth direction interpolation ===
  const displayHeading = useUnwrappedAngle(heading);
  const displayTruewind = useUnwrappedAngle(trueWindDir);
  const displayApparent = useUnwrappedAngle(apparentWindDir);
  const displayCurrent = useUnwrappedAngle(currentDir);

  // === Colors ===
  const colors = {
    text: theme.visualization.getColorByName(options.textColor || '#111827'),
    needle: theme.visualization.getColorByName(options.needleColor || 'red'),
    tail: theme.visualization.getColorByName(options.tailColor || 'gray'),
    dial: theme.visualization.getColorByName(options.dialColor || 'white'),
    bezel: theme.visualization.getColorByName(options.bezelColor || '#c6c6c6'),
    trueWind: theme.visualization.getColorByName(options.trueWindColor || 'blue'),
    apparentWind: theme.visualization.getColorByName(options.apparentWindColor || 'yellow'),
    current: theme.visualization.getColorByName(options.currentColor || 'green'),
  };

  // === Vector overlays (wind, current) ===
  // Drawn in this order, so later entries sit on top.
  const overlays: VectorOverlay[] = [
    {
      key: 'current',
      label: 'C',
      color: colors.current,
      reference: 'true',
      convention: 'to',
      dirField: options.currentDirField,
      spdField: options.currentSpdField,
      spdUom: options.currentSpdUom,
      dir: currentDir,
      spd: extractLatest(options.currentSpdField) ?? null,
      displayDir: displayCurrent,
      testIds: {
        arrow: 'compass-arrow-current',
        dir: 'currentrose-numeric-current-dir',
        spd: 'currentrose-numeric-current-spd',
      },
    },
    {
      key: 'apparentWind',
      label: 'A',
      color: colors.apparentWind,
      reference: 'relative',
      convention: 'from',
      dirField: options.apparentWindDirField,
      spdField: options.apparentWindSpdField,
      spdUom: options.apparentWindSpdUom,
      dir: apparentWindDir,
      spd: extractLatest(options.apparentWindSpdField) ?? null,
      displayDir: displayApparent,
      testIds: {
        arrow: 'compass-arrow-apparentwind',
        dir: 'windrose-numeric-apparent-dir',
        spd: 'windrose-numeric-apparentwind-spd',
      },
    },
    {
      key: 'trueWind',
      label: 'T',
      color: colors.trueWind,
      reference: 'true',
      convention: 'from',
      dirField: options.trueWindDirField,
      spdField: options.trueWindSpdField,
      spdUom: options.trueWindSpdUom,
      dir: trueWindDir,
      spd: extractLatest(options.trueWindSpdField) ?? null,
      displayDir: displayTruewind,
      testIds: {
        arrow: 'compass-arrow-truewind',
        dir: 'windrose-numeric-truewind-dir',
        spd: 'windrose-numeric-truewind-spd',
      },
    },
  ];

  // Readout placement per overlay (also their render order): wind in the bottom corners,
  // current in the top-left.
  const readoutLayout: Record<string, { x: number; dirY: number; spdY: number; anchor: 'start' | 'end' }> = {
    trueWind: { x: -radius, dirY: radius * 0.95, spdY: radius * 1.1, anchor: 'start' },
    apparentWind: { x: radius, dirY: radius * 0.95, spdY: radius * 1.1, anchor: 'end' },
    current: { x: -radius, dirY: -radius * 0.84, spdY: -radius * 0.99, anchor: 'start' },
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

  // === Overlay arrows ===
  // 'from' arrows sit at the rim and point inward, toward where the flow is going.
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

  // 'to' arrows use the same notched shape and size as the wind arrows, but are centered
  // on the needle's pivot and point toward where the flow is going. Optionally they
  // grow with speed, up to the size where they'd reach the major ticks / cardinal labels.
  const renderCurrentArrow = (angleDeg: number, color: string, label: string, spd: number | null) => {
    const rTip = radius * 0.25;
    const rWings = -rTip;
    const rNotch = rWings + radius * 0.05;
    const rText = rWings + radius * 0.15;
    const wingHalfWidth = radius * 0.9 * Math.sin(0.1);

    const angleRad = (angleDeg * Math.PI) / 180;
    const along = (r: number, offset: number) => {
      const p = polarToCartesian(r, angleRad);
      return { x: p.x + offset * Math.cos(angleRad), y: p.y + offset * Math.sin(angleRad) };
    };
    const points = [along(rTip, 0), along(rWings, wingHalfWidth), along(rNotch, 0), along(rWings, -wingHalfWidth)];
    const pText = polarToCartesian(rText, angleRad);

    const scaled = options.currentScaleBySpeed && options.currentSpdField;
    const maxScale = (radius * 0.7) / Math.hypot(rWings, wingHalfWidth);
    const scale = scaled ? speedScale(spd, options.currentScaleMaxSpd ?? 3, 0.4, maxScale) : 1;

    return (
      <g
        opacity={options.currentOpacity ?? 0.85}
        transform={scaled ? `scale(${scale})` : undefined}
        style={scaled ? transitionStyle : undefined}
      >
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={color}
          stroke={colors.text}
          vectorEffect={scaled ? 'non-scaling-stroke' : undefined}
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
      return (
        <SvgNeedle
          radius={radius}
          needleSvg={options.needleSvg}
          size={options.needleImageSize}
          pivot={options.needleImagePivot}
        />
      );
    }
    if (options.needleType === 'png' && options.needlePng) {
      return (
        <PngNeedle
          radius={radius}
          needlePng={options.needlePng}
          size={options.needleImageSize}
          pivot={options.needleImagePivot}
        />
      );
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

        {/* Overlay arrows */}
        {overlays.map(
          (o) =>
            o.dirField && (
              <g
                key={o.key}
                transform={`rotate(${overlayRotation(
                  o.displayDir,
                  displayHeading,
                  o.reference,
                  options.rotationMode
                )})`}
                style={transitionStyle}
                data-testid={o.testIds.arrow}
              >
                {o.dir !== null &&
                  (o.convention === 'to'
                    ? renderCurrentArrow(0, o.color, o.label, o.spd)
                    : renderWindArrow(0, o.color, o.label))}
              </g>
            )
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

        {/* Overlay readouts */}
        {Object.entries(readoutLayout).map(([key, pos]) => {
          const o = overlays.find((overlay) => overlay.key === key)!;
          const textProps = {
            x: pos.x,
            fontFamily: 'system-ui, sans-serif',
            fontSize: radius * 0.15,
            fill: o.color,
            textAnchor: pos.anchor,
            fontWeight: '600',
          };
          return (
            <React.Fragment key={o.key}>
              {options.showHeadingValue && o.dirField && (
                <text {...textProps} y={pos.dirY} data-testid={o.testIds.dir}>
                  {o.dir !== null ? `${Math.round(normalizeDegrees(o.dir))}°` : 'No data'}
                </text>
              )}
              {o.spdField && (
                <text {...textProps} y={pos.spdY} data-testid={o.testIds.spd}>
                  {o.spd !== null ? `${o.spd.toFixed(2)} ${o.spdUom}` : 'No data'}
                </text>
              )}
            </React.Fragment>
          );
        })}
      </g>
    </svg>
  );
};
