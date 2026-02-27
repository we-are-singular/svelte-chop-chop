<script lang="ts">
  import { Cropper, CropStencil, CircleStencil, ImageEditor } from "$lib";
  import { pluginFilters } from "$lib/plugins/plugin-filters.js";
  import { pluginFinetune } from "$lib/plugins/plugin-finetune.js";
  import { pluginFrame } from "$lib/plugins/plugin-frame.js";
  import { pluginWatermark } from "$lib/plugins/plugin-watermark.js";
  import { pluginResize } from "$lib/plugins/plugin-resize.js";
  import "$lib/themes/default.css";

  import type { CropCoordinates, ExportResult } from "$lib";
  import { toast } from "../toast.svelte.js";

  let coordinates = $state<CropCoordinates | undefined>(undefined);
  let lastError = $state<string | null>(null);

  let aspectRatioOption = $state<string>("free");
  let aspectRatio = $state<number | null>(null);
  let gridOption = $state<string>("rule-of-thirds");
  let grid = $state<"none" | "rule-of-thirds" | "grid" | "golden-ratio">(
    "rule-of-thirds",
  );
  let stencilOption = $state<string>("rect");
  let transitions = $state(true);
  let readOnly = $state(false);
  let minWidth = $state<number | "">("");
  let minHeight = $state<number | "">("");

  $effect(() => {
    aspectRatio =
      aspectRatioOption === "free"
        ? null
        : aspectRatioOption === "1:1"
          ? 1
          : aspectRatioOption === "16:9"
            ? 16 / 9
            : aspectRatioOption === "4:3"
              ? 4 / 3
              : aspectRatioOption === "9:16"
                ? 9 / 16
                : null;
  });

  $effect(() => {
    grid =
      gridOption === "none"
        ? "none"
        : gridOption === "rule-of-thirds"
          ? "rule-of-thirds"
          : gridOption === "grid"
            ? "grid"
            : gridOption === "golden-ratio"
              ? "golden-ratio"
              : "rule-of-thirds";
  });

  const sizeConstraints = $derived(
    minWidth !== "" || minHeight !== ""
      ? {
          minWidth: minWidth !== "" ? Number(minWidth) : undefined,
          minHeight: minHeight !== "" ? Number(minHeight) : undefined,
        }
      : undefined,
  );

  const StencilComponent = $derived(
    stencilOption === "circle" ? CircleStencil : CropStencil,
  );
  let lastExportUrl = $state<string | null>(null);

  const allPlugins = [
    pluginFilters(),
    pluginFinetune(),
    pluginFrame(),
    pluginWatermark(),
    pluginResize(),
  ];

  function handleEditorExport(result: ExportResult) {
    if (result.blob) {
      if (lastExportUrl) URL.revokeObjectURL(lastExportUrl);
      lastExportUrl = URL.createObjectURL(result.blob);
      const kb = (result.blob.size / 1024).toFixed(1);
      toast(`Exported successfully (${kb} KB)`, 'success');
    }
  }
</script>

<!-- Developer playground — Cropper settings + ImageEditor -->
<svelte:head>
  <title>Demo — svelte-chop-chop</title>
</svelte:head>

