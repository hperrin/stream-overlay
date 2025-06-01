{#if allowCentered}
  <div class="mb-3 form-check form-check-inline">
    <input
      type="radio"
      role="switch"
      class="form-check-input"
      id="valueCentered{i}"
      checked={valueCentered}
      onclick={() => (value = -1)}
    />
    <label for="valueCentered{i}" class="form-check-label">Centered</label>
  </div>
{/if}
<div class="mb-3 form-check form-check-inline">
  <input
    type="radio"
    role="switch"
    class="form-check-input"
    id="valuePercent{i}"
    checked={valuePercent}
    onclick={() => (value = '')}
  />
  <label for="valuePercent{i}" class="form-check-label">Percent</label>
</div>
<div class="mb-3 form-check form-check-inline">
  <input
    type="radio"
    role="switch"
    class="form-check-input"
    id="valuePixel{i}"
    checked={valuePixel}
    onclick={() => (value = 0)}
  />
  <label for="valuePixel{i}" class="form-check-label">Pixels</label>
</div>

{#if valuePercent}
  <div class="mb-3">
    <input
      type="text"
      class="form-control"
      data-bs-theme="light"
      id="x{i}"
      bind:value
      placeholder="15.0%"
      pattern="^\d+(\.\d+)?%$"
      onchange={() =>
        (value =
          (isNaN(parseFloat(`${value}`)) ? '0' : parseFloat(`${value}`)) + '%')}
    />
  </div>
{:else if valuePixel}
  <div class="mb-3">
    <input
      type="number"
      class="form-control"
      data-bs-theme="light"
      id="x{i}"
      bind:value
    />
  </div>
{/if}

<script lang="ts" module>
  let counter = 0;
</script>

<script lang="ts">
  let {
    value = $bindable(0),
    allowCentered = false,
  }: {
    value?: number | string;
    allowCentered?: boolean;
  } = $props();

  let valueCentered = $derived(value === -1);
  let valuePercent = $derived(typeof value === 'string');
  let valuePixel = $derived(typeof value === 'number' && value !== -1);

  let i = counter++;
</script>
