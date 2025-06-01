<div class="mb-3">
  <label for="title{i}" class="form-label">Title</label>
  <input
    type="text"
    class="form-control"
    data-bs-theme="light"
    id="title{i}"
    bind:value={win.title}
  />
</div>
<div class="mb-3">
  <label for="url{i}" class="form-label"
    >URL{#if win.url.includes('YOURSECRETCODE')}&nbsp;<span
        tabindex="0"
        style="text-decoration: dotted; cursor: help;"
        title="It looks like you haven't filled in your Widget URL. Head to streamlabs.com (or other widget provider, e.g. Twitch, jChat, etc.) to get the URL for your widget."
        >&#9888;</span
      >{/if}</label
  >
  <div class="input-group">
    {#if showUrl}
      <input
        type="text"
        class="form-control"
        data-bs-theme="light"
        id="url{i}"
        bind:value={win.url}
      />
    {:else}
      <input
        type="password"
        class="form-control"
        data-bs-theme="light"
        id="url{i}"
        bind:value={win.url}
      />
    {/if}
    <button class="input-group-text" onclick={() => (showUrl = !showUrl)}
      >👀</button
    >
  </div>
</div>

<h5>Position</h5>

<h6>Display</h6>
<div class="mb-3">
  <input
    type="number"
    class="form-control"
    data-bs-theme="light"
    id="display{i}"
    min={0}
    max={9}
    step={1}
    bind:value={win.display}
  />
  <small class="form-text text-muted">0 means primary monitor.</small>
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
  <h6>Horizontal (X)</h6>
  <NumberEditor bind:value={win.x} allowCentered />

  <h6>Vertical (Y)</h6>
  <NumberEditor bind:value={win.y} allowCentered />

  <h5>Size</h5>

  <h6>Width</h6>
  <NumberEditor bind:value={win.width} />

  <h6>Height</h6>
  <NumberEditor bind:value={win.height} />
{/if}

<h5>Scale</h5>
<div class="mb-3">
  <input
    type="number"
    class="form-control"
    data-bs-theme="light"
    id="scale{i}"
    min={0.3}
    max={5}
    step={0.1}
    bind:value={win.scale}
  />
</div>

<script lang="ts" module>
  let counter = 0;
</script>

<script lang="ts">
  import type { Conf } from '$lib/Conf';
  import NumberEditor from '$lib/NumberEditor.svelte';

  let {
    win = $bindable(),
  }: {
    win: Conf;
  } = $props();

  let showUrl = $state(false);
  let i = counter++;
</script>
