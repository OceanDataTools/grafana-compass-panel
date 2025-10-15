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
      description: 'Select which field contains the true wind direction value',
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
      description: 'Select which field contains the apparent wind value',
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
      showIf: (opts) => ['needle', 'arrow', 'ship'].includes(opts.needleType || ''),
      settings: { showAlpha: true, mode: 'hue' },
    })
    .addColorPicker({
      path: 'tailColor',
      name: 'Needle Tail Color',
      category: ['Coloring'],
      description: 'Color of the south-pointing side of the needle',
      defaultValue: 'gray',
      showIf: (opts) => opts.needleType === 'needle',
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
          { value: 'svg', label: 'Custom SVG' },
          { value: 'png', label: 'Custom PNG' },
        ],
      },
    })
    .addTextInput({
      path: 'needleSvg',
      name: 'Custom SVG URL / Base64',
      description: 'Provide a URL or data URI for a custom SVG needle',
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
    });
});
