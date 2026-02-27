<!--
  svelte-chop-chop — Ready-to-use Cropper component
  Wires createCropper composable to DOM with default stencil.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    AspectRatio,
    CropCoordinates,
    ImageSource,
    Rect,
    StencilProps,
    TransformState,
  } from "../core/types.js";
  import { createCropper } from "../composables/create-cropper.svelte.js";
  import CropStencil from "./CropStencil.svelte";
  import CircleStencil from "./CircleStencil.svelte";
  import CropOverlay from "./CropOverlay.svelte";

  let {
    src,
    aspectRatio = null,
    sizeConstraints,
    cropOutsideImage = false,
    initialCrop,
    grid = "rule-of-thirds",
    gridOnlyActive = true,
    transitions = true,
    stencil: StencilComponent = CropStencil,
    stencilProps: extraStencilProps = {},
    readOnly = false,
    coordinates = $bindable(),
    transforms = $bindable(),
    onchange,
    onready,
    onerror,
    overlay,
    toolbar,
    empty,
    loading: loadingSnippet,
    error: errorSnippet,
    class: className = "",
    style = "",
    ...restProps
  }: {
    src?: ImageSource;
    aspectRatio?: AspectRatio;
    sizeConstraints?: import("../core/types.js").SizeConstraints;
    cropOutsideImage?: boolean;
    initialCrop?: Partial<Rect>;
    grid?: import("../core/types.js").GridType;
    gridOnlyActive?: boolean;
    transitions?: boolean;
    stencil?: import("svelte").Component<any>;
    stencilProps?: Record<string, unknown>;
    readOnly?: boolean;
    coordinates?: CropCoordinates;
    transforms?: TransformState;
    onchange?: (c: CropCoordinates) => void;
    onready?: () => void;
    onerror?: (e: Error) => void;
    overlay?: Snippet<[StencilProps]>;
    toolbar?: Snippet<[ReturnType<typeof createCropper>]>;
    empty?: Snippet;
    loading?: Snippet;
    error?: Snippet<[Error]>;
    class?: string;
    style?: string;
    [key: string]: unknown;
  } = $props();

  /** Circle stencil must always be 1:1; rect stencil uses the user's aspect ratio. */
  const effectiveAspectRatio = $derived(
    StencilComponent === CircleStencil ? 1 : (aspectRatio ?? null),
  );

  const cropper = createCropper({
    get src() {
      return src;
    },
    get aspectRatio() {
      return effectiveAspectRatio;
    },
    get sizeConstraints() {
      return sizeConstraints;
    },
    get cropOutsideImage() {
      return cropOutsideImage;
    },
    get initialCrop() {
      return initialCrop;
    },
    get grid() {
      return grid;
    },
    get transitions() {
      return transitions;
    },
    get readOnly() {
      return readOnly;
    },
    shape: StencilComponent === CircleStencil ? "circle" : "rect",
  });

  /** Only show grid lines while the user is actively interacting (dragging/resizing). */
  const effectiveGrid = $derived(
    gridOnlyActive && !cropper.interacting ? "none" : grid,
  );

  $effect(() => {
    cropper.setAspectRatio(effectiveAspectRatio);
  });

  $effect(() => {
    coordinates = cropper.crop;
  });

  $effect(() => {
    if (onchange && cropper.crop) onchange(cropper.crop);
  });

  $effect(() => {
    if (cropper.ready) onready?.();
  });

  $effect(() => {
    if (cropper.error) onerror?.(cropper.error);
  });

  let containerEl = $state<HTMLElement | undefined>();
  let canvasEl = $state<HTMLCanvasElement | undefined>();

  $effect(() => {
    const el = containerEl;
    if (el) cropper.bindContainer(el);
  });

  $effect(() => {
    const el = canvasEl;
    if (el) cropper.bindCanvas(el);
  });

  $effect(() => {
    return () => cropper.destroy();
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={containerEl}
  class="chop-cropper {className}"
  {style}
  role="application"
  aria-label="Image cropper"
  tabindex="0"
  onkeydown={cropper.handleKeyboard}
  onwheel={cropper.handleWheel}
  {...restProps}
>
  {#if cropper.loading}
    {#if loadingSnippet}
      {@render loadingSnippet()}
    {:else}
      <div class="chop-loading">Loading…</div>
    {/if}
  {:else if cropper.error}
    {#if errorSnippet}
      {@render errorSnippet(cropper.error)}
    {:else}
      <div class="chop-error">{cropper.error.message}</div>
    {/if}
  {:else if !cropper.image}
    {#if empty}
      {@render empty()}
    {:else}
      <div class="chop-empty">No image loaded</div>
    {/if}
  {:else}
    <!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
    <canvas
      bind:this={canvasEl}
      class="chop-canvas"
      role="img"
      aria-label="Image preview"
    ></canvas>

    {@const Stencil = StencilComponent}
    <Stencil
      rect={cropper.stencilRect}
      aspectRatio={effectiveAspectRatio}
      active={cropper.interacting}
      imageBounds={cropper.imageBounds}
      grid={effectiveGrid}
      {transitions}
      onmove={cropper.handleStencilMove}
      onresize={cropper.handleStencilResize}
      onresizestart={() => cropper.setInteracting(true)}
      onresizeend={() => cropper.setInteracting(false)}
      {...extraStencilProps}
    ></Stencil>

    <CropOverlay rect={cropper.stencilRect} imageBounds={cropper.imageBounds} />

    {#if overlay}
      {@render overlay(cropper.stencilProps)}
    {/if}

    {#if toolbar}
      {@render toolbar(cropper)}
    {/if}
  {/if}
</div>

<style>
  .chop-cropper {
    position: relative;
    overflow: hidden;
    background: var(--chop-bg, #1a1a1a);
    border-radius: var(--chop-border-radius, 0);
    user-select: none;
    touch-action: none;
  }

  .chop-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .chop-loading,
  .chop-error,
  .chop-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: var(--chop-toolbar-color, #fff);
  }
</style>
