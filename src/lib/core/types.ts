/**
 * svelte-chop-chop — Core type definitions
 * All shared types and interfaces for the image editor SDK.
 */

// ─── Coordinates & Geometry ─────────────────────────────────

/** 2D point in any coordinate space */
export interface Point {
  x: number;
  y: number;
}

/** Width and height dimensions */
export interface Size {
  width: number;
  height: number;
}

/** Rectangle with position and size */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Crop coordinates in multiple coordinate spaces */
export interface CropCoordinates {
  /** Crop rect relative to original image (0-1 normalized) */
  normalized: Rect;
  /** Crop rect in original image pixels */
  pixels: Rect;
  /** Crop rect relative to the editor viewport */
  viewport: Rect;
}

// ─── Transforms ─────────────────────────────────────────────

/** Transform state for rotation, flip, zoom, and pan */
export interface TransformState {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zoom: number;
  pan: Point;
}

// ─── Image ──────────────────────────────────────────────────

/** Supported image source types */
export type ImageSource =
  | string
  | File
  | Blob
  | HTMLImageElement
  | HTMLCanvasElement;

/** Loaded image with metadata */
export interface LoadedImage {
  element: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  exifOrientation: number;
  objectURL: string | null;
}

// ─── Aspect Ratio ───────────────────────────────────────────

/** Aspect ratio constraint: number, range, or free */
export type AspectRatio = number | { min?: number; max?: number } | null;

/** Preset for aspect ratio selector */
export interface AspectRatioPreset {
  label: string;
  value: AspectRatio;
  icon?: string;
}

// ─── Size Constraints ───────────────────────────────────────

/** Min/max size constraints in original image pixels */
export interface SizeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minArea?: number;
}

// ─── Frame & Watermark ──────────────────────────────────────

/** Decorative frame overlay applied post-export */
export interface FrameSettings {
  type: "none" | "solid" | "line" | "hook";
  color: string;
  width: number;
}

/** Text watermark applied post-export */
export interface WatermarkSettings {
  text: string;
  opacity: number;
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  color: string;
  fontSize: number;
}

// ─── Export ─────────────────────────────────────────────────

/** Supported export formats */
export type ExportFormat = "image/jpeg" | "image/png" | "image/webp";

/** Post-processor hook called after crop/filter but before encoding */
export type ExportPostProcessor = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) => void | Promise<void>;

/** Export options */
export interface ExportOptions {
  format?: ExportFormat;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  mode?: "canvas" | "coordinates";
  shape?: "rect" | "circle";
  postProcess?: ExportPostProcessor;
}

/** Result of an export operation */
export interface ExportResult {
  canvas?: HTMLCanvasElement;
  blob?: Blob;
  file?: File;
  dataURL?: string;
  coordinates: CropCoordinates;
  transforms: TransformState;
  originalSize: Size;
  /** Filter state applied at export (ImageEditor only; undefined for Cropper) */
  filters?: FilterState;
}

// ─── Stencil Contract ───────────────────────────────────────

/** Props passed to stencil components */
export interface StencilProps {
  rect: Rect;
  aspectRatio: AspectRatio;
  active: boolean;
  imageBounds: Rect;
  grid: GridType;
  transitions: boolean;
}

/** Grid overlay type */
export type GridType = "none" | "rule-of-thirds" | "grid" | "golden-ratio";

/** Resize handle positions */
export type HandlePosition = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

// ─── History ────────────────────────────────────────────────

/** Single history entry */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  state: EditorSnapshot;
}

/** Full editor state snapshot for undo/redo */
export interface EditorSnapshot {
  crop: Rect;
  transforms: TransformState;
  filters: FilterState;
}

// ─── Filters ────────────────────────────────────────────────

/** Preset filter with color matrix */
export interface FilterMatrix {
  name: string;
  label: string;
  matrix: number[];
}

/** Filter state (preset + finetune values) */
export interface FilterState {
  preset: string | null;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  temperature: number;
  clarity: number;
  gamma: number;
}

// ─── Plugin System ──────────────────────────────────────────

/** Plugin definition */
export interface ChopPlugin {
  name: string;
  setup: (ctx: PluginContext) => void | (() => void);
}

