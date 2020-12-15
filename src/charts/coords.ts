import type {
  AnyPosition,
  LegendOptions,
  Padding,
  TitleOptions,
} from './dimensions';

export function polarToRect(r: number, theta: number) {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

export function rectToPolar(x: number, y: number) {
  let r = Math.sqrt(x * x + y * y);
  let theta = Math.atan2(y, x) + Math.PI / 2;
  return [r, theta];
}

export interface PaddingOptions {
  standard: Padding;
  prop?: Padding;
  title?: string | TitleOptions;
  legend?: LegendOptions;
}

export const defaultTitlePosition = 'top';
export const titleHeight = 30;

export function calculatePadding({
  standard,
  prop,
  title,
  legend,
}: PaddingOptions): Padding {
  let p = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    ...standard,
    ...(prop || {}),
  };

  if (legend) {
    switch (legend.position) {
      case 'bottom':
      case 'top':
        p[legend.position] += (legend.height ?? 50) + 20;
        break;
      case 'left':
      case 'right':
        p[legend.position] += (legend.width ?? 200) + 20;
        break;
    }
  }

  if (title) {
    let position = (title as TitleOptions).position ?? defaultTitlePosition;
    if (position === 'top') {
      p.top = (p.top ?? 0) + titleHeight;
    } else if (position === 'bottom') {
      p.bottom = (p.bottom ?? 0) + titleHeight;
    }
  }

  return p;
}