<main class="demo-page">
  <div class="demo-header">
    <h1>Developer playground</h1>
    <p>
      Test Cropper options and the full ImageEditor with filters, frames, and
      watermarks.
    </p>
    <a href="/" class="back-link">← Back to home</a>
  </div>

  <section class="settings-section">
    <h2>Cropper settings</h2>
    <form class="settings-form" onsubmit={(e) => e.preventDefault()}>
      <fieldset>
        <legend>Aspect Ratio</legend>
        <label>
          <input
            type="radio"
            name="aspect"
            value="free"
            bind:group={aspectRatioOption}
          />
           Free
        </label>
        <label>
          <input
            type="radio"
            name="aspect"
            value="1:1"
            bind:group={aspectRatioOption}
          />
           1:1
        </label>
        <label>
          <input
            type="radio"
            name="aspect"
            value="16:9"
            bind:group={aspectRatioOption}
          />
           16:9
        </label>
        <label>
          <input
            type="radio"
            name="aspect"
            value="4:3"
            bind:group={aspectRatioOption}
          />
           4:3
        </label>
        <label>
          <input
            type="radio"
            name="aspect"
            value="9:16"
            bind:group={aspectRatioOption}
          />
           9:16
        </label>
      </fieldset>
      <fieldset>
        <legend>Grid</legend>
        <label>
          <input
            type="radio"
            name="grid"
            value="none"
            bind:group={gridOption}
          />
           None
        </label>
        <label>
          <input
            type="radio"
            name="grid"
            value="rule-of-thirds"
            bind:group={gridOption}
          />
           Rule of thirds
        </label>
        <label>
          <input
            type="radio"
            name="grid"
            value="grid"
            bind:group={gridOption}
          />
           Grid
        </label>
        <label>
          <input
            type="radio"
            name="grid"
            value="golden-ratio"
            bind:group={gridOption}
          />
           Golden ratio
        </label>
      </fieldset>
      <fieldset>
        <legend>Stencil</legend>
        <label>
          <input
            type="radio"
            name="stencil"
            value="rect"
            bind:group={stencilOption}
          />
           Rectangle
        </label>
        <label>
          <input
            type="radio"
            name="stencil"
            value="circle"
            bind:group={stencilOption}
          />
           Circle
        </label>
      </fieldset>
      <fieldset>
        <legend>Size Constraints</legend>
        <label>
          Min width: <input
            type="number"
            bind:value={minWidth}
            min="0"
            placeholder="none"
          />
        </label>
        <label>
          Min height: <input
            type="number"
            bind:value={minHeight}
            min="0"
            placeholder="none"
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Options</legend>
        <label>
          <input type="checkbox" bind:checked={transitions} />
           Transitions
        </label>
        <label>
          <input type="checkbox" bind:checked={readOnly} />
           Read only
        </label>
      </fieldset>
    </form>
  </section>

  <section class="demo-section">
    <h2>Cropper</h2>
    <p class="hint">
      Drag the crop area to move. Drag handles to resize.
      {#if aspectRatioOption === "free"}
        Free aspect = 8 handles (corners + edges).
      {:else}
        Fixed aspect = 4 corner handles.
      {/if}
    </p>
    <div class="cropper-wrap">
      <Cropper
        src="https://picsum.photos/800/600"
        {aspectRatio}
        {sizeConstraints}
        {grid}
        {transitions}
        {readOnly}
        stencil={StencilComponent}
        style="height: 380px; width: 100%; max-width: 800px;"
        bind:coordinates
        onchange={(c) => {
          coordinates = c;
        }}
        onerror={(err) => {
          lastError = err.message;
        }}
      />
    </div>
  </section>

  {#if lastError}
    <p class="error">Error: {lastError}</p>
  {/if}

  {#if coordinates}
    <section class="output-section">
      <h2>Output (normalized 0–1)</h2>
      <pre class="coords">{JSON.stringify(
          coordinates.normalized,
          null,
          2,
        )}</pre>
    </section>
  {/if}

  <section class="demo-section editor-section">
    <h2>ImageEditor</h2>
    <p class="hint">
      Full editor with Filters, Finetune, Frame, Watermark, Resize. Try them
      all.
    </p>
    <div class="editor-wrap">
      <ImageEditor
        src="https://picsum.photos/900/600"
        plugins={allPlugins}
        style="height: 480px; width: 100%;"
        onexport={handleEditorExport}
      />
    </div>
    {#if lastExportUrl}
      <div class="export-preview">
        <h3>Last export</h3>
        <img src={lastExportUrl} alt="Exported result" class="export-img" />
        <a href={lastExportUrl} download="export.jpg" class="download-btn">
          Download
        </a>
      </div>
    {/if}
  </section>
</main>

<style>
  .demo-page {
    padding: 2rem 1.5rem;
    max-width: 960px;
    margin: 0 auto;
  }

  .demo-header {
    margin-bottom: 2.5rem;
  }

  .demo-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.5rem;
  }

  .demo-header p {
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 1rem;
  }

  .back-link {
    font-size: 0.9rem;
    color: #4a9eff;
  }

  .settings-section {
    margin-bottom: 2rem;
  }

  .settings-section h2,
  .demo-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #fff;
    margin: 0 0 0.75rem;
  }

  .settings-form {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  fieldset {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 1rem;
  }

  legend {
    font-weight: 600;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    padding: 0 0.5rem;
  }

  label {
    display: block;
    margin: 0.4rem 0;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .demo-section {
    margin: 2.5rem 0;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .hint {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 1rem;
  }

  .cropper-wrap,
  .editor-wrap {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  .error {
    color: #ef4444;
    margin-top: 1rem;
  }

  .output-section {
    margin-top: 2rem;
  }

  .coords {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    overflow-x: auto;
    color: #c9d1d9;
  }

  .editor-section {
    border-top-width: 2px;
  }

  .export-preview {
    margin-top: 1rem;
  }

  .export-preview h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 0.5rem;
  }

  .export-img {
    display: block;
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.5rem;
  }

  .download-btn {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: #4a9eff;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .download-btn:hover {
    opacity: 0.9;
  }
</style>
