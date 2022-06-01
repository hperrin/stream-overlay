<svelte:head>
  <title>Setup - Stream Overlay</title>
</svelte:head>

<p>Stream Overlay Setup</p>
<p>
  <button class="btn btn-secondary" on:click={() => electronAPI.requestHelp()}>
    Help
  </button>
</p>

<script lang="ts">
  import electronAPI from '$lib/electronAPI';
</script>
