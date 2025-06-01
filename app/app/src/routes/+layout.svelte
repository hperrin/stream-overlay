<svelte:head>
  <link rel="stylesheet" href="{assets}/bootstrap.min.css" />

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
  {@render children?.()}
</div>

<Bootstrap />

<script lang="ts">
  import type { Snippet } from 'svelte';
  import Bootstrap from './_bootstrap.svelte';
  import { assets } from '$app/paths';

  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.setAttribute('data-bs-theme', 'dark');
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        document.body.setAttribute(
          'data-bs-theme',
          event.matches ? 'dark' : 'light',
        );
      });
  }

  let {
    children,
  }: {
    children?: Snippet;
  } = $props();
</script>

<style>
  :global(.nav-tabs .nav-link.active) {
    border-width: 1px !important;
  }

  :global(.btn-purple) {
    border-color: var(--bs-purple) !important;
    background-color: var(--bs-purple) !important;
    color: var(--bs-white) !important;
  }
</style>
