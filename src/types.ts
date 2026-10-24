export interface SimpleOptions {
  headingField?: string;
  trueWindDirField?: string;
  trueWindSpdField?: string;
  trueWindSpdUom?: string;
  apparentWindSpdField?: string;
  apparentWindDirField?: string;
  apparentWindSpdUom?: string;
  currentDirField?: string;
  currentSpdField?: string;
  currentSpdUom?: string;
  textColor?: string;
  needleColor?: string;
  tailColor?: string;
  dialColor?: string;
  bezelColor?: string;
  trueWindColor?: string;
  apparentWindColor?: string;
  currentColor?: string;
  currentOpacity?: number;
  showLabels?: boolean;
  showHeadingValue?: boolean;

  needleType?:
    | 'needle'
    | 'arrow'
    | 'ship'
    | 'airplane'
    | 'helicopter'
    | 'underwater-drone'
    | 'quadcopter'
    | 'rov'
    | 'svg'
    | 'png';
  needleSvg?: string;
  needlePng?: string;

  rotationMode?: 'rotate-needle' | 'rotate-dial';

  animationDurationMs?: number;
}
