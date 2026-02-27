<!--
  svelte-chop-chop — Filter thumbnail preview strip
-->
<script lang="ts">
  import type { FilterMatrix } from '../core/types.js';

  let {
    filters,
    selected,
    onselect,
  }: {
    filters: FilterMatrix[];
    selected: string | null;
    onselect: (name: string) => void;
  } = $props();
</script>

<div class="chop-filter-strip" role="listbox" aria-label="Filter presets">
  {#each filters as filter}
    <button
      type="button"
      class="chop-filter-thumb"
      class:chop-filter-selected={selected === filter.name}
      onclick={() => onselect(filter.name)}
      aria-label={filter.label}
      aria-pressed={selected === filter.name}
    >
      <span class="chop-filter-label">{filter.label}</span>
    </button>
  {/each}
</div>

<style>
  .chop-filter-strip {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    overflow-x: auto;
  }

  .chop-filter-thumb {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    border: 2px solid transparent;
    border-radius: 4px;
    background: var(--chop-toolbar-bg, #2a2a2a);
    color: var(--chop-toolbar-color, #fff);
    cursor: pointer;
  }

  .chop-filter-thumb:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .chop-filter-selected {
    border-color: var(--chop-toolbar-active, #4a9eff);
  }
</style>
