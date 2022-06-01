<svelte:head>
  <style>
    html,
    body,
    body > div {
      width: 100%;
      height: 100%;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto,
        'Helvetica Neue' 'Noto Sans', 'Liberation Sans', Arial, sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
    }
  </style>
</svelte:head>

{#if dark}
  <Darkly />
{:else}
  <Flatly />
{/if}
<div style="padding: 1em; height: 100%;">
  <slot />
</div>

<Bootstrap />

<script lang="ts">
  import { onMount } from 'svelte';
  import Flatly from './_flatly.svelte';
  import Darkly from './_darkly.svelte';
  import Bootstrap from './_bootstrap.svelte';

  let dark = false;
  onMount(() => {
    dark = window.matchMedia('(prefers-color-scheme: dark)');
  });
</script>
