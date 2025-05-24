<div style="display: flex; flex-wrap: wrap; align-items: stretch;">
  {#each config as win, i}
    <div class="card" style="width: 360px; margin: 1em;">
      <div
        class="card-header"
        style="display: flex; justify-content: space-between; align-items: center;"
      >
        <span>{win.title}</span>
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="launchDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Launch
          </button>
          <ul class="dropdown-menu" aria-labelledby="launchDropdown">
            <li>
              <button
                class="dropdown-item"
                onclick={() =>
                  electronAPI.requestLaunch({
                    config: [$state.snapshot(win)],
                    mode: 'clickable',
                  })}>Clickable</button
              >
            </li>
            <li>
              <button
                class="dropdown-item"
                onclick={() =>
                  electronAPI.requestLaunch({
                    config: [$state.snapshot(win)],
                    mode: 'normal',
                  })}>Click-Through</button
              >
            </li>
          </ul>
        </div>
      </div>
      <div
        class="card-body"
        style="display: flex; flex-direction: column; justify-content: space-between;"
      >
        <div class="card-text">
          <WindowEditor bind:win={config[i]} />
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <button
              class="btn btn-secondary"
              title="Move left"
              disabled={i === 0}
              onclick={() => moveLeft(i)}>&lt;</button
            >
            <button
              class="btn btn-secondary"
              title="Move right"
              disabled={i === config.length - 1}
              onclick={() => moveRight(i)}>&gt;</button
            >
          </div>
          <button class="btn btn-danger" onclick={() => removeWindow(i)}
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
  <button class="btn btn-primary" onclick={addWindow}>Add Window</button>
</div>

<script lang="ts">
  import type { Conf } from '$lib/Conf';
  import electronAPI from '$lib/electronAPI';
  import WindowEditor from '$lib/WindowEditor.svelte';

  let {
    config = $bindable(),
  }: {
    config: Conf[];
  } = $props();

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
