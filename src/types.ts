export interface SimpleOptions {
  headingField?: string;
  textColor?: string;
  needleColor?: string;
  tailColor?: string;
  dialColor?: string;
  bezelColor?: string;
  showLabels?: boolean;
  showHeadingValue?: boolean;

  needleType?: 'needle' | 'arrow' | 'ship' | 'svg' | 'png';
  needleSvg?: string;
  needlePng?: string;
}
