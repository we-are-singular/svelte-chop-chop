/**
 * svelte-chop-chop — Canvas export
 * Render crop to canvas, export as Blob/File/DataURL.
 */

import type {
  CropCoordinates,
  ExportFormat,
  ExportOptions,
  ExportResult,
  LoadedImage,
  TransformState,
} from "./types.js";

const DEFAULT_TRANSFORM: TransformState = {
  rotation: 0,
  flipX: false,
  flipY: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

function formatToExtension(format: string): string {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/png") return "png";
  if (format === "image/webp") return "webp";
  return "png";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
      type,
      quality,
    );
  });
}

/**
 * Export cropped image to canvas/blob/file.
 * @param image - Loaded image
 * @param crop - Crop coordinates
 * @param transforms - Transform state (optional)
 * @param options - Export options
 * @returns Export result with blob, file, dataURL
 */
export async function exportImage(
  image: LoadedImage,
  crop: CropCoordinates,
  transforms: TransformState = DEFAULT_TRANSFORM,
  options: ExportOptions = {},
): Promise<ExportResult> {
  const { format = "image/png", quality = 0.92, maxWidth, maxHeight } = options;

  // crop.pixels are in original image space (full resolution), not viewport
  let outputWidth = Math.round(crop.pixels.width);
  let outputHeight = Math.round(crop.pixels.height);

  if (maxWidth && outputWidth > maxWidth) {
    const scale = maxWidth / outputWidth;
    outputWidth = maxWidth;
    outputHeight = Math.round(outputHeight * scale);
  }
  if (maxHeight && outputHeight > maxHeight) {
    const scale = maxHeight / outputHeight;
    outputHeight = maxHeight;
    outputWidth = Math.round(outputWidth * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2d context");

  ctx.save();
  ctx.translate(outputWidth / 2, outputHeight / 2);
  ctx.rotate((transforms.rotation * Math.PI) / 180);
  ctx.scale(transforms.flipX ? -1 : 1, transforms.flipY ? -1 : 1);
  ctx.translate(-outputWidth / 2, -outputHeight / 2);

  const sx = Math.round(crop.pixels.x);
  const sy = Math.round(crop.pixels.y);
  const sw = Math.round(crop.pixels.width);
  const sh = Math.round(crop.pixels.height);

  ctx.drawImage(image.element, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
  ctx.restore();

  if (options.postProcess) {
    await options.postProcess(ctx, canvas);
  }

  // Apply circular mask if shape is "circle"
  if (options.shape === "circle") {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = outputWidth;
    maskCanvas.height = outputHeight;
    const maskCtx = maskCanvas.getContext("2d")!;

    // Draw circular clip, then composite the image into it
    maskCtx.beginPath();
    maskCtx.arc(
      outputWidth / 2,
      outputHeight / 2,
      Math.min(outputWidth, outputHeight) / 2,
      0,
      Math.PI * 2,
    );
    maskCtx.closePath();
    maskCtx.clip();
    maskCtx.drawImage(canvas, 0, 0);

    // Copy masked result back
    ctx.clearRect(0, 0, outputWidth, outputHeight);
    ctx.drawImage(maskCanvas, 0, 0);
  }

  const validFormats = ["image/jpeg", "image/png", "image/webp"] as const;
  // Force PNG for circle shape since JPEG doesn't support transparency
  const resolvedFormat =
    options.shape === "circle" && format === "image/jpeg"
      ? "image/png"
      : format;
  const exportFormat: ExportFormat = validFormats.includes(
    resolvedFormat as ExportFormat,
  )
    ? (resolvedFormat as ExportFormat)
    : "image/png";
  const blob = await canvasToBlob(canvas, exportFormat, quality);

  return {
    canvas,
    blob,
    file: new File([blob], `export.${formatToExtension(resolvedFormat)}`, {
      type: resolvedFormat,
    }),
    dataURL: canvas.toDataURL(resolvedFormat, quality),
    coordinates: crop,
    transforms,
    originalSize: {
      width: image.naturalWidth,
      height: image.naturalHeight,
    },
  };
}
