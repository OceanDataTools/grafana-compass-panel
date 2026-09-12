import React from 'react';
import { render, screen } from '@testing-library/react';
import { PanelProps } from '@grafana/data';
import { CompassPanel } from './CompassPanel';
import { SimpleOptions } from '../types';

function makeProps(overrides: {
  fields: Record<string, number[]>;
  options?: Partial<SimpleOptions>;
}): PanelProps<SimpleOptions> {
  const fields = Object.entries(overrides.fields).map(([name, values]) => ({ name, values }));

  return {
    data: { series: [{ fields }] },
    width: 400,
    height: 400,
    options: {
      headingField: 'heading',
      showHeadingValue: true,
      showLabels: true,
      needleType: 'needle',
      rotationMode: 'rotate-needle',
      ...overrides.options,
    },
    fieldConfig: { defaults: {}, overrides: [] },
    id: 1,
  } as unknown as PanelProps<SimpleOptions>;
}

describe('CompassPanel', () => {
  it('renders the needle and numeric readout when heading is exactly 0', () => {
    const props = makeProps({ fields: { heading: [0] } });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-numeric-heading')).toHaveTextContent('0°');
    // The needle group must contain rendered shapes, not a bare "0" text node
    // (a `heading && renderNeedle()` style falsy-zero bug renders literal "0").
    expect(screen.getByTestId('compass-needle').textContent).not.toBe('0');
    expect(screen.getByTestId('compass-needle').querySelector('polygon')).not.toBeNull();
  });

  it('renders a non-zero numeric heading normally', () => {
    const props = makeProps({ fields: { heading: [90] } });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-numeric-heading')).toHaveTextContent('90°');
  });

  it('shows "No data" only when heading is truly absent', () => {
    const props = makeProps({ fields: { heading: [] } });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-numeric-heading')).toHaveTextContent('No data');
  });

  it('renders 0 kts apparent wind speed instead of "No data"', () => {
    const props = makeProps({
      fields: { heading: [10], apparentWindDir: [45], apparentWindSpd: [0] },
      options: {
        apparentWindDirField: 'apparentWindDir',
        apparentWindSpdField: 'apparentWindSpd',
        apparentWindSpdUom: 'kts',
      },
    });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('windrose-numeric-apparentwind-spd')).toHaveTextContent('0.00 kts');
  });

  it('does not render an invalid rotate(null) transform when wind direction data is absent', () => {
    const props = makeProps({
      fields: { heading: [90], apparentWindDir: [], trueWindDir: [] },
      options: { apparentWindDirField: 'apparentWindDir', trueWindDirField: 'trueWindDir' },
    });
    const { container } = render(<CompassPanel {...props} />);

    expect(container.innerHTML).not.toContain('rotate(null)');
  });
});

describe('CompassPanel animation duration', () => {
  it('defaults the needle transition to 600ms when unset', () => {
    const props = makeProps({ fields: { heading: [90] } });
    render(<CompassPanel {...props} />);

    const needle = screen.getByTestId('compass-needle');
    expect(needle.getAttribute('style')).toContain('600ms');
  });

  it('uses the configured animationDurationMs', () => {
    const props = makeProps({ fields: { heading: [90] }, options: { animationDurationMs: 100 } });
    render(<CompassPanel {...props} />);

    const needle = screen.getByTestId('compass-needle');
    expect(needle.getAttribute('style')).toContain('100ms');
  });

  it('disables the transition entirely when animationDurationMs is 0', () => {
    const props = makeProps({ fields: { heading: [90] }, options: { animationDurationMs: 0 } });
    render(<CompassPanel {...props} />);

    const needle = screen.getByTestId('compass-needle');
    expect(needle.getAttribute('style')).toBeFalsy();
  });
});

describe('CompassPanel needle shapes', () => {
  it.each([
    ['airplane', 'compass-airplane-needle'],
    ['helicopter', 'compass-helicopter-needle'],
    ['underwater-drone', 'compass-underwaterdrone-needle'],
    ['quadcopter', 'compass-quadcopter-needle'],
    ['rov', 'compass-rov-needle'],
  ] as const)('renders the %s needle shape', (needleType, testId) => {
    const props = makeProps({ fields: { heading: [90] }, options: { needleType } });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-needle').querySelector(`[data-testid="${testId}"]`)).not.toBeNull();
  });
});
