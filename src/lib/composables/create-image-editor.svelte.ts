/**
 * svelte-chop-chop — Full image editor orchestrator
 * Combines crop, transform, filters, history, plugins.
 */

import type {
  AspectRatio,
  ChopPlugin,
  CropCoordinates,
  EditorEvents,
  EditorSnapshot,
  ExportOptions,
  ExportPostProcessor,
  ExportResult,
  FilterMatrix,
  FilterState,
  FrameSettings,
  HistoryEntry,
  ImageEditorReturn,
  ImageSource,
  Rect,
  ToolbarAction,
  TransformState,
  WatermarkSettings,
} from "../core/types.js";
import { createImageLoader } from "../core/image-loader.svelte.js";
import { createCropEngine } from "../core/crop-engine.svelte.js";
import { createTransformEngine } from "../core/transform-engine.svelte.js";
import { createHistoryManager } from "../core/history-manager.svelte.js";
import {
  createPinchHandler,
  createWheelHandler,
} from "../core/interactions.js";
import { exportImage } from "../core/export.js";
import {
  applyColorMatrix,
  applyGamma,
  brightnessMatrix,
  clarityMatrix,
  contrastMatrix,
  exposureMatrix,
  multiplyMatrices,
  saturationMatrix,
  temperatureMatrix,
} from "../core/color-matrix.js";
import { createKeyboardHandler } from "../core/keyboard.js";

const DEFAULT_FILTERS: FilterState = {
  preset: null,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  clarity: 0,
  gamma: 1,
};

const DEFAULT_FRAME: FrameSettings = {
  type: "none",
  color: "#000000",
  width: 20,
};

const DEFAULT_WATERMARK: WatermarkSettings = {
  text: "",
  opacity: 0.7,
  position: "bottom-right",
  color: "#ffffff",
  fontSize: 24,
};

export interface ImageEditorOptions {
  src?: ImageSource;
  initialCrop?: Partial<Rect>;
  /** Initial crop as fraction of image (0–1). 1 = full image, 0.8 = 80% centered. Default 0.8 for ImageEditor. */
  initialCropScale?: number;
  initialTransforms?: Partial<TransformState>;
  aspectRatio?: AspectRatio;
  sizeConstraints?: import("../core/types.js").SizeConstraints;
  maxHistory?: number;
  exportDefaults?: Partial<ExportOptions>;
  plugins?: ChopPlugin[];
  readOnly?: boolean;
}

/**
 * Create full image editor composable.
 */
