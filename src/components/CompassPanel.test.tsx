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
