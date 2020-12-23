<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Props
  export let id;
  export let name;
  export let labelText;
  export let checked = '';

  // Dispatch click as <label> `for` attribute
  function handleClick(event) {
    dispatch('click', {
      id: event.target.htmlFor,
    });
  }

  // Classes for label based on state
  let class_list = {
    default:
      'block py-2 px-4 font-bold text-gray-400 border border-transparent bg-transparent',
    checked:
      'block py-2 px-4 font-bold text-black rounded-lg border border-gray-100 bg-white',
  };
</script>

<style>
  /* your styles go here */
</style>

<input type="radio" class="hidden" {name} {id} autocomplete="off" {checked} />
<label
  class={checked ? class_list['checked'] : class_list['default']}
  for={id}
  on:click={handleClick}>{labelText}</label>
