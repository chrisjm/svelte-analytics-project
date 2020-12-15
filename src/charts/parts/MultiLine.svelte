<script lang="typescript">
  import { raise } from 'layercake';
  import type { LineChartDimension } from '../dimensions';
  import { getDimensions } from '../dimensions';
  import { getContext, tick } from 'svelte';

  const {
    data,
    xGet,
    yGet,
    zGet,
    xScale,
    yScale,
    xRange,
    yRange,
    xDomain,
    yDomain,
    custom,
  } = getContext('LayerCake');

  export let highlighted: string | undefined = undefined;
  export let highlightWidth = '5px';
  export let highlightOpacity = 1;

  $: path = (values: any[], index: number) => {
    return (
      'M' +
      values
        .map((d) => {
          return $xGet(d)[index] + ',' + $yGet(d)[index];
        })
        .join('L')
    );
  };

  $: dimensions = getDimensions<LineChartDimension<any, false>>(
    undefined,
    $custom
  ).map((dim, index: number) => {
    return {
      name: dim.name(null, 0),
      path: (d: any) => path(d, index),
      color: dim.color,
      width: dim.width ?? (() => '3px'),
      opacity: dim.opacity ?? (() => 1),
      highlightWidth: dim.highlightWidth ?? (() => highlightWidth),
      highlightOpacity: dim.highlightOpacity ?? (() => highlightOpacity),
    };
  });

  function raiseIt(node: SVGPathElement, h: boolean) {
    if (h) {
      tick().then(() => raise(node));
    }

    return {
      update(h: boolean) {
        if (h) {
          raise(node);
        }
      },
    };
  }
</script>

<style>
  .path-line {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
</style>

<g class="line-group">
  {#each dimensions as dim (dim.name)}
    <path
      use:raiseIt={highlighted === dim.name}
      class="path-line"
      d={dim.path($data)}
      stroke={dim.color($data)}
      stroke-linejoin="round"
      stroke-width={highlighted === dim.name ? dim.highlightWidth($data) : dim.width($data)}
      stroke-opacity={highlighted === dim.name ? dim.highlightOpacity($data) : dim.opacity($data)} />
  {/each}
</g>
