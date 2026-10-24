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

describe('CompassPanel water current', () => {
  const currentOptions: Partial<SimpleOptions> = {
    currentDirField: 'currentDir',
    currentSpdField: 'currentSpd',
    currentSpdUom: 'cm/s',
  };

  it('renders nothing current-related when no current field is configured', () => {
    const props = makeProps({ fields: { heading: [90], currentDir: [45] } });
    render(<CompassPanel {...props} />);

    expect(screen.queryByTestId('compass-arrow-current')).toBeNull();
    expect(screen.queryByTestId('currentrose-numeric-current-dir')).toBeNull();
    expect(screen.queryByTestId('currentrose-numeric-current-spd')).toBeNull();
  });

  it('renders the current arrow and readouts without any wind configured', () => {
    const props = makeProps({
      fields: { heading: [90], currentDir: [45], currentSpd: [12.5] },
      options: currentOptions,
    });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-arrow-current').querySelector('polygon')).not.toBeNull();
    expect(screen.getByTestId('currentrose-numeric-current-dir')).toHaveTextContent('45°');
    expect(screen.getByTestId('currentrose-numeric-current-spd')).toHaveTextContent('12.50 cm/s');
    expect(screen.queryByTestId('compass-arrow-truewind')).toBeNull();
  });

  it('renders current alongside true and apparent wind', () => {
    const props = makeProps({
      fields: { heading: [90], currentDir: [45], currentSpd: [1], trueWindDir: [170], apparentWindDir: [80] },
      options: { ...currentOptions, trueWindDirField: 'trueWindDir', apparentWindDirField: 'apparentWindDir' },
    });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-arrow-current')).toBeInTheDocument();
    expect(screen.getByTestId('compass-arrow-truewind')).toBeInTheDocument();
    expect(screen.getByTestId('compass-arrow-apparentwind')).toBeInTheDocument();
    expect(screen.getByTestId('currentrose-numeric-current-dir')).toHaveTextContent('45°');
    expect(screen.getByTestId('windrose-numeric-truewind-dir')).toHaveTextContent('170°');
  });

  it('draws the current set as an earth-referenced bearing in both rotation modes', () => {
    const northUp = makeProps({
      fields: { heading: [90], currentDir: [45] },
      options: { ...currentOptions, rotationMode: 'rotate-needle' },
    });
    const { unmount } = render(<CompassPanel {...northUp} />);
    expect(screen.getByTestId('compass-arrow-current').getAttribute('transform')).toBe('rotate(45)');
    unmount();

    const bowUp = makeProps({
      fields: { heading: [90], currentDir: [45] },
      options: { ...currentOptions, rotationMode: 'rotate-dial' },
    });
    render(<CompassPanel {...bowUp} />);
    expect(screen.getByTestId('compass-arrow-current').getAttribute('transform')).toBe('rotate(-45)');
  });

  it('points the current arrow outward (toward the set) rather than inward like wind', () => {
    const props = makeProps({
      fields: { heading: [0], currentDir: [0], trueWindDir: [0] },
      options: { ...currentOptions, trueWindDirField: 'trueWindDir' },
    });
    render(<CompassPanel {...props} />);

    // Unrotated, "outward" is toward negative y. The current arrow's tip is its
    // outermost point; the wind arrow's tip is its innermost point.
    const ys = (testId: string) =>
      screen
        .getByTestId(testId)
        .querySelector('polygon')!
        .getAttribute('points')!
        .split(' ')
        .map((p) => Number(p.split(',')[1]));
    const tipY = (testId: string) => ys(testId)[testId === 'compass-arrow-current' ? 3 : 0];

    expect(tipY('compass-arrow-current')).toBe(Math.min(...ys('compass-arrow-current')));
    expect(tipY('compass-arrow-truewind')).toBe(Math.max(...ys('compass-arrow-truewind')));
  });

  it('centers the current arrow on the needle pivot', () => {
    const props = makeProps({ fields: { heading: [0], currentDir: [0] }, options: currentOptions });
    render(<CompassPanel {...props} />);

    const ys = screen
      .getByTestId('compass-arrow-current')
      .querySelector('polygon')!
      .getAttribute('points')!
      .split(' ')
      .map((p) => Number(p.split(',')[1]));

    // Tip and tail are equidistant from the origin, the point the needle rotates around.
    expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(0);
  });

  it('shows "No data" and no rotate(null) when current values are absent', () => {
    const props = makeProps({ fields: { heading: [90], currentDir: [], currentSpd: [] }, options: currentOptions });
    const { container } = render(<CompassPanel {...props} />);

    expect(container.innerHTML).not.toContain('rotate(null)');
    expect(screen.getByTestId('compass-arrow-current').querySelector('polygon')).toBeNull();
    expect(screen.getByTestId('currentrose-numeric-current-dir')).toHaveTextContent('No data');
    expect(screen.getByTestId('currentrose-numeric-current-spd')).toHaveTextContent('No data');
  });

  it('renders 0 drift instead of "No data"', () => {
    const props = makeProps({ fields: { heading: [90], currentDir: [0], currentSpd: [0] }, options: currentOptions });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('currentrose-numeric-current-dir')).toHaveTextContent('0°');
    expect(screen.getByTestId('currentrose-numeric-current-spd')).toHaveTextContent('0.00 cm/s');
  });
});
