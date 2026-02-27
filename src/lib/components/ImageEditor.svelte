<!--
  svelte-chop-chop — Full-featured image editor
  Minimal floating-toolbar layout: canvas fills the editor, controls float above.
-->
<script lang="ts">
  import type {
    AspectRatio,
    AspectRatioPreset,
    ImageSource,
    Point,
  } from "../core/types.js";
  import { createImageEditor } from "../composables/create-image-editor.svelte.js";
  import FilterStrip from "./FilterStrip.svelte";
  import CropStencil from "./CropStencil.svelte";
  import CircleStencil from "./CircleStencil.svelte";
  import CropOverlay from "./CropOverlay.svelte";

  let {
    src,
    plugins = [],
    shape = $bindable("rect"),
    aspectRatio = $bindable(null),
    aspectRatioPresets,
    initialCropScale = 0.8,
    exportDefaults,
    onexport,
    style = "",
    class: className = "",
    ...rest
  }: {
    src?: ImageSource;
    plugins?: import("../core/types.js").ChopPlugin[];
    shape?: "rect" | "circle";
    aspectRatio?: AspectRatio;
    /** Initial crop as fraction of image (0–1). 0.8 = 80% centered. Default 0.8. */
    initialCropScale?: number;
    aspectRatioPresets?: AspectRatioPreset[];
    exportDefaults?: import("../core/types.js").ExportOptions;
    onexport?: (
      result: import("../core/types.js").ExportResult,
    ) => void | Promise<void>;
    style?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();

  const defaultAspectPresets: AspectRatioPreset[] = [
    { label: "Free", value: null },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "16:9", value: 16 / 9 },
    { label: "9:16", value: 9 / 16 },
  ];

  const arPresets = $derived(aspectRatioPresets ?? defaultAspectPresets);

  const editor = createImageEditor({
    get src() {
      return src;
    },
    get plugins() {
      return plugins;
    },
    get aspectRatio() {
      return aspectRatio;
    },
    get initialCropScale() {
      return initialCropScale;
    },
    get exportDefaults() {
      return exportDefaults;
    },
  });

  let viewportEl = $state<HTMLElement | undefined>();
  let canvasEl = $state<HTMLCanvasElement | undefined>();
  let stencilActive = $state(false);

  $effect(() => {
    const el = viewportEl;
    if (el) editor.bindContainer(el);
  });
  $effect(() => {
    const el = canvasEl;
    if (el) editor.bindCanvas(el);
  });
  $effect(() => {
    return () => editor.destroy();
  });
  $effect(() => {
    editor.setAspectRatio(aspectRatio ?? null);
  });

  async function handleExport() {
    const result = await editor.export({ ...exportDefaults, shape });
    await onexport?.(result);
  }

  function setShape(s: "rect" | "circle") {
    shape = s;
    if (s === "circle") aspectRatio = 1;
  }

  /** Plugin tab action buttons */
  const tabActions = $derived(editor.actions.filter((a) => a.group === "tabs"));

  /** CSS transform for rotation + flip only (keeps handles crisp). */
  const viewportCSSTransform = $derived(
    (() => {
      const { rotation, flipX, flipY } = editor.transforms;
      const sx = flipX ? -1 : 1;
      const sy = flipY ? -1 : 1;
      return rotation !== 0 || flipX || flipY
        ? `rotate(${rotation}deg) scale(${sx}, ${sy})`
        : "none";
    })(),
  );

  function invertDelta(delta: Point): Point {
    const { rotation, flipX, flipY } = editor.transforms;
    let x = delta.x * (flipX ? -1 : 1);
    let y = delta.y * (flipY ? -1 : 1);
    if (rotation % 360 !== 0) {
      const rad = -(rotation * Math.PI) / 180;
      return {
        x: x * Math.cos(rad) - y * Math.sin(rad),
        y: x * Math.sin(rad) + y * Math.cos(rad),
      };
    }
    return { x, y };
  }

  // ── Live overlay scaling ──────────────────────────────────

  const framePreviewWidth = $derived(
    editor.image && editor.imageRect.width > 0
      ? Math.max(
          1,
          Math.round(
            editor.frameSettings.width *
              (editor.imageRect.width / editor.image.naturalWidth),
          ),
        )
      : 0,
  );

  const wmFontSizePreview = $derived(
    editor.image && editor.imageRect.width > 0
      ? Math.max(
          8,
          Math.round(
            editor.watermarkSettings.fontSize *
              (editor.imageRect.width / editor.image.naturalWidth),
          ),
        )
      : editor.watermarkSettings.fontSize,
  );

  // ── Panel static data ─────────────────────────────────────

  const finetuneControls = [
    {
      key: "brightness" as const,
      label: "Brightness",
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "contrast" as const,
      label: "Contrast",
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "saturation" as const,
      label: "Saturation",
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "exposure" as const,
      label: "Exposure",
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "temperature" as const,
      label: "Temperature",
      min: -100,
      max: 100,
      step: 1,
    },
    { key: "clarity" as const, label: "Clarity", min: 0, max: 100, step: 1 },
    { key: "gamma" as const, label: "Gamma", min: 0.1, max: 5, step: 0.05 },
  ];

  const frameTypes = ["none", "solid", "line", "hook"] as const;
  const watermarkPositions = [
    "top-left",
    "top-center",
    "top-right",
    "center",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ] as const;

  /** Label shown in the aspect-ratio picker button */
  const arLabel = $derived(
    arPresets.find((p) => p.value === aspectRatio)?.label ?? "Free",
  );
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
  />
