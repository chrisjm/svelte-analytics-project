<script>
  export let title;
  export let value;
  export let lastValue;
  export let unit;
  export let time;

  $: percentChange = ((value - lastValue) / lastValue) * 100;
</script>

<style>
  /* your styles go here */
</style>

<div class="rounded-lg bg-white p-4 w-full md:w-1/5">
  <div>
    <span class="block text-gray-400">{title} ({time})</span>
    <span class="font-bold text-xl">{value}</span>
    <span class="ml-1 text-md text-gray-400">
      {#if percentChange > 0}
        <span class="text-green-600 font-bold">↑</span>
      {:else}
        <span class="text-red-600 font-bold">↓</span>
      {/if}
      {percentChange.toFixed(2)}%
    </span>
    <span class="ml-1 text-sm text-gray-300">({lastValue})</span>
  </div>
</div>
