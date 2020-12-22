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

  let selected;

  function handleChange(event) {
    dispatch('updateFilter', {
      id: selected.id,
      text: selected.text,
    });
  }
</script>

<div class="filter-control">
  <form on:change|preventDefault={handleChange}>
    <div class="mt-2 mx-1 p-1 text-indigo-400 border-b border-indigo-100">
      <label for={id}>{labelText}</label>
      <select
        bind:value={selected}
        name={id}
        id={id}
        class="w-full border-0 bg-transparent focus:ring-indigo-300 p-0 font-bold">
        {#each options as option}
          <option value={option}>{option.text}</option>
        {/each}
      </select>
    </div>
  </form>
</div>
