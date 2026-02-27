/**
 * svelte-chop-chop — Headless cropper composable
 * Wires ImageLoader, CropEngine, canvas rendering, and export.
 */

import type {
  AspectRatio,
  CropCoordinates,
  ExportOptions,
  ExportResult,
  GridType,
  ImageSource,
  Rect,
  SizeConstraints,
  StencilProps,
} from "../core/types.js";
import { createImageLoader } from "../core/image-loader.svelte.js";
import { createCropEngine } from "../core/crop-engine.svelte.js";
import { exportImage } from "../core/export.js";
import type { Point } from "../core/types.js";
import type { HandlePosition } from "../core/types.js";
import {
  createWheelHandler,
  createPinchHandler,
} from "../core/interactions.js";
import { createKeyboardHandler } from "../core/keyboard.js";

const DEFAULT_TRANSFORM = {
  rotation: 0,
  flipX: false,
  flipY: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

export interface CropperOptions {
  src?: ImageSource;
  aspectRatio?: AspectRatio;
  sizeConstraints?: SizeConstraints;
  cropOutsideImage?: boolean;
  initialCrop?: Partial<Rect>;
  grid?: GridType;
  transitions?: boolean;
  readOnly?: boolean;
  /** Export shape: 'rect' (default) or 'circle'. Use 'circle' when stencil is CircleStencil. */
  shape?: "rect" | "circle";
}

export interface CropperReturn {
  get image(): import("../core/types.js").LoadedImage | null;
  get loading(): boolean;
  get error(): Error | null;
  get ready(): boolean;
  get crop(): CropCoordinates;
  get interacting(): boolean;
  get stencilRect(): Rect;
  get imageBounds(): Rect;
  get stencilProps(): StencilProps;
  loadImage: (src: ImageSource) => Promise<void>;
  setCrop: (rect: Partial<Rect>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setInteracting: (value: boolean) => void;
  reset: () => void;
  handleStencilMove: (delta: Point) => void;
  handleStencilResize: (handle: HandlePosition, delta: Point) => void;
  handleWheel: (event: WheelEvent) => void;
  handleKeyboard: (event: KeyboardEvent) => void;
  getResult: () => { coordinates: CropCoordinates; canvas?: HTMLCanvasElement };
  export: (options?: ExportOptions) => Promise<ExportResult>;
  bindCanvas: (canvas: HTMLCanvasElement) => void;
  bindContainer: (container: HTMLElement) => void;
  destroy: () => void;
}

/**
 * Create headless cropper composable.
 */
export function createCropper(options: CropperOptions = {}): CropperReturn {
  const loader = createImageLoader();
  const engine = createCropEngine({
    aspectRatio: options.aspectRatio ?? null,
    sizeConstraints: options.sizeConstraints,
    initialCrop: options.initialCrop,
    cropOutsideImage: options.cropOutsideImage,
    onChange: () => {},
  });

  const grid = options.grid ?? "rule-of-thirds";
  const transitions = options.transitions ?? true;

  let canvasEl: HTMLCanvasElement | null = null;
  let containerEl: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let animationFrame: number | null = null;
  let pinchCleanup: (() => void) | null = null;

  const ready = $derived(!!loader.image && !loader.loading);
  const crop = $derived(engine.coordinates);
  const stencilRect = $derived(engine.crop);
  const imageBounds = $derived(engine.imageRect);

  const stencilProps = $derived({
    rect: stencilRect,
    aspectRatio: options.aspectRatio ?? null,
    active: engine.interacting,
    imageBounds,
    grid,
    transitions,
  } satisfies StencilProps);

  async function loadImage(src: ImageSource): Promise<void> {
    await loader.load(src);
    if (loader.image) {
      engine.setImageSize({
        width: loader.image.naturalWidth,
        height: loader.image.naturalHeight,
      });
      if (containerEl) {
        engine.setContainerSize({
          width: containerEl.clientWidth,
          height: containerEl.clientHeight,
        });
      }
    }
  }

  function bindContainer(container: HTMLElement): void {
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

      // Attach pinch zoom via capture-phase listeners
      const pinch = createPinchHandler({
        onPinch: (scale) => {
          if (!options.readOnly) engine.scaleBy(scale);
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

    const img = loader.image;
    const imgRect = engine.imageRect;

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.drawImage(
      img.element,
      imgRect.x,
      imgRect.y,
      imgRect.width,
      imgRect.height,
    );
    ctx.restore();
  }

  $effect(() => {
    if (ready && canvasEl && containerEl) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        render();
        animationFrame = null;
      });
      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }
  });

  function handleStencilMove(delta: Point): void {
    if (options.readOnly) return;
    engine.moveBy(delta);
  }

  function handleStencilResize(handle: HandlePosition, delta: Point): void {
    if (options.readOnly) return;
    engine.resizeBy(handle, delta);
  }

  const wheel = createWheelHandler({
    onZoom: (factor) => {
      if (options.readOnly) return;
      engine.scaleBy(factor);
    },
  });

  /** Keyboard handler: arrow keys move the stencil 1 px (10 px with Shift). */
  const keyboard = createKeyboardHandler([
    {
      key: "ArrowLeft",
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: -1, y: 0 });
      },
    },
    {
      key: "ArrowRight",
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: 1, y: 0 });
      },
    },
    {
      key: "ArrowUp",
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: 0, y: -1 });
      },
    },
    {
      key: "ArrowDown",
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: 0, y: 1 });
      },
    },
    {
      key: "ArrowLeft",
      shift: true,
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: -10, y: 0 });
      },
    },
    {
      key: "ArrowRight",
      shift: true,
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: 10, y: 0 });
      },
    },
    {
      key: "ArrowUp",
      shift: true,
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: 0, y: -10 });
      },
    },
    {
      key: "ArrowDown",
      shift: true,
      action: () => {
        if (!options.readOnly) engine.moveBy({ x: 0, y: 10 });
      },
    },
    { key: "0", action: () => engine.fitToImage() },
  ]);

  function handleWheel(event: WheelEvent): void {
    wheel.onwheel(event);
  }

  function handleKeyboard(event: KeyboardEvent): void {
    keyboard(event);
  }

  function reset(): void {
    engine.fitToImage();
  }

  async function doExport(opts?: ExportOptions): Promise<ExportResult> {
    if (!loader.image) {
      throw new Error("No image loaded");
    }
    const shape = opts?.shape ?? options.shape ?? "rect";
    return exportImage(loader.image, engine.coordinates, DEFAULT_TRANSFORM, {
      ...opts,
      shape,
    });
  }

  function getResult(): {
    coordinates: CropCoordinates;
    canvas?: HTMLCanvasElement;
  } {
    return {
      coordinates: engine.coordinates,
      canvas: canvasEl ?? undefined,
    };
  }

  function destroy(): void {
    pinchCleanup?.();
    pinchCleanup = null;
    if (resizeObserver && containerEl) {
      resizeObserver.unobserve(containerEl);
    }
    resizeObserver = null;
    containerEl = null;
    canvasEl = null;
    loader.destroy();
  }

  $effect(() => {
    if (options.src) {
      loadImage(options.src);
    }
  });

  return {
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
    get interacting() {
      return engine.interacting;
    },
    get stencilRect() {
      return stencilRect;
    },
    get imageBounds() {
      return imageBounds;
    },
    get stencilProps() {
      return stencilProps;
    },
    loadImage,
    setCrop: engine.setCrop,
    setAspectRatio: engine.setAspectRatio,
    setInteracting: engine.setInteracting,
    reset,
    handleStencilMove,
    handleStencilResize,
    handleWheel,
    handleKeyboard,
    getResult,
    export: doExport,
    bindCanvas,
    bindContainer,
    destroy,
  };
}
