import { rgb } from 'd3-color';
import { textWidth, textSplit, textWrap } from 'd3plus-text';
import clamp from 'just-clamp';

// This is from d3plus-color, but with the threshold tweaked.
export function labelColor(bgColor: string) {
  let c = rgb(bgColor);
  const yiq = (c.r * 299 + c.g * 587 + c.b * 114) / 1000;
  return yiq >= 150 ? '#444444' : '#f7f7f7';
}

function ellipsis(text: string, line: number) {
  return line ? `${text.replace(/\.|,$/g, '')}...` : '';
}

export interface LabelPositionOptions {
  text: string;
  width: number;
  height: number;

  /** Fix to this font size. If omitted, font size is dynamically calculated */
  fixedFontSize?: number;
  maxFontSize?: number;
  /** Defaults to Inter + Tailwind defaults sans-serif */
  fontFamily?: string;
  /** Defaults to 400 */
  fontWeight?: number;
  /** Ratio of font size to line height. Defaults to 1.2 */
  lineHeight?: number;
  /** Defaults to top */
  vertAlign?: 'top' | 'middle' | 'bottom';
  /** Defaults to left */
  horzAlign?: 'left' | 'center' | 'right';
}

// This is essentially the algorithm from d3plus-text's Textbox, which is not
// exported on its own.
export function labelPositions({
  text,
  width,
  height,
  fixedFontSize,
  fontFamily,
  fontWeight = 400,
  lineHeight: lhRatio = 1.2,
  vertAlign = 'top',
  horzAlign = 'left',
  maxFontSize: fontMax = 30,
}: LabelPositionOptions) {
  const fontMin = 8;
  const words = textSplit(text);
  const resize = fixedFontSize === undefined;

  let fontSize = fixedFontSize ?? fontMax;
  let line = 1;
  let lineData: string[] = [];
  let sizes: number[];
  let wrapResults;
  let lineHeight = fontMax * lhRatio;

  let style = {
    'font-family':
      fontFamily ||
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    'font-size': fontMax,
    'font-weight': fontWeight,
    'line-height': lineHeight,
  };

  const wrapper = textWrap()
    .fontFamily(style['font-family'])
    .fontSize(fontSize)
    .fontWeight(style['font-weight'])
    .lineHeight(lineHeight)
    .maxLines(3)
    .height(height)
    .overflow(false)
    .width(width)
    .split(textSplit);

  function checkSize() {
    const truncate = () => {
      if (line < 1) lineData = [ellipsis('', line)];
      else lineData[line - 1] = ellipsis(lineData[line - 1], line);
    };

    // Constraint the font size
    fontSize = clamp(fontMin, fontSize, fontMax);

    if (resize) {
      lineHeight = fontSize * lhRatio;
      wrapper.fontSize(fontSize).lineHeight(lineHeight);
      style['font-size'] = fontSize;
      style['line-height'] = lineHeight;
    }

    wrapResults = wrapper(text);
    lineData = wrapResults.lines.filter((l: string) => l !== '');
    line = lineData.length;

    if (wrapResults.truncated) {
      if (resize) {
        fontSize--;
        if (fontSize < fontMin) {
          fontSize = fontMin;
          truncate();
          return;
        } else checkSize();
      } else truncate();
    }
  }

  if (
    width > fontMin &&
    (height > lineHeight || (resize && height > fontMin * lhRatio))
  ) {
    if (resize) {
      sizes = textWidth(words, style);

      const areaMod = 1.165 + (width / height) * 0.1,
        boxArea = width * height,
        maxWidth = Math.max(...sizes),
        textArea =
          sizes.reduce((acc: number, d: number) => acc + d * lineHeight) *
          areaMod;

      if (maxWidth > width || textArea > boxArea) {
        const areaRatio = Math.sqrt(boxArea / textArea),
          widthRatio = width / maxWidth;
        const sizeRatio = Math.min(areaRatio, widthRatio);
        fontSize = Math.floor(fontSize * sizeRatio);
      }

      const heightMax = Math.floor(height * 0.8);
      if (fontSize > heightMax) fontSize = heightMax;
    }

    checkSize();
  }

  let fontHeight = lineHeight / lhRatio;
  let totalHeight = lineData.length * lineHeight + fontHeight;

  let y: (i: number) => number;
  let x: (lineWidth: number) => number;

  switch (horzAlign) {
    case 'left':
      x = () => 0;
      break;
    case 'center':
      x = (lineWidth) => (width - lineWidth) / 2;
      break;
    case 'right':
      x = (lineWidth) => width - lineWidth;
      break;
  }

  switch (vertAlign) {
    case 'top':
      y = (i) => lineHeight * i + fontHeight;
      break;
    case 'middle': {
      let base = (height - totalHeight + fontHeight) / 2;
      y = (i) => base + lineHeight * i + fontHeight;
      break;
    }
    case 'bottom':
      y = (i) => height - lineHeight * i;
      break;
  }

  let lines = lineData.map((l, i) => ({
    text: l,
    width: wrapResults.widths[i],
    x: x(wrapResults.widths[i]),
    y: y(i),
  }));

  return {
    size: fontSize,
    weight: fontWeight,
    lineHeight,
    fontHeight: lineHeight / lhRatio,
    lines,
  };
}

export function labelProps(text: string, bgColor: string) {
  let color = labelColor(bgColor);

  return {
    text,
    color,
  };
}
