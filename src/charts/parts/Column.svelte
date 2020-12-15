<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { eventHandlers } from './events';
  import zip from 'just-zip-it';
  import range from 'just-range';
  import { scaleBand } from 'd3-scale';

  /** For multiple columns in a group, the spacing between columns in the group */
  export let innerPad = 0;

  const dispatch = createEventDispatcher();
  const { click, mousemove, mouseout } = eventHandlers(dispatch);

  const {
    data,
    xGet,
    yGet,
    yRange,
    xScale,
    yScale,
    config,
    custom,
  } = getContext('LayerCake');

  $: columnWidth = (d) => {
    const vals = $xGet(d);
    return Math.max(0, vals[1] - vals[0]);
  };

  $: innerBars = scaleBand()
    .padding([innerPad])
    .domain(range(0, $custom.dimensions.length))
    .range([0, $xScale.bandwidth()]);
</script>

<style>
  .column-group:hover {
    stroke: #000;
    stroke-width: 2px;
  }
</style>

<g class="column-groups" on:mouseout={mouseout()}>
  {#each $data as d, i}
    <g class="column-group">
      {#each zip($xGet(d), $yGet(d), $custom.dimensions) as [x, height, dim], index}
        <rect
          class="group-rect"
          data-id={i}
          x={x + innerBars(index)}
          y={height}
          width={$xScale.bandwidth ? innerBars.bandwidth() : columnWidth(d)}
          height={$yRange[0] - height}
          fill={dim.color(d, i)}
          on:click={click(d)}
          on:mousemove={mousemove(d)} />
      {/each}
    </g>
  {/each}
</g>
