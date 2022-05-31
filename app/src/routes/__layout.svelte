<svelte:head>
  <style>
    html {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  </style>
</svelte:head>

{#if dark}
  <Darkly />
{:else}
  <Flatly />
{/if}
<slot />

<script lang="ts">
  import { onMount } from 'svelte';
  import Flatly from './_flatly.svelte';
  import Darkly from './_darkly.svelte';

  let dark = false;
  onMount(() => {
    dark = window.matchMedia('(prefers-color-scheme: dark)');
  });
</script>
