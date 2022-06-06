<div class="mb-3 form-check form-check-inline">
  <input
    type="radio"
    role="switch"
    class="form-check-input"
    id="valueCentered{i}"
    checked={valueCentered}
    on:click={() => (value = -1)}
  />
  <label for="valueCentered{i}" class="form-check-label">Centered</label>
</div>
<div class="mb-3 form-check form-check-inline">
  <input
    type="radio"
    role="switch"
    class="form-check-input"
    id="valuePercent{i}"
    checked={valuePercent}
    on:click={() => (value = '')}
  />
  <label for="valuePercent{i}" class="form-check-label">Percentage</label>
</div>
<div class="mb-3 form-check form-check-inline">
  <input
    type="radio"
    role="switch"
    class="form-check-input"
    id="valuePixel{i}"
    checked={valuePixel}
    on:click={() => (value = 0)}
  />
  <label for="valuePixel{i}" class="form-check-label">Pixels</label>
</div>

{#if valuePercent}
  <div class="mb-3">
    <input
      type="text"
      class="form-control"
      id="x{i}"
      bind:value
      placeholder="15.0%"
      pattern="^\d+(\.\d+)?%$"
      on:change={() =>
        (value =
          (isNaN(parseFloat(`${value}`)) ? '0' : parseFloat(`${value}`)) + '%')}
    />
  </div>
{:else if valuePixel}
  <div class="mb-3">
    <input type="number" class="form-control" id="x{i}" bind:value />
  </div>
{/if}

<script lang="ts" context="module">
  let counter = 0;
</script>

<script lang="ts">
  export let value: number | string = 0;

  $: valueCentered = value === -1;
  $: valuePercent = typeof value === 'string';
  $: valuePixel = typeof value === 'number' && value !== -1;

  let i = counter++;
</script>
