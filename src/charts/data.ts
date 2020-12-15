import get from 'just-safe-get';
import uniq from 'just-unique';
import flatten from 'just-flatten-it';
import range from 'just-range';
import type { FilteredKeys } from '@carevoyance/ts-types';
import { stack } from 'd3-shape';
import type { BaseChartDimension } from './dimensions';
import type { Readable } from 'svelte/store';
import { scalePoint, scaleLinear } from 'd3-scale';

export const NESTED_ACCESSOR = Symbol('nested_accessor');
export type AccessorFn<T = number, ITEM = any> = ((
  item: ITEM,
  index: number | string
) => T) & { [NESTED_ACCESSOR]?: boolean };
export type Accessor<T = number, ITEM = any> =
  | (string & { [NESTED_ACCESSOR]?: boolean })
  | AccessorFn<T, ITEM>;

export type MaybeRawAccessor<
  T = number,
  ITEM = any,
  RAW extends boolean = true
> = RAW extends true ? Accessor<T, ITEM> : AccessorFn<T, ITEM>;

export function getValue(d: any, key: Function | string) {
  return typeof key === 'function' ? key(d) : get(d, key);
}

/** Get all the labels from the data. This returns the labels in the order they occur
 * in the data. */
function allLabels(accessors: AccessorFn<string, any>[], data: any[]) {
  let seen = new Set<string>();
  let labels: string[] = [];

  for (let i in data) {
    let d = data[i];
    for (let acc of accessors) {
      let value = acc(d, i);
      if (!seen.has(value)) {
        labels.push(value);
        seen.add(value);
      }
    }
  }

  return labels;
}

export function makeLabelDomain(
  acc: Accessor<string, any>,
  data: any[]
): string[] {
  let labelGetter: AccessorFn<string, any> = createAccessor(acc);
  return allLabels([labelGetter], data);
}

export function makeValueDomain<
  D extends BaseChartDimension<T>,
  T extends object = object
>(
  dimensions: D[],
  accessorName: FilteredKeys<D, Accessor<any, T>>,
  data: any[],
  sumAccessors = false
) {
  let accessors = dimensions.map((d) =>
    // Typescript can't infer the type when we actually use accessorName, so just pass through unknown.
    createAccessor((d[accessorName] as unknown) as Accessor<any, T>)
  );

  let max = -Infinity;

  let checkTypeValue = accessors[0](data[0], 0);
  if (typeof checkTypeValue === 'string') {
    // If it's a string, then we want to return a list of the strings instead of a min/max.
    return allLabels(accessors, data);
  }

  for (let index in data) {
    let sum = 0;
    let item = data[index];
    for (let acc of accessors) {
      let value = acc(item, index);
      if (sumAccessors) {
        sum += value;
      } else {
        max = Math.max(max, value);
      }
    }

    if (sumAccessors) {
      max = Math.max(max, sum);
    }
  }

  return [0, Math.max(max, 0)];
}

export function createD3Stack(dimensions: { value: Accessor }[]) {
  return stack()
    .keys(dimensions.map((d) => d.value))
    .value(getValue);
}

export function oneNestedDataAccessor<
  T = any,
  V extends object = object,
  U extends { data: V } = { data: V }
>(key: Accessor<T, U | V>) {
  if (!key) {
    return null;
  }

  if (key[NESTED_ACCESSOR]) {
    // Don't nest an accessor if it's already nested.
    return (key as unknown) as AccessorFn<T, U>;
  }

  let accessor = createAccessor<T, V>(key);
  let nestedAccessor: AccessorFn<T, U> = (d, index) => accessor(d.data, index);
  nestedAccessor[NESTED_ACCESSOR] = true;

  return nestedAccessor;
}

export function nestedDataAccessor<T>(dimensions: T[], keyFn: (dim: T) => any) {
  return dimensions.map((dim) => oneNestedDataAccessor(keyFn(dim)));
}

export function createAccessor<T = any, U extends object = object>(
  a: Accessor<T, U>,
  map?: (value: any) => any
): AccessorFn<T, U> {
  let accessor =
    typeof a === 'string'
      ? (((obj) => get(obj, a)) as AccessorFn<T, U>)
      : (a as AccessorFn<T, U>);
  if (map) {
    return (obj, index) => map(accessor(obj, index));
  } else {
    return accessor;
  }
}

export function domainScale(values: string[] | number[]) {
  if (typeof values[0] === 'string') {
    return scalePoint()
      .domain(values as string[])
      .range(range(0, values.length));
  } else {
    return scaleLinear().domain(values as number[]);
  }
}

export interface LayerCakeCustom<
  DIM extends BaseChartDimension = BaseChartDimension
> {
  dimensions?: DIM[];
  dimension?: DIM[];
}

export type LayerCakeAccessor<T> = (value: T) => number | number[];

export interface LayerCakeContext<
  T,
  DIM extends BaseChartDimension = BaseChartDimension
> {
  data: Readable<T>;
  custom: Readable<LayerCakeCustom<DIM>>;

  width: Readable<number>;
  height: Readable<number>;
  aspectRatio: Readable<number>;

  containerWidth: Readable<number>;
  containerHeight: Readable<number>;
  box: Readable<{
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  }>;
  extents: Readable<Record<string, number[]>>;

  x: Readable<LayerCakeAccessor<T>>;
  y: Readable<LayerCakeAccessor<T>>;
  z: Readable<LayerCakeAccessor<T>>;
  r: Readable<LayerCakeAccessor<T>>;

  xGet: Readable<LayerCakeAccessor<T>>;
  yGet: Readable<LayerCakeAccessor<T>>;
  zGet: Readable<LayerCakeAccessor<T>>;
  rGet: Readable<LayerCakeAccessor<T>>;

  xScale: Readable<(d: string | number) => number>;
  yScale: Readable<(d: string | number) => number>;
  zScale: Readable<(d: string | number) => number>;
  rScale: Readable<(d: string | number) => number>;

  xDomain: Readable<number[]>;
  yDomain: Readable<number[]>;
  zDomain: Readable<number[]>;
  rDomain: Readable<number[]>;

  xRange: Readable<number[]>;
  yRange: Readable<number[]>;
  zRange: Readable<number[]>;
  rRange: Readable<number[]>;
}
