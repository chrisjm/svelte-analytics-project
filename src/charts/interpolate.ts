import { interpolateHcl } from 'd3-interpolate';
import { tweened } from 'svelte/motion';
import { writable, Writable } from 'svelte/store';

type Interpolator<T> = (t: number) => T;

// This is copied from Svelte and modified to handle color string specifiers.
export function getInterpolator<T>(a: T, b: T): Interpolator<T> {
  if (a === b || a !== a) return () => a;
  const type = typeof a;
  if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    if (a === undefined) {
      return () => b;
    }
    throw new Error('Cannot interpolate values of different type');
  }
  if (Array.isArray(a)) {
    const arr = ((b as unknown) as any[]).map((bi, i) => {
      if (i > a.length) {
        // The array is growing, so just interpolate the new value from 0.
        if (typeof bi === 'number') {
          return (t: number) => t * bi;
        } else {
          return () => bi;
        }
      }
      return getInterpolator(((a as unknown) as any[])[i], bi);
    });
    return (((t: number) =>
      arr.map((fn) => fn(t))) as unknown) as Interpolator<T>;
  }

  if (type === 'object') {
    if (!a || !b) throw new Error('Object cannot be null');
    if (a instanceof Date && b instanceof Date) {
      let aTime = a.getTime();
      let bTime = b.getTime();
      const delta = bTime - aTime;
      return (((t: number) =>
        new Date(aTime + t * delta)) as unknown) as Interpolator<T>;
    }
    const keys = Object.keys(b);
    const interpolators: { [key: string]: Interpolator<any> } = {};
    for (let key of keys) {
      interpolators[key] = getInterpolator(
        a[key as keyof typeof a],
        b[key as keyof typeof b]
      );
    }
    return ((t: number) => {
      const result: Record<string, any> = {};
      for (let key of keys) {
        result[key] = interpolators[key](t);
      }
      return result;
    }) as Interpolator<T>;
  }
  if (type === 'number') {
    // @ts-ignore
    const delta = b - a;
    // @ts-ignore
    return (t) => a + t * delta;
  }

  if (type === 'string') {
    // @ts-ignore
    let prefix = a.slice(0, 3);
    if (
      // @ts-ignore
      a[0] === '#' ||
      prefix === 'hsl' ||
      prefix === 'rgb' ||
      prefix === 'lab' ||
      prefix === 'lch'
    ) {
      // @ts-ignore
      return interpolateHcl(a, b);
    } else {
      return () => b;
    }
  }

  if (type === 'boolean') {
    return () => b;
  }
  throw new Error(`Cannot interpolate ${type} values`);
}

export interface TweenOptions {
  duration: number;
}

export function makeTweenStore<T = any>(
  tweenOptions: boolean | object | undefined,
  durationFactor = 1
): Writable<T[]> {
  let options: object & TweenOptions;
  if (tweenOptions === false) {
    return (writable(undefined) as unknown) as Writable<T[]>;
  } else if ((tweenOptions ?? true) === true) {
    options = { duration: 250 };
  } else {
    options = { duration: 250, ...(tweenOptions as object) };
  }

  options.duration *= durationFactor;

  return (tweened(undefined, {
    ...((options as object) || {}),
    interpolate: getInterpolator,
  }) as unknown) as Writable<T[]>;
}
