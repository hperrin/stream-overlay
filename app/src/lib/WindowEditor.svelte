<div class="mb-3">
  <label for="title{i}" class="form-label">Title</label>
  <input
    type="text"
    class="form-control"
    id="title{i}"
    bind:value={win.title}
  />
</div>
<div class="mb-3">
  <label for="url{i}" class="form-label">URL</label>
  <div class="input-group">
    {#if showUrl}
      <input
        type="text"
        class="form-control"
        id="url{i}"
        bind:value={win.url}
      />
    {:else}
      <input
        type="password"
        class="form-control"
        id="url{i}"
        bind:value={win.url}
      />
    {/if}
    <button class="input-group-text" on:click={() => (showUrl = !showUrl)}
      >👀</button
    >
  </div>
</div>
<div class="mb-3 form-check form-switch">
  <input
    type="checkbox"
    role="switch"
    class="form-check-input"
    id="fullscreen{i}"
    bind:checked={win.fullscreen}
  />
  <label for="fullscreen{i}" class="form-check-label">Fullscreen</label>
</div>

{#if !win.fullscreen}
  <h5>Position</h5>

  <h6>Horizontal (X)</h6>
  <NumberEditor bind:value={win.x} {i} />

  <h6>Vertical (Y)</h6>
  <NumberEditor bind:value={win.y} {i} />

  <h5>Size</h5>

  <h6>Width</h6>
  <NumberEditor bind:value={win.width} {i} />

  <h6>Height</h6>
  <NumberEditor bind:value={win.height} {i} />
{/if}

<script lang="ts" context="module">
  let counter = 0;
</script>

<script lang="ts">
  import type { Conf } from '$lib/Conf';
  import NumberEditor from '$lib/NumberEditor.svelte';

  export let win: Conf;

  let showUrl = false;
  let i = counter++;
</script>
