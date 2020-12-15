<script lang="ts">
  import type { TitleOptions } from '../dimensions';
  import { titleHeight as height, defaultTitlePosition } from '../coords';
  export let options: string | TitleOptions;

  let o: TitleOptions;
  $: o = typeof options === 'string' ? { text: options } : options;

  $: top =
    (o.position ?? defaultTitlePosition) === 'top'
      ? `-${height}px`
      : `calc(100% + ${height}px)`;
</script>

<span
  style="top:{top}"
  class="absolute inset-x-0 text-center {o.className || 'font-medium leading-5 text-gray-700'}">{o.text}</span>
