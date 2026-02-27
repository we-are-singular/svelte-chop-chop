<!--
  svelte-chop-chop — Default toolbar
  Rotate, flip, undo, redo, export actions.
-->
<script lang="ts">
  import type { ImageEditorReturn } from '../core/types.js';

  let { editor }: { editor: ImageEditorReturn } = $props();
</script>

<div class="chop-toolbar" role="toolbar" aria-label="Editor toolbar">
  <button
    type="button"
    class="chop-toolbar-btn"
    onclick={() => editor.rotate(-90)}
    aria-label="Rotate left"
  >
    ↶
  </button>
  <button
    type="button"
    class="chop-toolbar-btn"
    onclick={() => editor.rotate(90)}
    aria-label="Rotate right"
  >
    ↷
  </button>
  <button
    type="button"
    class="chop-toolbar-btn"
    onclick={() => editor.flipX()}
    aria-label="Flip horizontal"
  >
    ↔
  </button>
  <button
    type="button"
    class="chop-toolbar-btn"
    onclick={() => editor.flipY()}
    aria-label="Flip vertical"
  >
    ↕
  </button>
  <button
    type="button"
    class="chop-toolbar-btn"
    disabled={!editor.canUndo}
    onclick={() => editor.undo()}
    aria-label="Undo"
  >
    Undo
  </button>
  <button
    type="button"
    class="chop-toolbar-btn"
    disabled={!editor.canRedo}
    onclick={() => editor.redo()}
    aria-label="Redo"
  >
    Redo
  </button>
  <button
    type="button"
    class="chop-toolbar-btn chop-toolbar-btn-primary"
    onclick={() => editor.export()}
    aria-label="Export"
  >
    Export
  </button>
</div>

<style>
  .chop-toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--chop-toolbar-bg, #2a2a2a);
    color: var(--chop-toolbar-color, #fff);
    flex-wrap: wrap;
  }

  .chop-toolbar-btn {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .chop-toolbar-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .chop-toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chop-toolbar-btn-primary {
    background: var(--chop-toolbar-active, #4a9eff);
  }
</style>