</svelte:head>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="chop-editor {className}"
  {style}
  role="application"
  aria-label="Image editor"
  tabindex="0"
  onkeydown={editor.handleKeyboard}
  {...rest}
>
  {#if editor.loading}
    <div class="chop-state-msg">Loading…</div>
  {:else if editor.error}
    <div class="chop-state-msg chop-state-error">{editor.error.message}</div>
  {:else if !editor.image}
    <div class="chop-state-msg">No image loaded</div>
  {:else}
    <!-- ── Stage: image viewport only ───────────────────────── -->
    <div class="chop-stage">
      <!-- ── Full-area canvas viewport ──────────────────────── -->
      <div class="chop-viewport" bind:this={viewportEl}>
        <div
          class="chop-transform-layer"
          style:transform={viewportCSSTransform}
          style:transform-origin="center center"
        >
          <canvas
            bind:this={canvasEl}
            class="chop-canvas"
            aria-label="Image preview"
          ></canvas>

          {#if editor.imageRect.width > 0}
            {#if shape === "circle"}
              <CropOverlay
                rect={editor.crop.viewport}
                imageBounds={editor.imageRect}
              />
              <CircleStencil
                rect={editor.crop.viewport}
                aspectRatio={1}
                active={stencilActive}
                imageBounds={editor.imageRect}
                grid="none"
                transitions={false}
                onmove={(delta) => editor.moveBy(invertDelta(delta))}
                onresize={(handle, delta) =>
                  editor.resizeBy(handle, invertDelta(delta))}
                onresizestart={() => {
                  stencilActive = true;
                  editor.setInteracting(true);
                }}
                onresizeend={() => {
                  stencilActive = false;
                  editor.setInteracting(false);
                }}
              />
            {:else}
              <CropOverlay
                rect={editor.crop.viewport}
                imageBounds={editor.imageRect}
              />
              <CropStencil
                rect={editor.crop.viewport}
                aspectRatio={aspectRatio ?? null}
                active={stencilActive}
                imageBounds={editor.imageRect}
                grid="rule-of-thirds"
                transitions={false}
                onmove={(delta) => editor.moveBy(invertDelta(delta))}
                onresize={(handle, delta) =>
                  editor.resizeBy(handle, invertDelta(delta))}
                onresizestart={() => {
                  stencilActive = true;
                  editor.setInteracting(true);
                }}
                onresizeend={() => {
                  stencilActive = false;
                  editor.setInteracting(false);
                }}
              />
            {/if}
          {/if}
        </div>

        <!-- Live frame preview (viewport-space, outside transform layer) -->
        {#if editor.imageRect.width > 0 && editor.frameSettings.type !== "none" && framePreviewWidth > 0}
          {#if editor.frameSettings.type === "hook"}
            {@const bw = framePreviewWidth}
            {@const len = Math.max(12, bw * 5)}
            {@const c = editor.frameSettings.color}
            <div
              class="chop-frame-hook"
              style:left="{editor.imageRect.x}px"
              style:top="{editor.imageRect.y}px"
              style:width="{editor.imageRect.width}px"
              style:height="{editor.imageRect.height}px"
              aria-hidden="true"
            >
              <div
                class="chop-hook-corner"
                style="top:0;left:0;width:{len}px;height:{len}px;border-top:{bw}px solid {c};border-left:{bw}px solid {c}"
              ></div>
              <div
                class="chop-hook-corner"
                style="top:0;right:0;width:{len}px;height:{len}px;border-top:{bw}px solid {c};border-right:{bw}px solid {c}"
              ></div>
              <div
                class="chop-hook-corner"
                style="bottom:0;left:0;width:{len}px;height:{len}px;border-bottom:{bw}px solid {c};border-left:{bw}px solid {c}"
              ></div>
              <div
                class="chop-hook-corner"
                style="bottom:0;right:0;width:{len}px;height:{len}px;border-bottom:{bw}px solid {c};border-right:{bw}px solid {c}"
              ></div>
            </div>
          {:else}
            <div
              class="chop-frame-box"
              style:left="{editor.imageRect.x}px"
              style:top="{editor.imageRect.y}px"
              style:width="{editor.imageRect.width}px"
              style:height="{editor.imageRect.height}px"
              style:box-shadow="inset 0 0 0 {framePreviewWidth}px {editor
                .frameSettings.color}"
              aria-hidden="true"
            ></div>
          {/if}
        {/if}

        <!-- Live watermark preview (viewport-space, outside transform layer) -->
        {#if editor.imageRect.width > 0 && editor.watermarkSettings.text.trim()}
          {@const pos = editor.watermarkSettings.position}
          <div
            class="chop-wm-preview"
            class:chop-wm-tl={pos === "top-left"}
            class:chop-wm-tc={pos === "top-center"}
            class:chop-wm-tr={pos === "top-right"}
            class:chop-wm-c={pos === "center"}
            class:chop-wm-bl={pos === "bottom-left"}
            class:chop-wm-bc={pos === "bottom-center"}
            class:chop-wm-br={pos === "bottom-right"}
            style:left="{editor.imageRect.x}px"
            style:top="{editor.imageRect.y}px"
            style:width="{editor.imageRect.width}px"
            style:height="{editor.imageRect.height}px"
            style:opacity={editor.watermarkSettings.opacity}
            aria-hidden="true"
          >
            <span
              class="chop-wm-text"
              style:color={editor.watermarkSettings.color}
              style:font-size="{wmFontSizePreview}px"
            >
              {editor.watermarkSettings.text}
            </span>
          </div>
        {/if}
      </div>
      <!-- /chop-viewport -->

      <!-- ── Floating: history pill (top-left) ──────────────── -->
      <div class="chop-hist-pill" role="toolbar" aria-label="History">
        <button
          type="button"
          class="chop-pill-btn"
          disabled={!editor.canUndo}
          onclick={() => editor.undo()}
          aria-label="Undo"
          title="Undo"
        >
          <span class="material-symbols-rounded" aria-hidden="true">undo</span>
        </button>
        <button
          type="button"
          class="chop-pill-btn"
          disabled={!editor.canRedo}
          onclick={() => editor.redo()}
          aria-label="Redo"
          title="Redo"
        >
          <span class="material-symbols-rounded" aria-hidden="true">redo</span>
        </button>
      </div>

      <!-- ── Floating: Done button (top-right) ──────────────── -->
      <button
        type="button"
        class="chop-done-btn"
        onclick={handleExport}
        aria-label="Export image"
      >
        Done
      </button>
    </div>
    <!-- /chop-stage -->

    <!-- ── Plugin panel area (outside image, below stage) ─── -->
    {#if editor.activeTab}
      <div class="chop-panel-area" role="region" aria-label="Settings">
        {#if editor.activeTab === "filters"}
          <div class="chop-panel chop-panel--strip">
            <FilterStrip
              filters={editor.filterPresets.length ? editor.filterPresets : []}
              selected={editor.filters.preset}
              onselect={(name) => editor.applyFilter(name)}
            />
          </div>
        {:else if editor.activeTab === "finetune"}
          <div class="chop-panel chop-panel--form">
            {#each finetuneControls as ctrl (ctrl.key)}
              <label class="chop-slider-row">
                <span class="chop-slider-label">{ctrl.label}</span>
                <div class="chop-slider-track-wrap">
                  <input
                    type="range"
                    class="chop-slider"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={editor.filters[ctrl.key]}
                    style:--pct="{((Number(editor.filters[ctrl.key]) -
                      ctrl.min) /
                      (ctrl.max - ctrl.min)) *
                      100}%"
                    oninput={(e) =>
                      editor.setFinetune(
                        ctrl.key,
                        Number((e.target as HTMLInputElement).value),
                      )}
                  />
                </div>
                <span class="chop-slider-value">
                  {ctrl.key === "gamma"
                    ? Number(editor.filters[ctrl.key]).toFixed(2)
                    : editor.filters[ctrl.key]}
                </span>
              </label>
            {/each}
            <div class="chop-panel-footer">
              <button
                type="button"
                class="chop-btn-reset"
                onclick={() => editor.resetFilters()}
              >
                <span class="material-symbols-rounded" aria-hidden="true">
                  restart_alt
                </span>
                Reset
              </button>
            </div>
          </div>
        {:else if editor.activeTab === "frame"}
          <div class="chop-panel chop-panel--form">
            <div class="chop-ctrl-row">
              <span class="chop-ctrl-label">Style</span>
              <div class="chop-toggle-group">
                {#each frameTypes as ft}
                  <button
                    type="button"
                    class="chop-toggle-btn"
                    class:chop-toggle-btn--active={editor.frameSettings.type ===
                      ft}
                    onclick={() => editor.setFrame({ type: ft })}
                    aria-pressed={editor.frameSettings.type === ft}
                  >
                    {ft.charAt(0).toUpperCase() + ft.slice(1)}
                  </button>
                {/each}
              </div>
            </div>
            {#if editor.frameSettings.type !== "none"}
              <label class="chop-slider-row">
                <span class="chop-slider-label">Width</span>
                <div class="chop-slider-track-wrap">
                  <input
                    type="range"
                    class="chop-slider"
                    min="1"
                    max="80"
                    step="1"
                    value={editor.frameSettings.width}
                    style:--pct="{((editor.frameSettings.width - 1) / 79) *
                      100}%"
                    oninput={(e) =>
                      editor.setFrame({
                        width: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                </div>
                <span class="chop-slider-value">
                  {editor.frameSettings.width}px
                </span>
              </label>
              <div class="chop-ctrl-row">
                <span class="chop-ctrl-label">Color</span>
                <label class="chop-color-wrap">
                  <span
                    class="chop-color-swatch"
                    style:background={editor.frameSettings.color}
                  ></span>
                  <span class="chop-color-hex">
                    {editor.frameSettings.color}
                  </span>
                  <input
                    type="color"
                    class="chop-color-input"
                    value={editor.frameSettings.color}
                    oninput={(e) =>
                      editor.setFrame({
                        color: (e.target as HTMLInputElement).value,
                      })}
                    aria-label="Frame color"
                  />
                </label>
              </div>
            {/if}
          </div>
        {:else if editor.activeTab === "watermark"}
          <div class="chop-panel chop-panel--form">
            <label class="chop-ctrl-row">
              <span class="chop-ctrl-label">Text</span>
              <input
                type="text"
                class="chop-text-input"
                placeholder="Your watermark…"
                value={editor.watermarkSettings.text}
                oninput={(e) =>
                  editor.setWatermark({
                    text: (e.target as HTMLInputElement).value,
                  })}
                aria-label="Watermark text"
              />
            </label>
            <div class="chop-ctrl-row">
              <span class="chop-ctrl-label">Position</span>
              <div
                class="chop-wm-grid"
                role="group"
                aria-label="Watermark position"
              >
                {#each watermarkPositions as pos}
                  <button
                    type="button"
                    class="chop-wm-pos-btn"
                    class:chop-wm-pos-btn--active={editor.watermarkSettings
                      .position === pos}
                    onclick={() => editor.setWatermark({ position: pos })}
                    aria-label={pos.replace(/-/g, " ")}
                    aria-pressed={editor.watermarkSettings.position === pos}
                  >
                    <span class="chop-wm-pos-dot"></span>
                  </button>
                {/each}
              </div>
            </div>
            <label class="chop-slider-row">
              <span class="chop-slider-label">Opacity</span>
              <div class="chop-slider-track-wrap">
                <input
                  type="range"
                  class="chop-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={editor.watermarkSettings.opacity}
                  style:--pct="{editor.watermarkSettings.opacity * 100}%"
                  oninput={(e) =>
                    editor.setWatermark({
                      opacity: Number((e.target as HTMLInputElement).value),
                    })}
                />
              </div>
              <span class="chop-slider-value">
                {Math.round(editor.watermarkSettings.opacity * 100)}%
              </span>
            </label>
            <label class="chop-slider-row">
              <span class="chop-slider-label">Size</span>
              <div class="chop-slider-track-wrap">
                <input
                  type="range"
                  class="chop-slider"
                  min="8"
                  max="96"
                  step="1"
                  value={editor.watermarkSettings.fontSize}
                  style:--pct="{((editor.watermarkSettings.fontSize - 8) / 88) *
                    100}%"
                  oninput={(e) =>
                    editor.setWatermark({
                      fontSize: Number((e.target as HTMLInputElement).value),
                    })}
                />
              </div>
              <span class="chop-slider-value">
                {editor.watermarkSettings.fontSize}px
              </span>
            </label>
            <div class="chop-ctrl-row">
              <span class="chop-ctrl-label">Color</span>
              <label class="chop-color-wrap">
                <span
                  class="chop-color-swatch"
                  style:background={editor.watermarkSettings.color}
                ></span>
                <span class="chop-color-hex">
                  {editor.watermarkSettings.color}
                </span>
                <input
                  type="color"
                  class="chop-color-input"
                  value={editor.watermarkSettings.color}
                  oninput={(e) =>
                    editor.setWatermark({
                      color: (e.target as HTMLInputElement).value,
                    })}
                  aria-label="Watermark color"
                />
              </label>
            </div>
          </div>
        {/if}
      </div>
      <!-- /chop-panel-area -->
    {/if}

    <!-- ── Bottom toolbar row ────────────────────────────── -->
    <div class="chop-bottombar">
      <!-- Rotate: bare icon buttons, left side -->
      <div class="chop-rotate-grp" role="group" aria-label="Rotate">
        <button
          type="button"
          class="chop-bare-btn"
          onclick={() => editor.rotate(-90)}
          aria-label="Rotate left 90°"
          title="Rotate left"
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            rotate_left
          </span>
        </button>
        <button
          type="button"
          class="chop-bare-btn"
          onclick={() => editor.rotate(90)}
          aria-label="Rotate right 90°"
          title="Rotate right"
        >
          <span class="material-symbols-rounded" aria-hidden="true">
            rotate_right
          </span>
        </button>
      </div>

      <!-- Tool tabs pill — centered -->
      <div class="chop-tool-pill" role="toolbar" aria-label="Tools">
        <button
          type="button"
          class="chop-pill-tab"
          class:chop-pill-tab--active={!editor.activeTab}
          onclick={() => editor.setActiveTab(null)}
          aria-label="Crop"
          title="Crop"
          aria-pressed={!editor.activeTab}
        >
          <span class="material-symbols-rounded" aria-hidden="true">crop</span>
        </button>
        {#each tabActions as action (action.id)}
          {@const panelName = action.id.replace("-tab", "")}
          {@const isActive = editor.activeTab === panelName}
          <button
            type="button"
            class="chop-pill-tab"
            class:chop-pill-tab--active={isActive}
            onclick={() => action.execute()}
            aria-label={action.label}
            aria-pressed={isActive}
            title={action.label}
          >
            {#if action.id === "finetune-tab"}
              <span class="material-symbols-rounded" aria-hidden="true">
                tune
              </span>
            {:else if action.id === "filters-tab"}
              <span class="material-symbols-rounded" aria-hidden="true">
                photo_filter
              </span>
            {:else if action.id === "frame-tab"}
              <span class="material-symbols-rounded" aria-hidden="true">
                border_all
              </span>
            {:else if action.id === "watermark-tab"}
              <span class="material-symbols-rounded" aria-hidden="true">
                text_fields
              </span>
            {:else}
              <span class="material-symbols-rounded" aria-hidden="true">
                star
              </span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Right controls: shape + AR -->
      <div class="chop-right-controls">
        <div class="chop-shape-pill" role="group" aria-label="Crop shape">
          <button
            type="button"
            class="chop-pill-tab"
            class:chop-pill-tab--active={shape === "rect"}
            onclick={() => setShape("rect")}
            aria-label="Rectangle crop"
            title="Rectangle"
            aria-pressed={shape === "rect"}
          >
            <span class="material-symbols-rounded" aria-hidden="true">
              crop_square
            </span>
          </button>
          <button
            type="button"
            class="chop-pill-tab"
            class:chop-pill-tab--active={shape === "circle"}
            onclick={() => setShape("circle")}
            aria-label="Circle crop"
            title="Circle"
            aria-pressed={shape === "circle"}
          >
            <span class="material-symbols-rounded" aria-hidden="true">
              circle
            </span>
          </button>
        </div>

        <div class="chop-ar-pill" title="Aspect ratio">
          <span
            class="material-symbols-rounded chop-ar-icon"
            aria-hidden="true"
          >
            aspect_ratio
          </span>
          <span class="chop-ar-label" aria-hidden="true">{arLabel}</span>
          <span
            class="material-symbols-rounded chop-ar-caret"
            aria-hidden="true"
          >
            expand_more
          </span>
          <select
            class="chop-ar-select"
            disabled={shape === "circle"}
            aria-label="Aspect ratio"
            value={aspectRatio}
            onchange={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              aspectRatio = v === "null" ? null : Number(v);
            }}
          >
            {#each arPresets as p (p.label)}
              <option value={p.value ?? "null"}>{p.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    <!-- /chop-bottombar -->
  {/if}
</div>

<style>
  /* ── Material Symbols config ─────────────────────────── */
  .material-symbols-rounded {
    font-family: "Material Symbols Rounded", sans-serif;
    font-variation-settings:
      "FILL" 0,
      "wght" 300,
      "GRAD" 0,
      "opsz" 24;
    font-size: 20px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: "liga";
    user-select: none;
  }

  /* ── Shell ─────────────────────────────────────────────── */
  .chop-editor {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--chop-bg, #0e0e0e);
    border-radius: var(--chop-border-radius, 0);
    overflow: hidden;
    outline: none;
    user-select: none;
    color: var(--chop-color, #e0e0e0);
    font-size: 0.82rem;
  }

  /* ── Stage: fills remaining vertical space ───────────── */
  .chop-stage {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* ── Full-area viewport (fills the stage) ────────────── */
  .chop-viewport {
    position: absolute;
    inset: 0;
    background: var(--chop-canvas-bg, #111);
  }

  .chop-transform-layer {
    position: absolute;
    inset: 0;
    will-change: transform;
  }

  .chop-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* ── Live frame overlay ──────────────────────────────── */
  .chop-frame-box,
  .chop-frame-hook {
    position: absolute;
    pointer-events: none;
    z-index: 8;
    box-sizing: border-box;
  }

  .chop-hook-corner {
    position: absolute;
    box-sizing: border-box;
  }

  /* ── Live watermark overlay ──────────────────────────── */
  .chop-wm-preview {
    position: absolute;
    pointer-events: none;
    z-index: 9;
    overflow: hidden;
    box-sizing: border-box;
  }

  .chop-wm-text {
    position: absolute;
    font-weight: 700;
    font-family: sans-serif;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.65);
    white-space: nowrap;
    line-height: 1.2;
  }

  .chop-wm-tl :global(.chop-wm-text) {
    top: 5%;
    left: 5%;
  }
  .chop-wm-tc :global(.chop-wm-text) {
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
  }
  .chop-wm-tr :global(.chop-wm-text) {
    top: 5%;
    right: 5%;
  }
  .chop-wm-c :global(.chop-wm-text) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .chop-wm-bl :global(.chop-wm-text) {
    bottom: 5%;
    left: 5%;
  }
  .chop-wm-bc :global(.chop-wm-text) {
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
  }
  .chop-wm-br :global(.chop-wm-text) {
    bottom: 5%;
    right: 5%;
  }

  /* ── History pill — floats inside stage (top-left) ───── */
  .chop-hist-pill {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 20;
    display: flex;
    align-items: center;
    padding: 4px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 30px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .chop-pill-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 30px;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s;
  }

  .chop-pill-btn .material-symbols-rounded {
    font-size: 18px;
  }

  .chop-pill-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  .chop-pill-btn:disabled {
    opacity: 0.28;
    cursor: not-allowed;
  }

  /* ── Done button — floats inside stage (top-right) ───── */
  .chop-done-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0.4rem 1.1rem;
    border: 1px solid rgba(255, 185, 0, 0.35);
    border-radius: 30px;
    background: rgba(240, 180, 41, 0.18);
    color: #f0b429;
    font-weight: 600;
    font-size: 0.82rem;
    cursor: pointer;
    letter-spacing: 0.02em;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition:
      background 0.14s,
      color 0.14s,
      border-color 0.14s;
  }

  .chop-done-btn:hover {
    background: #f0b429;
    color: #000;
    border-color: transparent;
  }

  /* ── Plugin panel area (outside stage, between stage & bar) */
  .chop-panel-area {
    flex-shrink: 0;
    background: rgba(14, 14, 16, 0.96);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  /* Base panel — strip layout (filters) */
  .chop-panel {
    width: 100%;
  }

  .chop-panel--form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 2rem;
    padding: 1rem 1.5rem;
    align-items: start;
  }

  /* Form rows */
  .chop-ctrl-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 38px;
  }

  .chop-ctrl-label {
    width: 72px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
  }

  .chop-slider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 38px;
  }

  .chop-slider-label {
    width: 72px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
  }

  /* Custom slider track wrapper */
  .chop-slider-track-wrap {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .chop-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    border-radius: 99px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.7) 0%,
      rgba(255, 255, 255, 0.7) var(--pct, 50%),
      rgba(255, 255, 255, 0.12) var(--pct, 50%),
      rgba(255, 255, 255, 0.12) 100%
    );
    transition: background 0s;
  }

  .chop-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: transform 0.1s;
  }

  .chop-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: none;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  .chop-slider:hover::-webkit-slider-thumb {
    transform: scale(1.2);
  }
  .chop-slider:active::-webkit-slider-thumb {
    transform: scale(1.1);
  }

  .chop-slider-value {
    width: 40px;
    text-align: right;
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.55);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  /* Panel footer (reset button row) */
  .chop-panel-footer {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    padding-top: 0.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 0.25rem;
  }

  .chop-btn-reset {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0.3rem 0.8rem 0.3rem 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    background: transparent;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.78rem;
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s,
      border-color 0.12s;
  }

  .chop-btn-reset .material-symbols-rounded {
    font-size: 16px;
  }
  .chop-btn-reset:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.18);
  }

  /* Frame / watermark type toggles */
  .chop-toggle-group {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .chop-toggle-btn {
    padding: 0.22rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.78rem;
    cursor: pointer;
    transition:
      background 0.12s,
      border-color 0.12s,
      color 0.12s;
  }

  .chop-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.85);
  }

  .chop-toggle-btn--active {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.22);
    color: #fff;
  }

  /* Watermark 3×3 position grid */
  .chop-wm-grid {
    display: grid;
    grid-template-columns: repeat(3, 26px);
    grid-template-rows: repeat(3, 22px);
    gap: 2px;
  }

  .chop-wm-pos-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition:
      background 0.1s,
      border-color 0.1s;
  }

  .chop-wm-pos-btn:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .chop-wm-pos-btn--active {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.28);
  }

  .chop-wm-pos-dot {
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.45;
  }

  .chop-wm-pos-btn--active .chop-wm-pos-dot {
    opacity: 1;
  }

  /* Color picker row */
  .chop-color-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    transition:
      background 0.12s,
      border-color 0.12s;
  }

  .chop-color-wrap:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.18);
  }

  .chop-color-swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .chop-color-hex {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.65);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
  }

  .chop-color-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    padding: 0;
  }

  .chop-text-input {
    flex: 1;
    padding: 0.32rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
    font-size: 0.82rem;
    outline: none;
    transition:
      border-color 0.12s,
      background 0.12s;
  }

  .chop-text-input:focus {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.08);
  }

  /* ── Bottom toolbar row ─────────────────────────────── */
  .chop-bottombar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    flex-shrink: 0;
    background: var(--chop-bg, #0e0e0e);
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  /* Rotate group */
  .chop-rotate-grp {
    display: flex;
    align-items: center;
  }

  .chop-bare-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s;
  }

  .chop-bare-btn:hover {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.85);
  }

  .chop-bare-btn .material-symbols-rounded {
    font-size: 22px;
  }

  /* Tool tabs pill */
  .chop-tool-pill {
    display: flex;
    align-items: center;
    padding: 4px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 30px;
    white-space: nowrap;
  }

  /* shared tab button */
  .chop-pill-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 7px 18px;
    border: 1px solid transparent;
    border-radius: 30px;
    background: transparent;
    color: rgba(255, 255, 255, 0.38);
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s,
      border-color 0.12s;
    flex-shrink: 0;
    gap: 5px;
  }

  .chop-pill-tab .material-symbols-rounded {
    font-size: 20px;
  }
  .chop-pill-tab:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
  }

  .chop-pill-tab--active {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  /* Right controls */
  .chop-right-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .chop-shape-pill {
    display: flex;
    align-items: center;
    padding: 4px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 30px;
  }

  /* Aspect ratio pill */
  .chop-ar-pill {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px 7px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 30px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition:
      background 0.12s,
      color 0.12s;
    white-space: nowrap;
  }

  .chop-ar-pill:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #fff;
  }

  .chop-ar-icon {
    font-size: 18px;
    flex-shrink: 0;
    opacity: 0.7;
  }
  .chop-ar-caret {
    font-size: 18px;
    flex-shrink: 0;
    opacity: 0.5;
  }

  .chop-ar-label {
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1;
    min-width: 24px;
    text-align: center;
    letter-spacing: -0.01em;
    pointer-events: none;
  }

  .chop-ar-select {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border: none;
    background: transparent;
    font-size: inherit;
  }

  .chop-ar-select:disabled {
    cursor: not-allowed;
  }

  /* ── State messages ──────────────────────────────────── */
  .chop-state-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 240px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.9rem;
  }

  .chop-state-error {
    color: #f87171;
  }
</style>