export function createImageEditor(
  options: ImageEditorOptions = {},
): ImageEditorReturn {
  const loader = createImageLoader();
  const engine = createCropEngine({
    aspectRatio: options.aspectRatio ?? null,
    sizeConstraints: options.sizeConstraints,
    initialCrop: options.initialCrop,
    initialCropScale: options.initialCropScale ?? 0.8,
  });
  const transform = createTransformEngine({
    initialTransforms: options.initialTransforms,
  });
  const history = createHistoryManager({
    maxEntries: options.maxHistory ?? 50,
  });

  let filters = $state<FilterState>({ ...DEFAULT_FILTERS });
  let frame = $state<FrameSettings>({ ...DEFAULT_FRAME });
  let watermark = $state<WatermarkSettings>({ ...DEFAULT_WATERMARK });
  let interacting = $state(false);
  let activeTab = $state<string | null>(null);
  let actions = $state<ToolbarAction[]>([]);
  let filterPresets = $state<FilterMatrix[]>([]);
  let postProcessors = $state<ExportPostProcessor[]>([]);
  let canvasEl: HTMLCanvasElement | null = null;
  let containerEl: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let animationFrame: number | null = null;
  let pinchCleanup: (() => void) | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventHandlers = new Map<string, Set<(...args: any[]) => void>>();

  const ready = $derived(!!loader.image && !loader.loading);
  const crop = $derived(engine.coordinates);
  const dirty = $derived(true);

  function emit<T extends keyof EditorEvents>(
    event: T,
    ...args: Parameters<EditorEvents[T]>
  ): void {
    const handlers = eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((fn) => fn(...args));
    }
  }

  function on<T extends keyof EditorEvents>(
    event: T,
    handler: EditorEvents[T],
  ): () => void {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set());
    }
    const set = eventHandlers.get(event)!;
    set.add(handler);
    return () => set.delete(handler);
  }

  async function loadImage(src: ImageSource): Promise<void> {
    await loader.load(src);
    if (loader.image) {
      engine.setImageSize({
        width: loader.image.naturalWidth,
        height: loader.image.naturalHeight,
      });
      if (containerEl) {
        const w = Math.max(1, containerEl.clientWidth);
        const h = Math.max(1, containerEl.clientHeight);
        engine.setContainerSize({ width: w, height: h });
      }
      // Save initial state into history
      pushHistory("Initial");
      emit("image:load", loader.image);
      emit("ready");
    }
    if (loader.error) {
      emit("image:error", loader.error);
    }
  }

  function bindContainer(container: HTMLElement): void {
    // Clean up previous pinch listener
    pinchCleanup?.();
    pinchCleanup = null;

    if (resizeObserver && containerEl) {
      resizeObserver.unobserve(containerEl);
    }
    containerEl = container;
    if (container) {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      engine.setContainerSize({ width: w, height: h });
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          engine.setContainerSize({
            width: Math.max(1, width),
            height: Math.max(1, height),
          });
        }
      });
      resizeObserver.observe(container);

      // Attach pinch zoom via capture-phase listeners so they fire even when
      // child elements have captured pointers.
      const pinch = createPinchHandler({
        onPinch: (scale) => {
          if (!options.readOnly) transform.zoomBy(scale - 1);
        },
      });
      container.addEventListener("pointerdown", pinch.onpointerdown, true);
      container.addEventListener("pointermove", pinch.onpointermove, true);
      container.addEventListener("pointerup", pinch.onpointerup, true);
      pinchCleanup = () => {
        container.removeEventListener("pointerdown", pinch.onpointerdown, true);
        container.removeEventListener("pointermove", pinch.onpointermove, true);
        container.removeEventListener("pointerup", pinch.onpointerup, true);
      };
    }
  }

  function bindCanvas(canvas: HTMLCanvasElement): void {
    canvasEl = canvas;
    render();
  }

  function render(): void {
    if (!canvasEl || !loader.image || !containerEl) return;
    const dpr = window.devicePixelRatio ?? 1;
    const w = containerEl.clientWidth;
    const h = containerEl.clientHeight;
    canvasEl.width = w * dpr;
    canvasEl.height = h * dpr;
    canvasEl.style.width = `${w}px`;
    canvasEl.style.height = `${h}px`;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    // Pan/zoom/rotate/flip are handled by CSS transform on the DOM layer,
    // so we only draw the image at its natural imageRect (fitted to container).
    const imgRect = engine.imageRect;

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.drawImage(
      loader.image.element,
      imgRect.x,
      imgRect.y,
      imgRect.width,
      imgRect.height,
    );
    ctx.restore();

    // Apply filters for live preview (same logic as export)
    if (hasActiveFilters()) {
      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      applyColorMatrix(imageData, buildFilterMatrix());
      if (filters.gamma !== 1) applyGamma(imageData, filters.gamma);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  // Re-render whenever the image, image rect, or filters change.
  // Transforms (pan/zoom/rotate/flip) are handled by CSS on the DOM layer — no canvas re-render needed.
  $effect(() => {
    // Access reactive state to establish dependencies
    const _ready = ready;
    const _imgRect = engine.imageRect;
    const _filters = filters; // re-render canvas when filters change for live preview

    if (!_ready || !canvasEl || !containerEl) return;

    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      render();
      animationFrame = null;
    });
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  });

  // ─── Filter helpers ──────────────────────────────────────

  function buildFilterMatrix(): number[] {
    const IDENTITY = [
      1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
    ];
    let matrix = IDENTITY;

    // Apply selected preset first
    if (filters.preset && filters.preset !== "none") {
      const preset = filterPresets.find((p) => p.name === filters.preset);
      if (preset) matrix = multiplyMatrices(matrix, preset.matrix);
    }

    // Layer finetune adjustments on top
    if (filters.brightness !== 0)
      matrix = multiplyMatrices(matrix, brightnessMatrix(filters.brightness));
    if (filters.contrast !== 0)
      matrix = multiplyMatrices(matrix, contrastMatrix(filters.contrast));
    if (filters.saturation !== 0)
      matrix = multiplyMatrices(matrix, saturationMatrix(filters.saturation));
    if (filters.exposure !== 0)
      matrix = multiplyMatrices(matrix, exposureMatrix(filters.exposure));
    if (filters.temperature !== 0)
      matrix = multiplyMatrices(matrix, temperatureMatrix(filters.temperature));
    if (filters.clarity !== 0)
      matrix = multiplyMatrices(matrix, clarityMatrix(filters.clarity));

    return matrix;
  }

  function hasActiveFilters(): boolean {
    return (
      (filters.preset !== null && filters.preset !== "none") ||
      filters.brightness !== 0 ||
      filters.contrast !== 0 ||
      filters.saturation !== 0 ||
      filters.exposure !== 0 ||
      filters.temperature !== 0 ||
      filters.clarity !== 0 ||
      filters.gamma !== 1
    );
  }

  // ─── Export ──────────────────────────────────────────────

  async function doExport(opts?: ExportOptions): Promise<ExportResult> {
    if (!loader.image) throw new Error("No image loaded");
    emit("export:start");
    try {
      const merged: ExportOptions = {
        ...options.exportDefaults,
        ...opts,
        postProcess: async (drawCtx, canvas) => {
          // 1. Apply colour filters
          if (hasActiveFilters()) {
            const imageData = drawCtx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            applyColorMatrix(imageData, buildFilterMatrix());
            if (filters.gamma !== 1) applyGamma(imageData, filters.gamma);
            drawCtx.putImageData(imageData, 0, 0);
          }
          // 2. Run custom postProcess passed by caller
          await opts?.postProcess?.(drawCtx, canvas);
          // 3. Run plugin-registered post-processors (frame, watermark, etc.)
          for (const pp of postProcessors) {
            await pp(drawCtx, canvas);
          }
        },
      };

      const result = await exportImage(
        loader.image,
        engine.coordinates,
        transform.transforms,
        merged,
      );

      const resultWithFilters: ExportResult = {
        ...result,
        filters: { ...filters },
      };

      emit("export:complete", resultWithFilters);
      return resultWithFilters;
    } catch (err) {
      emit("export:error", err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  function getResult(): ExportResult {
    if (!loader.image) throw new Error("No image loaded");
    return {
      coordinates: engine.coordinates,
      transforms: transform.transforms,
      originalSize: {
        width: loader.image.naturalWidth,
        height: loader.image.naturalHeight,
      },
      filters: { ...filters },
    } as ExportResult;
  }

  async function download(
    filename?: string,
    opts?: ExportOptions,
  ): Promise<void> {
    const result = await doExport(opts);
    if (!result.blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(result.blob);
    a.download = filename ?? "export.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ─── History ─────────────────────────────────────────────

  function pushHistory(label: string): void {
    const cropVal = engine.crop;
    const transformsVal = transform.transforms;
    // Explicitly extract plain values — Svelte $state proxies can't be JSON-serialized via spread alone
    history.push(label, {
      crop: {
        x: cropVal.x,
        y: cropVal.y,
        width: cropVal.width,
        height: cropVal.height,
      },
      transforms: {
        rotation: transformsVal.rotation,
        flipX: transformsVal.flipX,
        flipY: transformsVal.flipY,
        zoom: transformsVal.zoom,
        pan: { x: transformsVal.pan.x, y: transformsVal.pan.y },
      },
      filters: { ...filters },
    });
  }

  function restoreState(state: EditorSnapshot): void {
    engine.setCrop(state.crop);
    transform.setRotation(state.transforms.rotation);
    // Conditionally flip only if state differs from current
    if (state.transforms.flipX !== transform.transforms.flipX)
      transform.flipX();
    if (state.transforms.flipY !== transform.transforms.flipY)
      transform.flipY();
    transform.setZoom(state.transforms.zoom);
    transform.setPan(state.transforms.pan);
    filters = { ...state.filters };
  }

  // ─── Keyboard shortcuts ───────────────────────────────────

  const keyboardHandler = createKeyboardHandler([
    {
      key: "r",
      action: () => {
        if (options.readOnly) return;
        pushHistory("Rotate right");
        transform.rotate(90);
      },
    },
    {
      key: "r",
      shift: true,
      action: () => {
        if (options.readOnly) return;
        pushHistory("Rotate left");
        transform.rotate(-90);
      },
    },
    {
      key: "h",
      action: () => {
        if (options.readOnly) return;
        pushHistory("Flip H");
        transform.flipX();
      },
    },
    {
      key: "v",
      action: () => {
        if (options.readOnly) return;
        pushHistory("Flip V");
        transform.flipY();
      },
    },
    {
      key: "z",
      ctrl: true,
      action: () => {
        const s = history.undo();
        if (s) restoreState(s);
      },
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      action: () => {
        const s = history.redo();
        if (s) restoreState(s);
      },
    },
    {
      key: "=",
      action: () => {
        if (!options.readOnly) transform.zoomBy(0.1);
      },
    },
    {
      key: "+",
      action: () => {
        if (!options.readOnly) transform.zoomBy(0.1);
      },
    },
    {
      key: "-",
      action: () => {
        if (!options.readOnly) transform.zoomBy(-0.1);
      },
    },
    { key: "0", action: () => engine.fitToImage() },
    {
      key: "Escape",
      action: () => {
        engine.fitToImage();
        transform.reset();
      },
    },
    { key: "g", action: () => {} }, // grid toggle — handled in ImageEditor component
  ]);

  function handleKeyboard(event: KeyboardEvent): void {
    keyboardHandler(event);
  }

  const wheelHandler = createWheelHandler({
    onZoom: (factor) => {
      if (!options.readOnly) transform.zoomBy(factor - 1);
    },
  });

  function handleWheel(event: WheelEvent): void {
    wheelHandler.onwheel(event);
  }

  // ─── Mutations ────────────────────────────────────────────

  function applyFilter(name: string): void {
    pushHistory(`Filter: ${name}`);
    filters = { ...filters, preset: name };
    emit("filter:change", filters);
  }

  function setFinetune(key: keyof FilterState, value: number): void {
    if (key === "preset") return;
    filters = { ...filters, [key]: value };
    emit("filter:change", filters);
  }

  function resetFilters(): void {
    pushHistory("Reset filters");
    filters = { ...DEFAULT_FILTERS };
    emit("filter:change", filters);
  }

  function setFrame(settings: Partial<FrameSettings>): void {
    frame = { ...frame, ...settings };
  }

  function setWatermark(settings: Partial<WatermarkSettings>): void {
    watermark = { ...watermark, ...settings };
  }

  // ─── Editor object ────────────────────────────────────────

  const editor: ImageEditorReturn = {
    get image() {
      return loader.image;
    },
    get loading() {
      return loader.loading;
    },
    get error() {
      return loader.error;
    },
    get ready() {
      return ready;
    },
    get crop() {
      return crop;
    },
    get transforms() {
      return transform.transforms;
    },
    get filters() {
      return filters;
    },
    get dirty() {
      return dirty;
    },
    get interacting() {
      return interacting;
    },
    get canUndo() {
      return history.canUndo;
    },
    get canRedo() {
      return history.canRedo;
    },
    get history() {
      return history.entries;
    },
    get actions() {
      return actions;
    },
    get activeTab() {
      return activeTab;
    },
    get frameSettings() {
      return frame;
    },
    get watermarkSettings() {
      return watermark;
    },
    get filterPresets() {
      return filterPresets;
    },
    setActiveTab: (tab: string | null) => {
      activeTab = tab;
    },
    setFrame,
    setWatermark,
    handleKeyboard,
    handleWheel,
    get imageRect() {
      return engine.imageRect;
    },
    moveBy: engine.moveBy,
    resizeBy: engine.resizeBy,
    setInteracting: engine.setInteracting,
    loadImage,
    setCrop: engine.setCrop,
    setAspectRatio: engine.setAspectRatio,
    fitToImage: engine.fitToImage,
    rotate: (degrees: number) => {
      pushHistory(`Rotate ${degrees}°`);
      transform.rotate(degrees);
    },
    setRotation: (degrees: number) => {
      pushHistory(`Set rotation ${degrees}°`);
      transform.setRotation(degrees);
    },
    flipX: () => {
      pushHistory("Flip horizontal");
      transform.flipX();
    },
    flipY: () => {
      pushHistory("Flip vertical");
      transform.flipY();
    },
    setZoom: transform.setZoom,
    zoomBy: transform.zoomBy,
    center: transform.center,
    reset: () => {
      pushHistory("Reset");
      transform.reset();
      engine.fitToImage();
    },
    applyFilter,
    setFinetune,
    resetFilters,
    undo: () => {
      const s = history.undo();
      if (s) restoreState(s);
    },
    redo: () => {
      const s = history.redo();
      if (s) restoreState(s);
    },
    export: doExport,
    getResult,
    download,
    bindCanvas,
    bindContainer,
    on,
    destroy: () => {
      pinchCleanup?.();
      if (resizeObserver && containerEl) resizeObserver.unobserve(containerEl);
      loader.destroy();
      emit("destroy");
    },
  };

  // ─── Plugin setup ─────────────────────────────────────────

  if (options.plugins) {
    for (const plugin of options.plugins) {
      const ctx = {
        editor,
        registerAction: (action: ToolbarAction) => {
          actions = [...actions, action];
        },
        registerShortcut: (
          shortcut: import("../core/types.js").KeyboardShortcut,
        ) => {
          // Shortcuts stored per-plugin — currently handled via handleKeyboard
        },
        showPanel: (name: string | null) => {
          activeTab = name;
        },
        registerPostProcessor: (fn: ExportPostProcessor) => {
          postProcessors.push(fn);
        },
        registerFilterPresets: (presets: FilterMatrix[]) => {
          filterPresets = [...filterPresets, ...presets];
        },
        on,
      };
      plugin.setup(ctx);
    }
  }

  $effect(() => {
    if (options.src) loadImage(options.src);
  });

  return editor;
}
