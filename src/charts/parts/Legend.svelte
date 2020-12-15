<script lang="ts">
  import { getDimensions } from '../dimensions';
  import type { BaseChartDimension, AnyPosition } from '../dimensions';
  import { getContext } from 'svelte';
  import { createAccessor, oneNestedDataAccessor } from '../data';
  import { defaultOrdinalScale } from '../colors';

  /** Position within the graph. Doesn't apply outside the graph */
  export let position: AnyPosition | undefined = undefined;
  export let dimensions: BaseChartDimension[] | undefined = undefined;
  export let colorScale = defaultOrdinalScale;
  export let nestedAccessors = false;
  export let inChartAppearance = true;
  export let columns = 1;

  let classNames = '';
  export { classNames as class };

  export let width: string | number | undefined = undefined;
  export let height: string | number | undefined = undefined;

  let { custom, padding } = getContext('LayerCake') || {};
  let inGraph = Boolean(custom);

  $: inputDimensions = getDimensions(dimensions, $custom);

  $: accessorCreator = nestedAccessors ? oneNestedDataAccessor : createAccessor;
  $: accessors = inputDimensions
    .map((d: BaseChartDimension, index: number) => {
      let nameAccessor = d.baseName ? () => d.baseName : d.name;
      let colorAccessor = d.baseColor ? () => d.baseColor : d.color;
      return {
        label: nameAccessor ? accessorCreator(nameAccessor) : undefined,
        color: colorAccessor
          ? accessorCreator(colorAccessor)
          : () => colorScale(index),
      };
    })
    .filter((d) => d.label && d.color);

  // Position the legend all the way on the edge, and centered on the other axis.
  let positionStyles: string;
  $: if (inGraph && position) {
    let paddingValue = $padding[position];
    let crossAxisProp = ['left', 'right'].includes(position) ? 'top' : 'left';
    let crossAxisPx = ['left', 'right'].includes(position) ? 'Y' : 'X';
    positionStyles = `${position}:-${paddingValue}px;${crossAxisProp}:50%;transform:translate${crossAxisPx}(-50%)`;
  }

  function asUnit(x: string | number) {
    if (typeof x === 'number') {
      return x + 'px';
    }

    return x;
  }

  $: style = [
    `grid-template-columns:repeat(${columns}, 1fr)`,
    width ? `width:${asUnit(width)}` : null,
    height ? `height:${asUnit(height)}` : null,
    positionStyles,
  ]
    .filter(Boolean)
    .join(';');
</script>

<style lang="postcss">
  .in-chart {
    @apply bg-gray-50 border-gray-700 border;
  }
</style>

<div
  {style}
  class="grid text-sm text-black p-2 gap-y-1 {classNames}"
  class:absolute={inGraph}
  class:in-chart={inChartAppearance}>
  {#each accessors as acc}
    <div class="flex items-center">
      <div
        class="w-4 h-4 inline-block mr-2"
        style="background-color:{acc.color(null)}">
        &nbsp;
      </div>
      <span>{acc.label(null)}</span>
    </div>
  {/each}
</div>
