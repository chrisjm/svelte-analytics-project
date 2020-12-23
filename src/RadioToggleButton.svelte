<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Props
  export let id;
  export let name;
  export let labelText;
  export let checked = '';

  // Dispatch click as label for, which is input id
  function handleClick(event) {
    dispatch('click', {
      id: event.target.htmlFor,
    });
  }

  // Classes for label based on state
  let class_list = {
    default: 'block py-2 px-4 border font-bold rounded-lg border-transparent',
    checked: 'border-gray-200 bg-white',
  };
</script>

<style>
  /* your styles go here */
</style>

<input type="radio" class="hidden" {name} {id} autocomplete="off" {checked} />
<label
  class="{class_list['default']} {checked ? class_list['checked'] : ''}"
  for={id}
  on:click={handleClick}>{labelText}</label>
