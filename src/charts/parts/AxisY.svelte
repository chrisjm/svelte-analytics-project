<script lang="typescript">
  import { getContext } from 'svelte';

  const { width, height, padding, xRange, xScale, yScale } = getContext(
    'LayerCake'
  );

  export let ticks: number | number[] = 4;
  export let gridlines: boolean | ((x: string | number) => boolean) = true;
  export let baseline = false;
  export let formatTick: (d: string | number) => string | number = (d) => d;
  export let xTick = 0;
  export let yTick = 0;
  export let dxTick = 0;
  export let dyTick = -4;
  export let textAnchor = 'start';

  $: gridlinesFn =
    typeof gridlines === 'function' ? gridlines : () => gridlines as boolean;
  $: isBandwidth = typeof $yScale.bandwidth === 'function';
  $: domainTicks = typeof $yScale.ticks !== 'function';
  $: textAnchorValue = isBandwidth ? 'end' : textAnchor;

  let tickVals: (string | number)[];
  $: tickVals = Array.isArray(ticks)
    ? ticks
    : isBandwidth || domainTicks
    ? $yScale.domain()
    : $yScale.ticks(ticks);
</script>

<style>
  .tick {
    font-size: 0.725em;
    font-weight: 200;
  }

  .tick line {
    stroke: #aaa;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .baseline {
    stroke-dasharray: 0;
  }
</style>

<g class="axis y-axis" transform="translate({-$padding.left}, 0)">
  {#each tickVals as tick, i}
    <g
      class="tick tick-{tick}"
      transform="translate({$xRange[0] + (isBandwidth ? $padding.left : 0)}, {$yScale(tick)})">
      {#if gridlinesFn(tick)}
        <line
          x2="100%"
          y1={yTick + (isBandwidth ? $yScale.bandwidth() / 2 : 0)}
          y2={yTick + (isBandwidth ? $yScale.bandwidth() / 2 : 0)} />
      {/if}
      <text
        x={xTick}
        y={yTick + (isBandwidth ? $yScale.bandwidth() / 2 : 0)}
        dx={isBandwidth ? -5 : dxTick}
        dy={isBandwidth ? 4 : dyTick}
        style="text-anchor:{textAnchorValue};">
        {formatTick(tick)}
      </text>
    </g>
  {/each}
  {#if baseline === true}
    <line class="baseline" x1="-0.5" x2="-0.5" y1="0" y2={$height} />
  {/if}
</g>
