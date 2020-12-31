<script lang="typescript">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let options = [
    { id: 'all', text: `All` },
    { id: '1', text: `Filter 1` },
    { id: '2', text: `Filter 2` },
    { id: '3', text: `Filter 3` },
  ];
  export let id = 'filter';
  export let labelText = 'Filter';

  export let selected;
  export let showAllOption = true;

  function handleChange(event) {
    dispatch('updateFilter', {
      id: selected.id,
      text: selected.text,
    });
  }
</script>

<div class="filter-control md:w-1/4">
  <form on:change|preventDefault={handleChange}>
    <div
      class="mt-2 mx-1 p-1 text-gray-400 border-b border-gray-150 md:mx-0 md:px-0 md:py-4">
      <label for={id}>{labelText}</label>
      <select
        bind:value={selected}
        name={id}
        {id}
        class="w-full border-0 bg-transparent focus:ring-gray-300 p-0 font-bold">
        {#if showAllOption}
          <option value="all">All</option>
        {/if}
        {#each options as option}
          <option value={option} selected={selected === option.id}>
            {option.text}
          </option>
        {/each}
      </select>
    </div>
  </form>
</div>
