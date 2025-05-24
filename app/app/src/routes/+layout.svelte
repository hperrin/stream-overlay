<svelte:head>
  <link rel="stylesheet" href="{assets}/bootstrap-flatly.min.css" />

  <link
    rel="stylesheet"
    media="(prefers-color-scheme: dark)"
    href="{assets}/bootstrap-darkly.min.css"
  />

  <style>
    html,
    body,
    body > div {
      width: 100%;
      height: 100%;
      font-family:
        system-ui,
        -apple-system,
        'Segoe UI',
        Roboto,
        'Helvetica Neue' 'Noto Sans',
        'Liberation Sans',
        Arial,
        sans-serif,
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji';
    }
  </style>
</svelte:head>

<div style="padding: 1em; height: 100%;">
  <slot />
</div>

<Bootstrap />

<script lang="ts">
  import Bootstrap from './_bootstrap.svelte';
  import { assets } from '$app/paths';
</script>

<style>
  :global(:root) {
    --tab-border-color: #ecf0f1;
  }

  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --tab-border-color: #444;
    }
  }
</style>
