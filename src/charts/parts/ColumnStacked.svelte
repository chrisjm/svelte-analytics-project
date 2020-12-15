<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { eventHandlers } from './events';

  const dispatch = createEventDispatcher();
  const { click, mousemove, mouseout } = eventHandlers(dispatch);

  const { data, xGet, yGet, xScale, custom } = getContext('LayerCake');

  $: columnHeight = (d) => {
    const yVals = $yGet(d);
    return yVals[0] - yVals[1];
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

<g class="column-group" on:mouseout={mouseout(mouseoutCb)}>
  {#each $data as series, seriesIndex}
    {#each series as d, i}
      <rect
        class="group-rect"
        class:outline={highlightedSeries === i}
        data-id={seriesIndex}
        x={$xGet(d)[seriesIndex]}
        y={$yGet(d)[1]}
        width={$xScale.bandwidth()}
        height={columnHeight(d)}
        fill={$custom.dimensions[seriesIndex].color(d)}
        on:click={click(d)}
        on:mousemove={mousemove(d, () => (highlightedSeries = i))} />
    {/each}
  {/each}
</g>
