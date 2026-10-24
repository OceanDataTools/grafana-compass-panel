import { PanelPlugin } from '@grafana/data';
import { CompassPanel } from './components/CompassPanel';
// import { DialTypeEditor } from './components/DialTypeEditor'
import { SimpleOptions } from './types';

export const plugin = new PanelPlugin<SimpleOptions>(CompassPanel).setPanelOptions((builder) => {
  builder
    .addFieldNamePicker({
      path: 'headingField',
      name: 'Heading Field',
      description: 'Select which field contains the heading value',
      defaultValue: '',
    })
    .addFieldNamePicker({
      path: 'trueWindDirField',
      name: 'Truewind Direction Field',
      description:
        "Select which field contains the true wind direction, as an absolute compass bearing (0-360°, independent of the ship's heading)",
      defaultValue: '',
    })
    .addFieldNamePicker({
      path: 'trueWindSpdField',
      name: 'True Wind Velocity Field',
      description: 'Select which field contains the true wind velocity value',
      defaultValue: '',
      showIf: (opts) => opts.trueWindDirField !== '',
    })
    .addSelect({
      path: 'trueWindSpdUom',
      name: 'True wind UOM',
      description: 'Select the true wind velocity unit of measure',
      defaultValue: 'kts',
      settings: {
        options: [
          { value: 'kts', label: 'kts' },
          { value: 'm/s', label: 'm/s' },
          { value: 'mph', label: 'mph' },
          { value: 'kph', label: 'kph' },
        ],
      },
      showIf: (opts) => opts.trueWindSpdField !== '',
    })
    .addFieldNamePicker({
      path: 'apparentWindDirField',
      name: 'Apparent wind Direction Field',
      description:
        "Select which field contains the apparent wind angle, relative to the ship's bow (0-360°, as read directly off a wind vane/anemometer) — NOT an absolute compass bearing",
      defaultValue: '',
    })
    .addFieldNamePicker({
      path: 'apparentWindSpdField',
      name: 'Apparent Wind Velocity Field',
      description: 'Select which field contains the apparent wind velocity value',
      defaultValue: '',
      showIf: (opts) => opts.apparentWindDirField !== '',
    })
    .addSelect({
      path: 'apparentWindSpdUom',
      name: 'Apparent wind UOM',
      description: 'Select the apparent wind velocity unit of measure',
      defaultValue: 'kts',
      settings: {
        options: [
          { value: 'kts', label: 'kts' },
          { value: 'm/s', label: 'm/s' },
          { value: 'mph', label: 'mph' },
          { value: 'kph', label: 'kph' },
        ],
      },
      showIf: (opts) => opts.apparentWindSpdField !== '',
    })
    .addFieldNamePicker({
      path: 'currentDirField',
      name: 'Current Set (Direction) Field',
      description:
        'Select which field contains the water current set — the absolute compass bearing (0-360°) the current is flowing TOWARD (the opposite of the wind\'s "from" convention)',
      defaultValue: '',
    })
    .addFieldNamePicker({
      path: 'currentSpdField',
      name: 'Current Drift (Speed) Field',
      description: 'Select which field contains the water current drift (speed) value',
      defaultValue: '',
      showIf: (opts) => opts.currentDirField !== '',
    })
    .addSelect({
      path: 'currentSpdUom',
      name: 'Current UOM',
      description: 'Select the water current speed unit of measure',
      defaultValue: 'kts',
      settings: {
        options: [
          { value: 'kts', label: 'kts' },
          { value: 'm/s', label: 'm/s' },
          { value: 'cm/s', label: 'cm/s' },
          { value: 'kph', label: 'kph' },
        ],
      },
      showIf: (opts) => opts.currentSpdField !== '',
    })
    .addBooleanSwitch({
      path: 'currentScaleBySpeed',
      name: 'Scale Current Arrow by Speed',
      description: 'Grow the current arrow with the current speed instead of drawing it at a fixed size',
      defaultValue: false,
      showIf: (opts) => !!opts.currentSpdField,
    })
    .addNumberInput({
      path: 'currentScaleMaxSpd',
      name: 'Current Speed at Full Size',
      description:
        'Current speed (in the Current UOM) at which the arrow reaches its largest size, just inside the tick marks. Faster currents are drawn at that same size.',
      defaultValue: 3,
      settings: { min: 0 },
      showIf: (opts) => !!opts.currentSpdField && !!opts.currentScaleBySpeed,
    })
    .addColorPicker({
      path: 'textColor',
      name: 'Text Color',
      category: ['Coloring'],
      description: 'Color of the text and tick marks',
      defaultValue: '#111827',
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'needleColor',
      name: 'Needle Color',
      category: ['Coloring'],
      description: 'Color of the north-pointing side of the needle',
      defaultValue: 'red',
      showIf: (opts) =>
        ['needle', 'arrow', 'ship', 'airplane', 'helicopter', 'underwater-drone', 'quadcopter', 'rov'].includes(
          opts.needleType || ''
        ),
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'tailColor',
      name: 'Needle Tail Color',
      category: ['Coloring'],
      description: 'Color of the south-pointing side of the needle',
      defaultValue: 'gray',
      showIf: (opts) => ['needle'].includes(opts.needleType || ''),
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'dialColor',
      name: 'Dial Color',
      category: ['Coloring'],
      description: 'Background color of the compass dial',
      defaultValue: 'white',
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'bezelColor',
      name: 'Bezel Color',
      category: ['Coloring'],
      description: 'Outer ring color',
      defaultValue: '#c6c6c6',
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'trueWindColor',
      name: 'True Wind Color',
      category: ['Coloring'],
      description: 'Color of the ship profile',
      defaultValue: 'blue',
      showIf: (opts) => opts.trueWindDirField !== '',
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'apparentWindColor',
      name: 'Apparent Wind Color',
      category: ['Coloring'],
      description: 'Color of the ship profile',
      defaultValue: 'yellow',
      showIf: (opts) => opts.apparentWindDirField !== '',
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'currentColor',
      name: 'Current Color',
      category: ['Coloring'],
      description: 'Color of the water current indicator and labels',
      defaultValue: 'green',
      showIf: (opts) => opts.currentDirField !== '',
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addSliderInput({
      path: 'currentOpacity',
      name: 'Current Arrow Opacity',
      category: ['Coloring'],
      description:
        'Opacity of the water current arrow, so the needle underneath stays visible (0 = transparent, 1 = opaque)',
      defaultValue: 0.85,
      showIf: (opts) => opts.currentDirField !== '',
      settings: { min: 0, max: 1, step: 0.05 },
    })
    .addBooleanSwitch({
      path: 'showLabels',
      name: 'Show Cardinal Labels',
      description: 'Display N, E, S, W markers',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showHeadingValue',
      name: 'Show Numeric Heading',
      description: 'Display the heading value in degrees',
      defaultValue: true,
    })
    .addSelect({
      path: 'needleType',
      name: 'Needle Type',
      description: 'Select the style for the compass needle',
      defaultValue: 'needle',
      settings: {
        options: [
          { value: 'needle', label: 'Needle' },
          { value: 'arrow', label: 'Arrow' },
          { value: 'ship', label: 'Ship Outline' },
          { value: 'airplane', label: 'Airplane' },
          { value: 'helicopter', label: 'Helicopter' },
          { value: 'underwater-drone', label: 'Underwater Drone' },
          { value: 'quadcopter', label: 'Quadcopter' },
          { value: 'rov', label: 'ROV' },
          { value: 'svg', label: 'Custom SVG' },
          { value: 'png', label: 'Custom PNG' },
        ],
      },
    })
    .addTextInput({
      path: 'needleSvg',
      name: 'Custom SVG URL / Base64',
      description: 'Provide a URL, data URI, or raw <svg> markup for a custom SVG needle',
      defaultValue: '',
      showIf: (opts) => opts.needleType === 'svg',
    })
    .addTextInput({
      path: 'needlePng',
      name: 'Custom PNG URL / Base64',
      description: 'Provide a URL or data URI for a custom PNG needle',
      defaultValue: '',
      showIf: (opts) => opts.needleType === 'png',
    })
    .addSliderInput({
      path: 'needleImageSize',
      name: 'Custom Needle Size',
      description: 'Size multiplier for the custom SVG/PNG needle. It never grows past the edge of the dial face.',
      defaultValue: 1,
      settings: { min: 0.1, max: 3, step: 0.05 },
      showIf: (opts) => opts.needleType === 'svg' || opts.needleType === 'png',
    })
    .addSelect({
      path: 'needleImagePivot',
      name: 'Custom Needle Pivot',
      description: 'Point of the custom SVG/PNG image that sits on the dial center and rotates in place',
      defaultValue: 'center',
      settings: {
        options: [
          { value: 'center', label: 'Center', description: 'Spins in place, e.g. a top-down vehicle icon' },
          { value: 'bottom', label: 'Bottom center', description: 'Swings like a clock hand' },
        ],
      },
      showIf: (opts) => opts.needleType === 'svg' || opts.needleType === 'png',
    })
    .addSelect({
      path: 'rotationMode',
      name: 'Rotation Mode',
      description: 'Choose whether to rotate the needle or the dial',
      settings: {
        options: [
          { value: 'rotate-needle', label: 'Rotate Needle' },
          { value: 'rotate-dial', label: 'Rotate Dial' },
        ],
      },
      defaultValue: 'rotate-needle',
    })
    .addNumberInput({
      path: 'animationDurationMs',
      name: 'Animation Duration (ms)',
      description:
        'How long needle/dial/wind-arrow rotations take to animate. Lower this (or set to 0 to disable animation) for high-frequency live data where the default speed lags behind incoming updates.',
      defaultValue: 600,
      settings: { min: 0, max: 2000, step: 50 },
    });
});
