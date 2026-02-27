/**
 * svelte-chop-chop — Image editor SDK for Svelte 5
 * Crop, rotate, flip, filter, resize with surgical precision.
 */

// Components
export { default as Cropper } from './components/Cropper.svelte';
export { default as ImageEditor } from './components/ImageEditor.svelte';
export { default as CropStencil } from './components/CropStencil.svelte';
export { default as CircleStencil } from './components/CircleStencil.svelte';
export { default as DragHandle } from './components/DragHandle.svelte';
export { default as CropOverlay } from './components/CropOverlay.svelte';
export { default as GridOverlay } from './components/GridOverlay.svelte';
export { default as Toolbar } from './components/Toolbar.svelte';
export { default as FilterStrip } from './components/FilterStrip.svelte';

// Composables
export { createCropper } from './composables/create-cropper.svelte.js';
export { createImageEditor } from './composables/create-image-editor.svelte.js';
export { createTransform } from './composables/create-transform.svelte.js';

// Core
export { createImageLoader } from './core/image-loader.svelte.js';
export { createCropEngine } from './core/crop-engine.svelte.js';
export { createTransformEngine } from './core/transform-engine.svelte.js';
export { createHistoryManager } from './core/history-manager.svelte.js';
export { createDragHandler, createPinchHandler, createWheelHandler } from './core/interactions.js';
export { createKeyboardHandler } from './core/keyboard.js';
export { exportImage } from './core/export.js';
export {
  applyColorMatrix,
  applyGamma,
  multiplyMatrices,
  brightnessMatrix,
  contrastMatrix,
  saturationMatrix,
  exposureMatrix,
  temperatureMatrix,
  clarityMatrix,
} from './core/color-matrix.js';

// Plugins
export {
  pluginFilters,
  FILTER_PRESETS,
  pluginFinetune,
  pluginResize,
  pluginFrame,
  pluginWatermark,
} from './plugins/index.js';

// Presets
export { profilePicture, coverPhoto, productImage } from './presets/index.js';

// Types
export type {
  Point,
  Size,
  Rect,
  CropCoordinates,
  TransformState,
  ImageSource,
  LoadedImage,
  AspectRatio,
  AspectRatioPreset,
  SizeConstraints,
  ExportFormat,
  ExportOptions,
  ExportResult,
  StencilProps,
  GridType,
  HandlePosition,
  HistoryEntry,
  EditorSnapshot,
  FilterMatrix,
  FilterState,
  ChopPlugin,
  PluginContext,
  ToolbarAction,
  KeyboardShortcut,
  ImageEditorReturn,
  EditorEvents,
  FrameSettings,
  WatermarkSettings,
  ExportPostProcessor,
} from './core/types.js';

// Coordinate system
export {
  viewportToImage,
  imageToViewport,
  normalizeRect,
  denormalizeRect,
  clampRect,
  fitRectToAspectRatio,
  fitImageToContainer,
  applyTransformToPoint,
} from './core/coordinate-system.js';
export type { Anchor } from './core/coordinate-system.js';

// Constraints
export {
  getAspectRatioValue,
  satisfiesAspectRatio,
  constrainRectToAspectRatio,
  validateSizeConstraints,
  applySizeConstraints,
} from './core/constraints.js';
