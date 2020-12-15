<script context="module" lang="typescript">
  export interface QuadtreeItem<T = any> {
    /** The x coordinate of the item on the chart */
    x: number;
    /** The y coordinate of the item on the chart */
    y: number;
    /** The dimension for the matched point on the chart */
    dimension: TwoValuedChartDimension;
    /** The data for this item */
    data: T;
  }
</script>

<script lang="typescript">
  import { getContext, createEventDispatcher } from 'svelte';
  import type { Quadtree } from 'd3-quadtree';
  import { quadtree } from 'd3-quadtree';
  import type { TwoValuedChartDimension } from '../dimensions';

  const { data, xGet, yGet, width, height } = getContext('LayerCake');

  export let useX = true;
  export let useY = true;

  let visible = false;
  export let found: QuadtreeItem | undefined = undefined;
  export let e: MouseEvent | undefined = undefined;

  export let dimensions: TwoValuedChartDimension[];
  export let searchRadius: number | undefined = undefined;

  const dispatch = createEventDispatcher<{
    change: QuadtreeItem | undefined;
  }>();

  let result: QuadtreeItem | undefined;
  function findItem(evt: MouseEvent) {
    e = evt;
    result = finder.find(evt.layerX, evt.layerY, searchRadius);
    visible = Boolean(result);
  }

  let previousFound: QuadtreeItem | undefined = undefined;
  $: found = visible ? result : undefined;
  $: if (found !== previousFound) {
    previousFound = found;
    dispatch('change', found);
  }

  let finder: Quadtree<QuadtreeItem>;
  $: {
    finder = quadtree<QuadtreeItem>()
      .extent([
        [-1, -1],
        [$width + 1, $height + 1],
      ])
      .x((d) => d.x)
      .y((d) => d.y);

    for (let d of $data) {
      let x = $xGet(d);
      let y = $yGet(d);
      for (let i = 0; i < x.length; i++) {
        finder.add({
          x: useX ? x[i] : 0,
          y: useY ? y[i] : 0,
          dimension: dimensions[i],
          data: d,
        });
      }
    }
  }
</script>

<div
  class="absolute inset-0 z-9000"
  on:mousemove={findItem}
  on:mouseout={() => (visible = false)} />
<slot {found} {e} />
