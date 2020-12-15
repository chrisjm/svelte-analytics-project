<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet } = getContext('LayerCake');

  export let color = '#ab00d6';
  export let width = undefined;

  $: path = 'M' + $data.map((d) => `${$xGet(d)},${$yGet(d)}`).join('L');
  $: style = width ? `--stroke-width:${width}` : undefined;
</script>

<style>
  .path-line {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: var(--stroke-width, 2);
  }
</style>

<path class="path-line" {style} d={path} stroke={color} />
