<script lang="typescript">
  import type { Readable, Writable } from 'svelte/store';
  import { derived } from 'svelte/store';
  import { calculatePadding } from '../coords';
  import type {
    BaseChartDimension,
    LegendOptions,
    Padding,
    TitleOptions,
  } from '../dimensions';
  import { defaultDimensionValues } from '../dimensions';
  import type { TweenOptions } from '../interpolate';
  import { makeTweenStore } from '../interpolate';
  import { defaultOrdinalScale } from '../colors';

  export let tween: undefined | boolean | TweenOptions;

  export let standardPadding: Required<Padding>;
  export let paddingProp: Padding | undefined;
  export let title: string | TitleOptions | undefined;
  export let legend: LegendOptions | undefined;
  export let aspectRatio: number | undefined;
  export let data: any[];
  export let dimensions: BaseChartDimension[];
  export let nested: boolean = false;

  interface Domain {
    prop: string[] | number[] | undefined;
    calc: (d: any[]) => string[] | number[];
  }

  export let colorScale = defaultOrdinalScale;
  export let domains: Record<string, Domain> = {};

  interface DomainWithStore extends Domain {
    id: string;
    store: Writable<string[] | number[]>;
  }
  let domainStores: DomainWithStore[];
  let combinedDomains: Readable<Record<string, number[] | string[]>>;
  $: {
    domainStores = Object.entries(domains).map(([id, dom]) => ({
      ...dom,
      id,
      store: makeTweenStore(tween, 1.5) as Writable<string[] | number[]>,
    }));

    // The derived store takes all the tweened domain values and puts them
    // into a single store more suitable for passing into the slot.
    combinedDomains = derived(
      // @ts-ignore
      domainStores.map((d) => d.store),
      (domains: (string[] | number[])[]) => {
        return Object.fromEntries(
          domains.map((d, i) => [domainStores[i].id, d])
        );
      }
    );
  }

  $: if (data) {
    for (let domain of domainStores) {
      domain.store.set(domain.prop || domain.calc(data));
    }
  }

  $: padding = calculatePadding({
    standard: standardPadding,
    prop: paddingProp,
    title,
    legend,
  });

  let tweenData = makeTweenStore(tween);
  $: if (data) {
    tweenData.set(data);
  }

  export let mapData: (d: any[]) => any = (d: any[]) => d;
  $: outputData = mapData($tweenData);

  $: actualDimensions = dimensions.map((dim, index) =>
    defaultDimensionValues(dim, index, colorScale, nested)
  );
</script>

<div
  class="w-full relative"
  class:h-full={!aspectRatio}
  style={aspectRatio ? `padding-bottom:${100 / aspectRatio}%` : undefined}>
  <slot
    position={aspectRatio ? 'absolute' : 'relative'}
    {padding}
    domains={$combinedDomains}
    data={outputData}
    dimensions={actualDimensions}
    custom={{ dimensions: actualDimensions }} />
</div>
