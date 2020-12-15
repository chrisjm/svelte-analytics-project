<script lang="typescript">
  import { getContext, createEventDispatcher } from 'svelte';
  import { eventHandlers } from './events';
  import { arc } from 'd3-shape';
  import type { Pie, PieArcDatum } from 'd3-shape';
  import { polarToRect } from '../coords';
  import zip from 'just-zip-it';
  import type { AccessorFn } from '../data';
  import type { PieChartDimension } from '../dimensions';
  import { getDimensions } from '../dimensions';
  import type { ArrayValue } from '@carevoyance/ts-types';
  import { labelColor } from '../labels';
  import { largestRect } from 'd3plus-shape';
  import AutoSizeLabel from './AutoSizeLabel.svelte';

  export let labels: AccessorFn<string, any>;
  let dimensionsProp: PieChartDimension<any, false>[] | undefined = undefined;
  export { dimensionsProp as dimensions };

  const dispatch = createEventDispatcher();
  const { click, mousemove, mouseout } = eventHandlers(dispatch);

  const { data, custom, width, height } = getContext('LayerCake');

  function labelProps(
    dim: ArrayValue<typeof dimensions>,
    segment: PieArcDatum<any>,
    index: number
  ) {
    let box: number[];
    let anchor = 'middle';
    let text = labels(segment, index);
    let wedgePoly: number[][] | undefined;

    // Figure out where to put the label
    const sweepSize = Math.PI / 8;
    let startAngle = segment.startAngle - Math.PI / 2;
    let endAngle = segment.endAngle - Math.PI / 2;

    let unitCoords = [];
    for (let angle = startAngle; angle < endAngle; angle += sweepSize) {
      unitCoords.push([Math.cos(angle), Math.sin(angle)]);
    }
    unitCoords.push([Math.cos(endAngle), Math.sin(endAngle)]);

    if (dim.innerRadius) {
      wedgePoly = unitCoords
        .map(([x, y]) => [x * dim.innerRadius, y * dim.innerRadius])
        .reverse();
    } else {
      wedgePoly = [[0, 0]];
    }

    wedgePoly.push(
      ...unitCoords.map(([x, y]) => [x * dim.outerRadius, y * dim.outerRadius])
    );

    // largestRect works best if you close the path.
    wedgePoly.push(wedgePoly[0]);

    let rect = largestRect(wedgePoly, {
      angle: 0,
      minAspectRatio: 1,
      maxAspectRatio: 8,
      origin: dim.arc.centroid(segment),
    });

    if (rect.width < 30) {
      // Try again without centroid limit
      rect = largestRect(wedgePoly, {
        angle: 0,
      });
    }

    // console.log({ text, wedgePoly, rect });

    if (rect) {
      box = [
        rect.cx - rect.width / 2,
        rect.cy - rect.height / 2,
        rect.width,
        rect.height,
      ];
    } else {
      box = [0, 0, 0, 0];
    }

    // Calculate a simple label outside the pie, for when the label can't fit right.

    let r = dim.outerRadius * 1.05;

    // Rotate angle by pi/2 since trigonometry functions place 0 at [1,0] and d3-arc assumes 0 is at [0,-1].
    let angle = (segment.endAngle + segment.startAngle) / 2 - Math.PI / 2;
    let simpleCoords = polarToRect(r, angle);

    anchor = angle > Math.PI / 2 && angle < (Math.PI * 3) / 2 ? 'end' : 'start';

    return {
      ...segment,
      simpleCoords,
      box,
      dim,
      anchor,
      bgColor: dim.color(segment, index),
      text,
      wedgePoly: wedgePoly?.map((w) => w.join(',')).join(' '),
    };
  }

  $: radius = Math.min($width, $height) / 2;
  $: dimensions = getDimensions(dimensionsProp, $custom).map(
    (dim, dimIndex) => {
      let innerRadius = (dim.innerRadius || 0) * radius;
      let outerRadius = (dim.outerRadius || 1) * radius;
      let arcGen = arc<any, PieArcDatum<any>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

      return {
        ...dim,
        index: dimIndex,
        innerRadius,
        outerRadius,
        arc: arcGen,
      };
    }
  );

  let output: [PieArcDatum<any>[], ArrayValue<typeof dimensions>][];
  $: output = zip($data as PieArcDatum<any>[][], dimensions);

  let highlighted: number | null;
  function mouseoutCb() {
    highlighted = null;
  }
</script>

<style>
  .outline {
    stroke: #000;
    stroke-width: 2px;
  }
</style>

<g transform="translate({$width / 2}, {$height / 2})">
  <g on:mouseout={mouseout(mouseoutCb)}>
    {#each output as [pie, dim], i}
      {#each pie as segment, segmentNumber (segment.index)}
        <path
          class:outline={highlighted === segmentNumber}
          d={dim.arc(segment)}
          fill={dim.color(segment, segmentNumber)}
          stroke={dim.stroke || 'black'}
          stroke-width={dim.strokeWidth || 0}
          on:click={click(segment)}
          on:mousemove={mousemove(segment, () => (highlighted = segmentNumber))} />
      {/each}
    {/each}
  </g>

  <g style="user-select:none" on:mouseout={mouseout(mouseoutCb)}>
    {#each output as [pie, dim], i}
      {#each pie.map((p, pieIndex) =>
        labelProps(dim, p, pieIndex)
      ) as segment, segmentNumber (segment.index)}
        <g
          on:click={click(segment)}
          on:mousemove={mousemove(segment, () => (highlighted = segmentNumber))}>
          <AutoSizeLabel
            x={segment.box[0]}
            y={segment.box[1]}
            width={segment.box[2]}
            height={segment.box[3]}
            text={segment.text}
            bgColor={segment.bgColor}
            vertAlign="middle"
            horzAlign="center"
            maxFontSize={50}>
            <text
              slot="fallback"
              class="font-sans font-medium text-sm"
              fill={labelColor('white')}
              text-anchor={segment.anchor}
              transform="translate({segment.simpleCoords[0]},{segment.simpleCoords[1]})">
              {segment.text}
            </text>
          </AutoSizeLabel>

          {#if false}
            <!-- Label box wireframe viz, for debugging -->
            {#if segment.box[0]}
              <rect
                x={segment.box[0]}
                y={segment.box[1]}
                width={segment.box[2]}
                height={segment.box[3]}
                fill-opacity="0"
                stroke="black" />
            {/if}
            {#if segment.wedgePoly}
              <polyline
                fill-opacity="0"
                stroke="black"
                stroke-width="2"
                points={segment.wedgePoly} />
            {/if}
          {/if}
        </g>
      {/each}
    {/each}
  </g>
</g>
