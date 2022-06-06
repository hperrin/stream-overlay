<div style="display: flex; flex-wrap: wrap; align-items: stretch;">
  {#each config as win, i}
    <div class="card" style="width: 360px; margin: 1em;">
      <div class="card-header">{win.title}</div>
      <div
        class="card-body"
        style="display: flex; flex-direction: column; justify-content: space-between;"
      >
        <div class="card-text">
          <WindowEditor bind:win />
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <button
              class="btn btn-secondary"
              title="Move left"
              disabled={i === 0}
              on:click={() => moveLeft(i)}>&lt;</button
            >
            <button
              class="btn btn-secondary"
              title="Move right"
              disabled={i === config.length - 1}
              on:click={() => moveRight(i)}>&gt;</button
            >
          </div>
          <button class="btn btn-danger" on:click={() => removeWindow(i)}
            >Remove</button
          >
        </div>
      </div>
    </div>
  {:else}
    <div class="m-3">No windows yet.</div>
  {/each}
</div>
<div>
  <button class="btn btn-primary" on:click={addWindow}>Add Window</button>
</div>

<script lang="ts">
  import type { Conf } from '$lib/Conf';
  import WindowEditor from '$lib/WindowEditor.svelte';

  export let dirty = false;
  export let config: Conf[];

  const oldConfig = JSON.stringify(config);
  $: if (!dirty && oldConfig !== JSON.stringify(config)) {
    dirty = true;
  }

  function addWindow() {
    config.push({
      title: 'Untitled Window',
      url: 'https://example.com/',
      x: -1,
      y: -1,
      width: 500,
      height: 500,
    });
    config = config;
  }

  function removeWindow(i: number) {
    config.splice(i, 1);
    config = config;
  }

  function moveLeft(i: number) {
    const win = config.splice(i, 1)[0];
    config.splice(i - 1, 0, win);
    config = config;
  }

  function moveRight(i: number) {
    const win = config.splice(i, 1)[0];
    config.splice(i + 1, 0, win);
    config = config;
  }
</script>
