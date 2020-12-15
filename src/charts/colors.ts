import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

export const defaultOrdinalScale = scaleOrdinal<string | number>(
  schemeCategory10
);