/** Context passed to plugins */
export interface PluginContext {
  editor: ImageEditorReturn;
  registerAction: (action: ToolbarAction) => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Show a named panel in the editor UI (e.g. 'filters', 'finetune', 'resize') */
  showPanel: (name: string | null) => void;
  /** Register a post-processor that runs on canvas after crop+filters before encoding */
  registerPostProcessor: (fn: ExportPostProcessor) => void;
  /** Register custom filter presets for the filter selector */
  registerFilterPresets: (presets: FilterMatrix[]) => void;
  on: <T extends keyof EditorEvents>(
    event: T,
    handler: EditorEvents[T],
  ) => () => void;
}

/** Toolbar action definition */
export interface ToolbarAction {
  id: string;
  label: string;
  icon?: string;
  group?: string;
  order?: number;
  disabled?: () => boolean;
  execute: () => void;
}

/** Keyboard shortcut definition */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  label?: string;
}

/** Image editor return type (for plugin context) */
export interface ImageEditorReturn {
  image: LoadedImage | null;
  loading: boolean;
  error: Error | null;
  ready: boolean;
  crop: CropCoordinates;
  transforms: TransformState;
  filters: FilterState;
  dirty: boolean;
  interacting: boolean;
  loadImage: (src: ImageSource) => Promise<void>;
  setCrop: (rect: Partial<Rect>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  fitToImage: () => void;
  rotate: (degrees: number) => void;
  setRotation: (degrees: number) => void;
  flipX: () => void;
  flipY: () => void;
  setZoom: (zoom: number) => void;
  zoomBy: (delta: number) => void;
  center: () => void;
  reset: () => void;
  applyFilter: (name: string) => void;
  setFinetune: (key: keyof FilterState, value: number) => void;
  resetFilters: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: HistoryEntry[];
  export: (options?: ExportOptions) => Promise<ExportResult>;
  getResult: () => ExportResult;
  download: (filename?: string, options?: ExportOptions) => Promise<void>;
  /** Registered toolbar actions from plugins */
  actions: ToolbarAction[];
  /** Currently active panel name (set by plugins via showPanel) */
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
  /** Current frame overlay settings */
  frameSettings: FrameSettings;
  /** Current watermark settings */
  watermarkSettings: WatermarkSettings;
  setFrame: (settings: Partial<FrameSettings>) => void;
  setWatermark: (settings: Partial<WatermarkSettings>) => void;
  /** Handle keyboard events (wire to container onkeydown) */
  handleKeyboard: (event: KeyboardEvent) => void;
  /** Handle wheel events for zoom (wire to container onwheel) */
  handleWheel: (event: WheelEvent) => void;
  /** Image rect in viewport coordinates (where the image is placed) */
  imageRect: Rect;
  /** Move crop area by a viewport-space delta */
  moveBy: (delta: Point) => void;
  /** Resize crop area from a handle by a viewport-space delta */
  resizeBy: (handle: string, delta: Point) => void;
  /** Set crop interacting state (used by stencil drag callbacks) */
  setInteracting: (value: boolean) => void;
  /** Registered filter presets (for use in filter panel) */
  filterPresets: FilterMatrix[];
  bindCanvas: (canvas: HTMLCanvasElement) => void;
  bindContainer: (container: HTMLElement) => void;
  on: <T extends keyof EditorEvents>(
    event: T,
    handler: EditorEvents[T],
  ) => () => void;
  destroy: () => void;
}

// ─── Events ─────────────────────────────────────────────────

/** Editor event handlers */
export interface EditorEvents {
  "image:load": (image: LoadedImage) => void;
  "image:error": (error: Error) => void;
  "crop:change": (coordinates: CropCoordinates) => void;
  "crop:start": () => void;
  "crop:end": () => void;
  "transform:change": (transforms: TransformState) => void;
  "filter:change": (filters: FilterState) => void;
  "history:change": (entry: HistoryEntry) => void;
  "export:start": () => void;
  "export:complete": (result: ExportResult) => void;
  "export:error": (error: Error) => void;
  ready: () => void;
  destroy: () => void;
}
