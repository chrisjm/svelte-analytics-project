<script lang="typescript">
  import { getContext } from 'svelte';

  const { width, height, xScale, yScale, yRange } = getContext('LayerCake');

  export let gridlines: boolean | ((x: string | number) => boolean) = true;
  export let formatTick: (d: string | number) => string | number = (d) => d;
  export let baseline = false;
  export let snapTicks = false;
  export let ticks: number | number[] | undefined = undefined;
  export let xTick: number | undefined = undefined;
  export let yTick = 16;
  export let dxTick = 0;
  export let dyTick = 0;

  $: gridlinesFn =
    typeof gridlines === 'function' ? gridlines : () => gridlines as boolean;
  $: isBandwidth = typeof $xScale.bandwidth === 'function';
  $: domainTicks = typeof $xScale.ticks !== 'function';

  let tickVals: (string | number)[];
  $: tickVals = Array.isArray(ticks)
    ? ticks
    : isBandwidth || domainTicks
    ? $xScale.domain()
    : $xScale.ticks(ticks);

  function textAnchor(i: number) {
    if (snapTicks === true) {
      if (i === 0) {
        return 'start';
      }
      if (i === tickVals.length - 1) {
        return 'end';
      }
    }
    return 'middle';
  }
</script>

<style>
  .tick {
    font-size: 0.725em;
    font-weight: 200;
  }

  line,
  .tick line {
    stroke: #aaa;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .baseline {
    stroke-dasharray: 0;
  }
</style>

<g class="axis x-axis">
  {#each tickVals as tick, i}
    <g class="tick" transform="translate({$xScale(tick)},{$yRange[0]})">
      {#if gridlinesFn(tick)}
        <line y1={$height * -1} y2="0" x1="0" x2="0" />
      {/if}
      <text
        x={xTick || isBandwidth ? $xScale.bandwidth() / 2 : 0}
        y={yTick}
        dx={dxTick}
        dy={dyTick}
        text-anchor={textAnchor(i)}>
        {formatTick(tick)}
      </text>
    </g>
  {/each}
  {#if baseline === true}
    <line
      class="baseline"
      y1={$height + 0.5}
      y2={$height + 0.5}
      x1="0"
      x2={$width} />
  {/if}
</g>
