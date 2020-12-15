<script lang="typescript">
  import type { Accessor } from './data';
  import { makeLabelDomain, makeValueDomain } from './data';
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleBand } from 'd3-scale';
  import { defaultOrdinalScale } from './colors';

  import ChartContainer from './parts/ChartContainer.svelte';
  import Column from './parts/Column.svelte';
  import Title from './parts/Title.svelte';
  import Legend from './parts/Legend.svelte';
  import AxisX from './parts/AxisX.svelte';
  import AxisY from './parts/AxisY.svelte';
  import Tooltip from './parts/Tooltip.svelte';
  import type { TweenOptions } from './interpolate';
  import type { ChartEvent } from './parts/events';
  import type {
    BarChartDimension,
    AxisXOptions,
    AxisYOptions,
    Padding,
    TitleOptions,
    LegendOptions,
  } from './dimensions';

  export let data: any[];
  export let dimensions: BarChartDimension<any>[];
  export let labels: Accessor;
  export let valueAxis: AxisXOptions = {};
  export let labelAxis: AxisYOptions = {};
  export let title: string | TitleOptions | undefined = undefined;
  export let legend: LegendOptions | undefined = undefined;

  let valueDomainProp: [number, number] | undefined = undefined;
  export { valueDomainProp as valueDomain };
  let labelDomainProp: string[] | undefined = undefined;
  export { labelDomainProp as labelDomain };
  /** The color scale is used for dimensions that lack their own color accessor. */
  export let colorScale = defaultOrdinalScale;
  export let tween: undefined | boolean | TweenOptions = undefined;

  export let pad = 0.2;
  export let innerPad = 0;
  export let aspectRatio: number | undefined = undefined;

  let paddingProp: Padding | undefined = undefined;
  export { paddingProp as padding };
  const standardPadding = { top: 0, bottom: 20, left: 30, right: 0 };

  $: domains = {
    value: {
      prop: valueDomainProp,
      calc: (d: any[]) => makeValueDomain(dimensions, 'value', d || []),
    },
    label: {
      prop: labelDomainProp,
      calc: (d: any[]) => makeLabelDomain(labels, d).reverse(),
    },
  };

  let mouseEvent: ChartEvent | null;
</script>

<ChartContainer
  {standardPadding}
  {paddingProp}
  {colorScale}
  {title}
  {legend}
  {data}
  {aspectRatio}
  {dimensions}
  {domains}
  {tween}
  let:dimensions={actualDimensions}
  let:data={outputData}
  let:padding
  let:position
  let:domains
  let:custom>
  <LayerCake
    data={outputData}
    {padding}
    {position}
    x={actualDimensions.map(() => labels)}
    xScale={scaleBand().paddingInner([pad]).round(true)}
    xDomain={domains.label}
    y={actualDimensions.map((d) => d.value)}
    yScale={valueAxis.scale}
    yDomain={domains.value}
    {custom}>
    <Svg>
      <AxisX gridlines={false} {...labelAxis} />
      <AxisY gridlines={true} baseline={true} angle={45} {...valueAxis} />
      <Column
        {innerPad}
        on:mouseout={() => (mouseEvent = null)}
        on:mousemove={(e) => (mouseEvent = e)} />
      <slot name="svg" />
    </Svg>
    <Html pointerEvents={false}>
      {#if title}
        <Title options={title} />
      {/if}
      {#if legend}
        <Legend {...legend} {colorScale} />
      {/if}
      <Tooltip
        data={mouseEvent?.detail.data}
        header={labels}
        dimensions={actualDimensions} />
      <slot name="html" />
    </Html>
  </LayerCake>
</ChartContainer>
