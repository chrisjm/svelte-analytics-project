<script lang="typescript">
  import { getContext } from 'svelte';
  import type { Accessor } from '../data';
  import { getDimensions } from '../dimensions';
  import type {
    BaseChartDimension,
    SingleValuedChartDimension,
    TwoValuedChartDimension,
  } from '../dimensions';
  import { createAccessor, oneNestedDataAccessor } from '../data';
  import tippy, { followCursor } from 'tippy.js';
  import sorter from 'sorters';

  export let data: any = undefined;
  /** True to sort the tooltip rows in descending order of value */
  export let sort = false;
  /** Limit the number of rows shown */
  export let limit: number | undefined = undefined;
  // export let offset = 35;
  export let header: Accessor | undefined = undefined;
  export let nestedAccessors = false;

  export let dimensions: BaseChartDimension[];

  let { custom } = getContext('LayerCake');

  $: inputDimensions = getDimensions(dimensions, $custom);

  $: accessorCreator = nestedAccessors ? oneNestedDataAccessor : createAccessor;
  $: accessors = inputDimensions.map((d: BaseChartDimension) => {
    return {
      label: d.name ? accessorCreator(d.name) : undefined,
      value: accessorCreator(
        (d as SingleValuedChartDimension).formatValue ||
          (d as SingleValuedChartDimension).value ||
          (d as TwoValuedChartDimension).formatY ||
          (d as TwoValuedChartDimension).y
      ),
      rawValue: accessorCreator(
        (d as SingleValuedChartDimension).value ||
          (d as TwoValuedChartDimension).y
      ),
      color: d.color ? accessorCreator(d.color) : undefined,
    };
  });

  $: makeTooltipData = (data: any) => {
    if (!data) {
      return { tooltipData: null, headerText: null };
    }

    let output = accessors
      .map((acc) => {
        return {
          label: acc.label?.(data, 0),
          value: acc.value?.(data, 0),
          sortValue: acc.rawValue?.(data, 0),
          color: acc.color?.(data, 0),
        };
      })
      .filter((o) => o.value !== undefined);

    if (sort) {
      output.sort(sorter({ value: 'sortValue', descending: true }));
    }

    if (limit) {
      output = output.slice(0, limit);
    }

    let headerText = '';
    if (header) {
      let headerFn = accessorCreator(header);
      let text = headerFn(data, 0);
      if (output.length > 1 || text !== output[0]?.label) {
        headerText = text;
      }
    }

    return { tooltipData: output, headerText };
  };

  $: ({ tooltipData, headerText } = makeTooltipData(data));

  function createTippy(node: HTMLElement) {
    let tip = tippy(node.parentElement!, {
      content: node,
      followCursor: true,
      showOnCreate: true,
      animation: false,
      placement: 'auto',
      theme: 'cv-chart-tooltip',
      arrow: false,
      trigger: 'manual',
      plugins: [followCursor],
    });

    return {
      destroy() {
        tip.destroy();
      },
    };
  }
</script>

<style lang="postcss">
  :global(.tippy-box[data-theme='cv-chart-tooltip']) {
    border: 1px solid #ccc;
    background: rgba(255, 255, 255, 0.85);
    padding: 5px;
  }
</style>

{#if tooltipData}
  <div use:createTippy>
    <slot detail={data}>
      <div class="flex flex-col text-sm text-black">
        {#if headerText}
          <div class="font-bold">{headerText}</div>
        {/if}
        {#each tooltipData as { label, value, color }}
          <div class="whitespace-no-wrap">
            {#if color}
              <div
                class="w-4 h-4 inline-block"
                style="background-color:{color}">
                &nbsp;
              </div>
            {/if}
            {#if label}<span class="font-medium">{label}:</span>{/if}
            {value}
          </div>
        {/each}
      </div>
    </slot>
  </div>
{/if}
