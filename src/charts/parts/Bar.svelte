<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { eventHandlers } from './events';
  import zip from 'just-zip-it';
  import range from 'just-range';
  import { scaleBand } from 'd3-scale';

  /** For multiple bars in a group, the spacing between columns in the group */
  export let innerPad = 0;

  const dispatch = createEventDispatcher();
  const { click, mousemove, mouseout } = eventHandlers(dispatch);

  const {
    data,
    xGet,
    yGet,
    xRange,
    xScale,
    yScale,
    config,
    custom,
  } = getContext('LayerCake');

  $: innerBars = scaleBand()
    .padding([innerPad])
    .domain(range(0, $custom.dimensions.length))
    .range([0, $yScale.bandwidth()]);
</script>

<style>
  .bar-group:hover {
    stroke: #000;
    stroke-width: 2px;
  }
</style>

<g class="bar-groups" on:mouseout={mouseout()}>
  {#each $data as d, i}
    <g class="bar-group">
      {#each zip($xGet(d), $yGet(d), $custom.dimensions) as [width, y, dim], index}
        <rect
          class="group-rect"
          data-id={i}
          x={$xRange[0]}
          y={y + innerBars(index)}
          height={innerBars.bandwidth()}
          {width}
          fill={dim.color(d, i)}
          on:click={click(d)}
          on:mousemove={mousemove(d)} />
      {/each}
    </g>
  {/each}
</g>
