<svelte:head>
  <title>Config Editor - Stream Overlay</title>
</svelte:head>

<div class="editor-container">
  <div style="margin: 0 0 1em; display: flex; justify-content: space-between;">
    <div class="buttons">
      <button class="btn btn-secondary" on:click={newConfig}> New </button>
      <button
        class="btn btn-secondary"
        on:click={() => electronAPI.requestConfigFile()}
      >
        Open
      </button>
    </div>
    <button
      class="btn btn-secondary"
      on:click={() => electronAPI.requestHelp()}
    >
      Help
    </button>
  </div>

  <ul
    class="nav nav-tabs"
    style="overflow-x: auto; flex-wrap: nowrap; white-space: nowrap; overflow-y: hidden;"
  >
    {#each configs as entry, i}
      <li class="nav-item">
        <button
          class="nav-link"
          class:active={activeIndex === i}
          aria-current="page"
          title={entry.filename}
          on:mouseup={(event) => handleTabClick(event, i, entry)}
        >
          {entry.basename}
        </button>
      </li>
    {/each}
  </ul>

  <div class="tab-container">
    {#key activeIndex}
      {#if activeConfig}
        <pre style="margin: 1em 0;">{JSON.stringify(
            activeConfig,
            null,
            2
          )}</pre>
      {/if}
    {/key}
  </div>
</div>

<script lang="ts">
  import type { Conf, ConfContainer } from '$lib/Conf';
  import electronAPI from '$lib/electronAPI';

  let configs: ConfContainer[] = [];
  let activeIndex = 0;
  $: activeConfig = configs[activeIndex];

  electronAPI.configFile((event, data) => {
    const idx = configs.findIndex((check) => data.filename === check.filename);

    if (idx > -1) {
      activeIndex = idx;
    } else {
      configs.push(data);
      activeIndex = configs.length - 1;
      configs = configs;
    }
  });

  function newConfig() {
    configs.push({
      filename: '',
      basename: 'New Config File',
      config: [],
    });
    configs = configs;
  }

  function handleTabClick(
    event: MouseEvent,
    index: number,
    config: ConfContainer
  ) {
    if (event.button === 0) {
      activeIndex = index;
    } else if (event.button === 1) {
      configs.splice(index, 1);
      configs = configs;
      if (activeIndex === index) {
        activeIndex = Math.min(index, Math.max(configs.length - 1, 0));
      }
    }
  }
</script>

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .buttons > * {
    margin-inline-end: 1em;
  }
  .buttons > *:last-child {
    margin-inline-end: 0;
  }

  .tab-container {
    flex-basis: 0;
    flex-grow: 1;
    overflow-y: auto;
  }
</style>
