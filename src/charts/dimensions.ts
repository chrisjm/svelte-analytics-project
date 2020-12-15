import { Accessor, MaybeRawAccessor, oneNestedDataAccessor } from './data';

export interface BaseChartDimension<T = any, RAW extends boolean = true> {
  /** A printable name for this dimension */
  name: MaybeRawAccessor<string, T, RAW>;

  /** The color to render this dimension */
  color?: MaybeRawAccessor<string, T, RAW>;

  /** If the color accessor requires a data element, this field can be a color to use
   * in the legend.
   */
  baseColor?: string;

  /** If the name accessor requires a data element, this field can be a name to use
   * in the legend.
   */
  baseName?: string;
}

export interface SingleValuedChartDimension<T = any, RAW extends boolean = true>
  extends BaseChartDimension<T> {
  value: MaybeRawAccessor<string | number, T, RAW>;

  /** How to format the value when printing its value.  */
  formatValue?: MaybeRawAccessor<string | number, T, RAW>;
}

export interface TwoValuedChartDimension<T = any, RAW extends boolean = true>
  extends BaseChartDimension<T, RAW> {
  x: MaybeRawAccessor<number, T, RAW>;
  formatX?: MaybeRawAccessor<string | number, T, RAW>;
  y: MaybeRawAccessor<string | number, T, RAW>;
  formatY?: MaybeRawAccessor<string | number, T, RAW>;
}

export interface LineChartDimension<T = any, RAW extends boolean = true>
  extends TwoValuedChartDimension<T, RAW> {
  width?: MaybeRawAccessor<string, T, RAW>;
  opacity?: MaybeRawAccessor<number, T, RAW>;

  highlightWidth?: MaybeRawAccessor<string, T, RAW>;
  highlightOpacity?: MaybeRawAccessor<number, T, RAW>;
}

export type BarChartDimension<
  T = any,
  RAW extends boolean = true
> = SingleValuedChartDimension<T, RAW>;

export interface PieChartDimension<T = any, RAW extends boolean = true>
  extends SingleValuedChartDimension<T, RAW> {
  /** Width of the line around each slice. Defaults to 0 (no line) */
  strokeWidth?: number;
  /** Color of the line around each slice. Defaults to black */
  stroke?: string;

  /** Sort the pie slices by name */
  sortByName?: boolean;

  /** Start angle, if not the entire circle.  */
  startAngle?: number;
  /** End angle, if not the entire circle. */
  endAngle?: number;
  /** Padding (in radians) around this pie section */
  padAngle?: number;

  /** How far from the center this arc starts. 0 to 1 */
  innerRadius?: number;
  /** How far from the center this arc ends. 0 to 1 */
  outerRadius?: number;
}

export interface TreeMapDimension<T = any, RAW extends boolean = true>
  extends SingleValuedChartDimension<T, RAW> {}

export interface Axis<T = any> {
  scale?: [number, number];
  ticks?: number | (string | number)[];
  formatTick?: (data: string | number) => string | number;
  xTick?: number;
  yTick?: number;
  dxTick?: number;
  dyTick?: number;
  textAnchor?: string;
  gridlines?: boolean | ((d: T) => boolean);
  baseline?: boolean;
}

export interface AxisXOptions extends Axis {
  snapTicks?: boolean;
}
export type AxisYOptions = Axis;

export interface Padding {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface TitleOptions {
  text: string;
  className?: string;
  position?: 'top' | 'bottom';
}

export interface LegendOptions {
  position: AnyPosition;
  width?: number;
  height?: number;
  columns?: number;
}

export type AnyPosition = 'top' | 'bottom' | 'left' | 'right';

export function getDimensions<T extends BaseChartDimension>(
  dimensions: T[] | undefined,
  $custom: any
): T[] {
  return dimensions || $custom?.dimensions || [$custom?.dimension];
}

export function defaultDimensionValues<T extends BaseChartDimension>(
  d: T,
  index: number,
  colorScale: (value: string | number) => string,
  nested = false
): T {
  let color;
  if (d.color) {
    color = nested ? oneNestedDataAccessor(d.color) : d.color;
  } else {
    let value = colorScale(index);
    color = () => value;
  }

  return {
    ...d,
    color,
  };
}
