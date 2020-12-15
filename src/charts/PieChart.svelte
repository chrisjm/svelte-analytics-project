<script lang="typescript">
  import type { Accessor } from './data';
  import { oneNestedDataAccessor } from './data';
  import { LayerCake, Svg, Html, flatten } from 'layercake';
  import { createAccessor } from './data';
  import { defaultOrdinalScale } from './colors';
  import { pie } from 'd3-shape';
  import sorter from 'sorters';

  import ChartContainer from './parts/ChartContainer.svelte';
  import Pie from './parts/Pie.svelte';
  import Tooltip from './parts/Tooltip.svelte';
  import Legend from './parts/Legend.svelte';
  import Title from './parts/Title.svelte';
  import type { TweenOptions } from './interpolate';
  import type { ChartEvent } from './parts/events';
  import type {
    PieChartDimension,
    Padding,
    TitleOptions,
    LegendOptions,
  } from './dimensions';

  export let data: any[];
  export let dimensions: PieChartDimension[];
  export let labels: Accessor;
  export let title: string | TitleOptions | undefined = undefined;
  export let legend: LegendOptions | undefined = undefined;

  /** The color scale is used for dimensions that lack their own color accessor. */
  export let colorScale = defaultOrdinalScale;
  export let tween: undefined | boolean | TweenOptions = undefined;

  export let aspectRatio: number | undefined = undefined;

  let paddingProp: Padding | undefined = undefined;
  export { paddingProp as padding };
  const standardPadding = { top: 20, bottom: 20, left: 0, right: 0 };

  $: labelAccessor = createAccessor(labels);
  $: pies = dimensions.map((d) => {
    let p = pie()
      .value(createAccessor(d.value))
      .startAngle(d.startAngle ?? 0)
      .endAngle(d.endAngle ?? 2 * Math.PI)
      .padAngle(d.padAngle ?? 0);
    if (d.sortByName && labels) {
      p = p.sort(sorter((l) => labelAccessor(l, 0)));
    }
    return p;
  });
  $: pieShapes = (d: any[]) => pies.map((pie) => pie(d));

  let mouseEvent: ChartEvent | null;
</script>

<ChartContainer
  {standardPadding}
  {paddingProp}
  {colorScale}
  {title}
  {legend}
  {data}
  mapData={pieShapes}
  nested={true}
  {aspectRatio}
  {dimensions}
  {tween}
  let:dimensions={actualDimensions}
  let:data={outputData}
  let:padding
  let:position
  let:custom>
  <LayerCake
    data={outputData}
    {padding}
    {position}
    flatData={flatten(outputData)}
    {custom}>
    <Svg>
      <Pie
        on:mousemove={(e) => (mouseEvent = e)}
        on:mouseout={() => (mouseEvent = null)}
        labels={oneNestedDataAccessor(labels)} />
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
        nestedAccessors={true}
        header={labels}
        dimensions={actualDimensions} />
      <slot name="html" />
    </Html>
  </LayerCake>
</ChartContainer>
