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

    // Unrotated, "outward" is toward negative y. Both arrows list their tip first;
    // the current arrow's tip is its outermost point, the wind arrow's its innermost.
    const ys = (testId: string) =>
      screen
        .getByTestId(testId)
        .querySelector('polygon')!
        .getAttribute('points')!
        .split(' ')
        .map((p) => Number(p.split(',')[1]));
    const tipY = (testId: string) => ys(testId)[0];

    expect(tipY('compass-arrow-current')).toBe(Math.min(...ys('compass-arrow-current')));
    expect(tipY('compass-arrow-truewind')).toBe(Math.max(...ys('compass-arrow-truewind')));
  });

  it('defaults the current arrow to 0.85 opacity', () => {
    const props = makeProps({ fields: { heading: [0], currentDir: [0] }, options: currentOptions });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-arrow-current').querySelector('g')!.getAttribute('opacity')).toBe('0.85');
  });

  it('applies the configured current arrow opacity', () => {
    const props = makeProps({
      fields: { heading: [0], currentDir: [0] },
      options: { ...currentOptions, currentOpacity: 0.4 },
    });
    render(<CompassPanel {...props} />);

    expect(screen.getByTestId('compass-arrow-current').querySelector('g')!.getAttribute('opacity')).toBe('0.4');
  });

  describe('scaling by speed', () => {
    const scaleOptions: Partial<SimpleOptions> = {
      ...currentOptions,
      currentScaleBySpeed: true,
      currentScaleMaxSpd: 3,
    };
    const arrowGroup = () => screen.getByTestId('compass-arrow-current').querySelector('g')!;
    const scaleOf = () => Number(/scale\(([^)]+)\)/.exec(arrowGroup().getAttribute('transform') ?? '')![1]);

    it('does not scale the arrow unless enabled', () => {
      const props = makeProps({ fields: { heading: [0], currentDir: [0], currentSpd: [3] }, options: currentOptions });
      render(<CompassPanel {...props} />);

      expect(arrowGroup().getAttribute('transform')).toBeNull();
    });

    it('shrinks the arrow when the current is slack', () => {
      const props = makeProps({ fields: { heading: [0], currentDir: [0], currentSpd: [0] }, options: scaleOptions });
      render(<CompassPanel {...props} />);

      expect(scaleOf()).toBeCloseTo(0.4);
    });

    it('grows with speed', () => {
      const slow = makeProps({ fields: { heading: [0], currentDir: [0], currentSpd: [1] }, options: scaleOptions });
      const { unmount } = render(<CompassPanel {...slow} />);
      const slowScale = scaleOf();
      unmount();

      const fast = makeProps({ fields: { heading: [0], currentDir: [0], currentSpd: [2] }, options: scaleOptions });
      render(<CompassPanel {...fast} />);
      expect(scaleOf()).toBeGreaterThan(slowScale);
    });

    it.each([3, 50])('never reaches the major tick marks (speed %d, limit 3)', (spd) => {
      const props = makeProps({ fields: { heading: [0], currentDir: [0], currentSpd: [spd] }, options: scaleOptions });
      const { container } = render(<CompassPanel {...props} />);

      const extent =
        scaleOf() *
        Math.max(
          ...arrowGroup()
            .querySelector('polygon')!
            .getAttribute('points')!
            .split(' ')
            .map((p) => Math.hypot(...p.split(',').map(Number)))
        );

      // Major ticks are the thickest tick lines; their inner end is the closest any tick gets.
      const ticks = Array.from(container.querySelectorAll('[data-testid="compass-dial"] line'));
      const majorWidth = Math.max(...ticks.map((l) => Number(l.getAttribute('stroke-width'))));
      const tickInner = Math.min(
        ...ticks
          .filter((l) => Number(l.getAttribute('stroke-width')) === majorWidth)
          .map((l) => Math.hypot(Number(l.getAttribute('x2')), Number(l.getAttribute('y2'))))
      );

      expect(extent).toBeLessThan(tickInner);
      expect(extent).toBeGreaterThan(tickInner * 0.9);
    });

    it('draws the arrow at normal size when the speed is missing', () => {
      const props = makeProps({ fields: { heading: [0], currentDir: [0], currentSpd: [] }, options: scaleOptions });
      render(<CompassPanel {...props} />);

      expect(scaleOf()).toBe(1);
    });
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

describe('CompassPanel custom image needles', () => {
  const svg = 'data:image/svg+xml;base64,' + Buffer.from('<svg viewBox="0 0 10 10"/>').toString('base64');
  const imageAttrs = (testId: string) => {
    const img = screen.getByTestId(testId);
    return {
      x: Number(img.getAttribute('x')),
      y: Number(img.getAttribute('y')),
      width: Number(img.getAttribute('width')),
      height: Number(img.getAttribute('height')),
      preserveAspectRatio: img.getAttribute('preserveAspectRatio'),
    };
  };

  it.each([
    ['svg', { needleSvg: svg }, 'compass-svg-needle'],
    ['png', { needlePng: 'data:image/png;base64,AAAA' }, 'compass-png-needle'],
  ] as const)('centers a %s needle on the pivot by default, keeping its aspect ratio', (needleType, extra, testId) => {
    const props = makeProps({ fields: { heading: [90] }, options: { needleType, ...extra } });
    render(<CompassPanel {...props} />);

    const a = imageAttrs(testId);
    expect(a.width).toBe(a.height);
    expect(a.x).toBeCloseTo(-a.width / 2);
    expect(a.y).toBeCloseTo(-a.height / 2);
    expect(a.preserveAspectRatio).toBe('xMidYMid meet');
  });

  it('puts the bottom-center of the image on the pivot when requested', () => {
    const props = makeProps({
      fields: { heading: [90] },
      options: { needleType: 'png', needlePng: 'data:image/png;base64,AAAA', needleImagePivot: 'bottom' },
    });
    render(<CompassPanel {...props} />);

    const a = imageAttrs('compass-png-needle');
    expect(a.x).toBeCloseTo(-a.width / 2);
    expect(a.y + a.height).toBeCloseTo(0);
    expect(a.preserveAspectRatio).toBe('xMidYMax meet');
  });

  it('scales the image by the size multiplier', () => {
    const base = makeProps({ fields: { heading: [90] }, options: { needleType: 'svg', needleSvg: svg } });
    const { unmount } = render(<CompassPanel {...base} />);
    const normal = imageAttrs('compass-svg-needle').width;
    unmount();

    const doubled = makeProps({
      fields: { heading: [90] },
      options: { needleType: 'svg', needleSvg: svg, needleImageSize: 0.5 },
    });
    render(<CompassPanel {...doubled} />);
    expect(imageAttrs('compass-svg-needle').width).toBeCloseTo(normal * 0.5);
  });

  describe('never extends past the dial face', () => {
    const dialRadius = (container: HTMLElement) =>
      Number(container.querySelector('[data-testid="compass-face"]')!.getAttribute('r'));
    const tallSvg = 'data:image/svg+xml;base64,' + Buffer.from('<svg viewBox="0 0 20 100"/>').toString('base64');

    it.each([
      ['a square SVG spinning in place', { needleType: 'svg', needleSvg: svg }, 'compass-svg-needle', 0.5, 0.5],
      ['a tall SVG spinning in place', { needleType: 'svg', needleSvg: tallSvg }, 'compass-svg-needle', 0.1, 0.5],
      [
        'a tall SVG swinging from its base',
        { needleType: 'svg', needleSvg: tallSvg, needleImagePivot: 'bottom' },
        'compass-svg-needle',
        0.1,
        1,
      ],
      [
        'a PNG of not-yet-known shape',
        { needleType: 'png', needlePng: 'data:image/png;base64,AAAA' },
        'compass-png-needle',
        0.5,
        0.5,
      ],
    ] as const)('%s at 3x', (_, extra, testId, halfWidthFrac, reachFrac) => {
      const props = makeProps({ fields: { heading: [90] }, options: { ...extra, needleImageSize: 3 } });
      const { container } = render(<CompassPanel {...props} />);

      // The drawn image's farthest corner from the pivot, given its share of the box.
      const { width } = imageAttrs(testId);
      const reach = Math.hypot(width * halfWidthFrac, width * reachFrac);
      expect(reach).toBeCloseTo(dialRadius(container));
    });

    it('lets a tall needle grow longer than a square icon before capping', () => {
      const tall = makeProps({
        fields: { heading: [90] },
        options: { needleType: 'svg', needleSvg: tallSvg, needleImageSize: 3 },
      });
      const { unmount } = render(<CompassPanel {...tall} />);
      const tallSide = imageAttrs('compass-svg-needle').width;
      unmount();

      const square = makeProps({
        fields: { heading: [90] },
        options: { needleType: 'svg', needleSvg: svg, needleImageSize: 3 },
      });
      render(<CompassPanel {...square} />);
      expect(tallSide).toBeGreaterThan(imageAttrs('compass-svg-needle').width);
    });

    it('leaves the default 1x size uncapped', () => {
      const props = makeProps({ fields: { heading: [90] }, options: { needleType: 'svg', needleSvg: svg } });
      render(<CompassPanel {...props} />);

      // 1.2 x radius (200 for a 400px panel).
      expect(imageAttrs('compass-svg-needle').width).toBeCloseTo(240);
    });
  });
});
