export interface SimpleOptions {
  headingField?: string;
  trueWindDirField?: string;
  trueWindSpdField?: string;
  trueWindSpdUom?: string;
  apparentWindSpdField?: string;
  apparentWindDirField?: string;
  apparentWindSpdUom?: string;
  textColor?: string;
  needleColor?: string;
  tailColor?: string;
  dialColor?: string;
  bezelColor?: string;
  trueWindColor?: string;
  apparentWindColor?: string;
  showLabels?: boolean;
  showHeadingValue?: boolean;

  needleType?: 'needle' | 'arrow' | 'ship' | 'svg' | 'png';
  needleSvg?: string;
  needlePng?: string;

  rotationMode?: 'rotate-needle' | 'rotate-dial';
}
