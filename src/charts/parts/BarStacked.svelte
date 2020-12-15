<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { eventHandlers } from './events';

  const dispatch = createEventDispatcher();
  const { click, mousemove, mouseout } = eventHandlers(dispatch);

  const { data, xGet, yGet, yScale, custom } = getContext('LayerCake');

  $: columnWidth = (d) => {
    const xVals = $xGet(d);
    return xVals[1] - xVals[0];
  };

  let highlightedSeries;
  function mouseoutCb() {
    highlightedSeries = null;
  }
</script>

<style>
  .outline {
    stroke: #000;
    stroke-width: 2px;
  }
</style>

<g class="bar-groups" on:mouseout={mouseout(mouseoutCb)}>
  {#each $data as series, seriesIndex}
    {#each series as d, i}
      <rect
        class="group-rect"
        class:outline={highlightedSeries === i}
        data-id={i}
        x={$xGet(d)[0]}
        y={$yGet(d)[seriesIndex]}
        height={$yScale.bandwidth()}
        width={columnWidth(d)}
        fill={$custom.dimensions[seriesIndex].color(d)}
        on:click={click(d)}
        on:mousemove={mousemove(d, () => (highlightedSeries = i))} />
    {/each}
  {/each}
</g>
