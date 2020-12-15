<script lang="typescript">
  import { domainScale, makeValueDomain } from './data';
  import type { Accessor } from './data';
  import { makeTweenStore } from './interpolate';
  import { LayerCake, Svg, Html } from 'layercake';
  import { defaultOrdinalScale } from './colors';

  import MultiLine from './parts/MultiLine.svelte';
  import Legend from './parts/Legend.svelte';
  import Title from './parts/Title.svelte';
  import AxisX from './parts/AxisX.svelte';
  import AxisY from './parts/AxisY.svelte';
  import Tooltip from './parts/Tooltip.svelte';
  import type { QuadtreeItem } from './parts/QuadTree.svelte';
  import QuadTree from './parts/QuadTree.svelte';
  import { defaultDimensionValues } from './dimensions';
  import type {
    LineChartDimension,
    AxisXOptions,
    AxisYOptions,
    Padding,
    TitleOptions,
    LegendOptions,
  } from './dimensions';
  import { calculatePadding } from './coords';

  export let data: any[];
  export let dimensions: LineChartDimension<any>[];
  export let xAxis: AxisXOptions = {};
  export let yAxis: AxisYOptions = {};
  export let title: string | TitleOptions | undefined = undefined;
  export let legend: LegendOptions | undefined = undefined;
  export let boldTooltipLine = false;

  export let tooltipHeader: Accessor | undefined = undefined;
  /** Mouseover highlights just 1 dimension and data point instead of all the lines at that point */
  export let tooltipHighlightsSingleDimension = false;

  export let aspectRatio: number | undefined = undefined;

  let xDomainProp: [number, number] | undefined = undefined;
  export { xDomainProp as xDomain };
  let yDomainProp: string[] | undefined = undefined;
  export { yDomainProp as yDomain };
  /** The color scale is used for dimensions that lack their own color accessor. */
  export let colorScale = defaultOrdinalScale;

  export let tween: undefined | boolean | { duration?: number } = undefined;

  let paddingProp: Padding | undefined = undefined;
  export { paddingProp as padding };

  $: tweenedXDomain = makeTweenStore(tween, 1.5);
  $: tweenedXDomain.set(xDomainProp || makeValueDomain(dimensions, 'x', data));
  $: tweenedYDomain = makeTweenStore(tween, 1.5);
  $: tweenedYDomain.set(yDomainProp || makeValueDomain(dimensions, 'y', data));

  $: xScale = xAxis.scale ?? domainScale($tweenedXDomain);
  $: yScale = yAxis.scale ?? domainScale($tweenedYDomain);

  $: padding = calculatePadding({
    standard: { top: 0, bottom: 20, left: 50 },
    prop: paddingProp,
    title,
    legend,
  });

  let tweenData = makeTweenStore(tween);
  $: if (data) {
    tweenData.set(data);
  }

  $: actualDimensions = dimensions.map((d, index) =>
    defaultDimensionValues(d, index, colorScale)
  );

  let quadtreeResult: QuadtreeItem | undefined;

  $: highlightedLine = tooltipHighlightsSingleDimension
    ? quadtreeResult?.dimension.name?.()
    : undefined;
</script>

<div
  class="w-full relative"
  class:h-full={!aspectRatio}
  style={aspectRatio ? `padding-bottom:${100 / aspectRatio}%` : undefined}>
  <LayerCake
    data={$tweenData}
    {padding}
    position={aspectRatio ? 'absolute' : 'relative'}
    x={actualDimensions.map((d) => d.x)}
    {xScale}
    xDomain={$tweenedXDomain}
    y={actualDimensions.map((d) => d.y)}
    {yScale}
    yDomain={$tweenedYDomain}
    custom={{ dimensions: actualDimensions }}>
    <Svg>
      <AxisX
        gridlines={true}
        baseline={true}
        snapTicks={true}
        angle={45}
        {...xAxis} />
      <AxisY gridlines={false} {...yAxis} />
      <MultiLine highlighted={highlightedLine} />
      <slot name="svg" />
    </Svg>
    <Html>
      {#if title}
        <Title options={title} />
      {/if}
      {#if legend}
        <Legend {...legend} {colorScale} />
      {/if}

      <QuadTree
        dimensions={actualDimensions}
        useY={tooltipHighlightsSingleDimension}
        bind:found={quadtreeResult} />

      {#if quadtreeResult}
        <Tooltip
          data={quadtreeResult.data}
          header={tooltipHeader}
          sort={true}
          dimensions={tooltipHighlightsSingleDimension ? [quadtreeResult.dimension] : actualDimensions} />
        <div
          style="left:{quadtreeResult.x}px;"
          class="absolute inset-y-0 w-px pointer-events-none border border-gray-500"
          class:border-dotted={!boldTooltipLine}
          class:border-solid={boldTooltipLine}
          class:border-2={boldTooltipLine} />
      {/if}

      <slot name="html" />
    </Html>
  </LayerCake>
</div>
