<svelte:head>
  <title>Config Editor - Stream Overlay</title>
</svelte:head>

<div class="editor-container">
  <div class="mb-3" style="display: flex; justify-content: space-between;">
    <div class="buttons">
      <button class="btn btn-secondary" onclick={newConfig}>New</button>
      <button
        class="btn btn-secondary"
        onclick={() => electronAPI.requestConfigFile()}>Open</button
      >
    </div>
    <button class="btn btn-secondary" onclick={() => electronAPI.requestHelp()}
      >Help</button
    >
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
          onclick={(event) => handleTabClick(event, i)}
          >{entry.basename}{#if JSON.stringify(entry.config) !== entry.origConfig}*{/if}<i
            role="button"
            class="close-tab btn-close"
            aria-label="Close"
            onclick={(event) => handleTabCloseClick(event, i)}
            onkeypress={(event) =>
              (event.key === 'Enter' || event.key === 'Space') &&
              handleTabCloseClick(event, i)}
            tabindex={0}
          ></i></button
        >
      </li>
    {/each}
  </ul>

  <div class="tab-container border-end border-bottom border-start">
    {#key activeIndex}
      {#if activeConfig}
        <div style="display: flex; justify-content: space-between;">
          <div class="buttons">
            <button
              class="btn btn-secondary"
              disabled={activeConfig.filename === ''}
              onclick={() =>
                electronAPI.requestSave({
                  config: $state.snapshot(activeConfig.config),
                  filename: activeConfig.filename,
                  uid: activeConfig.uid || '',
                })}>Save</button
            >
            <button
              class="btn btn-secondary"
              onclick={() =>
                electronAPI.requestSaveAs({
                  config: $state.snapshot(activeConfig.config),
                  uid: activeConfig.uid || '',
                })}>Save As</button
            >
          </div>
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
                      config: $state.snapshot(activeConfig.config),
                      mode: 'clickable',
                    })}>Clickable</button
                >
              </li>
              <li>
                <button
                  class="dropdown-item"
                  onclick={() =>
                    electronAPI.requestLaunch({
                      config: $state.snapshot(activeConfig.config),
                      mode: 'normal',
                    })}>Click-Through</button
                >
              </li>
            </ul>
          </div>
        </div>

        <ConfigEditor bind:config={activeConfig.config} />
      {:else}
        <p class="p-3" style="text-align: center;">
          Start by creating a new config file or open an existing one.
        </p>

        <div>
          <Help />
        </div>
      {/if}
    {/key}
  </div>
</div>

<script lang="ts">
  import uniqueId from 'lodash/uniqueId.js';
  import type { ConfContainer } from '$lib/Conf';
  import electronAPI from '$lib/electronAPI';
  import ConfigEditor from '$lib/ConfigEditor.svelte';
  import Help from './help/+page.svelte';

  let configs: ConfContainer[] = $state([]);
  let activeIndex = $state(0);
  let activeConfig = $derived(configs[activeIndex]);

  electronAPI.configFile((_event, data) => {
    const idx = configs.findIndex((check) => data.filename === check.filename);

    if (idx > -1) {
      activeIndex = idx;
    } else {
      data.uid = uniqueId();
      data.origConfig = JSON.stringify(data.config);
      configs.push(data);
      activeIndex = configs.length - 1;
    }
  });

  electronAPI.saved((_event, { filename, basename, uid }) => {
    const idx = configs.findIndex((check) => uid === check.uid);

    if (idx > -1) {
      configs[idx].filename = filename;
      configs[idx].basename = basename;
      configs[idx].origConfig = JSON.stringify(configs[idx].config);
    }
  });

  function newConfig() {
    configs.push({
      uid: uniqueId(),
      filename: '',
      basename: 'New Config File',
      config: [
        {
          title: 'Chat',
          url: 'https://streamlabs.com/widgets/chat-box/v1/YOURSECRETCODE',
          width: 450,
          height: 650,
          x: 50,
          y: -1,
        },
        {
          title: 'Alerts',
          url: 'https://streamlabs.com/alert-box/v3/YOURSECRETCODE',
          width: 600,
          height: 600,
          x: -1,
          y: 20,
        },
      ],
    });
    configs = configs;
  }

  function handleTabClick(event: MouseEvent, index: number) {
    if (event.button === 0) {
      activeIndex = index;
    } else if (event.button === 1) {
      handleTabCloseClick(event, index);
    }
  }

  function handleTabCloseClick(
    event: MouseEvent | KeyboardEvent,
    index: number,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const config = configs[index];
    if (config.origConfig !== JSON.stringify(config.config)) {
      if (
        !confirm(
          'There are unsaved changes that will be lost if you close this file. Are you sure you want to close it and lose these changes?',
        )
      ) {
        return;
      }
    }

    configs.splice(index, 1);
    if (activeIndex === index) {
      activeIndex = Math.min(index, Math.max(configs.length - 1, 0));
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
    padding: 1em;
    border-color: var(--tab-border-color) !important;
  }

  .close-tab {
    display: inline-block;
    vertical-align: text-top;
    width: 0.4em;
    height: 0.4em;
    margin-inline-start: 0.5em;
  }
</style>
