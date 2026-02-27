/**
 * svelte-chop-chop — Image loader with EXIF support
 * Loads images from URL, File, Blob, HTMLImageElement, HTMLCanvasElement.
 * Reads EXIF orientation for correct coordinate transforms.
 */

import type { ImageSource, LoadedImage } from './types.js';

/**
 * Create an image loader composable.
 * @returns Reactive image loader with load/destroy methods
 */
export function createImageLoader() {
  let image = $state<LoadedImage | null>(null);
  let loading = $state(false);
  let error = $state<Error | null>(null);

  async function load(src: ImageSource): Promise<void> {
    loading = true;
    error = null;

    try {
      const element = await resolveImageElement(src);
      const orientation = await readExifOrientation(element);

      const objectURL =
        typeof src !== 'string' &&
        !(src instanceof HTMLImageElement) &&
        !(src instanceof HTMLCanvasElement)
          ? URL.createObjectURL(
              src instanceof File || src instanceof Blob ? src : new Blob()
            )
          : null;

      image = {
        element,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
        exifOrientation: orientation,
        objectURL,
      };
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading = false;
    }
  }

  function destroy(): void {
    if (image?.objectURL) {
      URL.revokeObjectURL(image.objectURL);
    }
    image = null;
  }

  return {
    get image() {
      return image;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    load,
    destroy,
  };
}

async function resolveImageElement(src: ImageSource): Promise<HTMLImageElement> {
  if (src instanceof HTMLImageElement) {
    if (src.complete) return src;
    return new Promise((resolve, reject) => {
      src.onload = () => resolve(src);
      src.onerror = () => reject(new Error('Failed to load image'));
    });
  }

  if (src instanceof HTMLCanvasElement) {
    const img = new Image();
    img.src = src.toDataURL();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to convert canvas'));
    });
  }

  const url =
    src instanceof File || src instanceof Blob ? URL.createObjectURL(src) : src;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Failed to load image: ${typeof src === 'string' ? src : 'blob'}`));
  });
}

async function readExifOrientation(img: HTMLImageElement): Promise<number> {
  try {
    const response = await fetch(img.src);
    const buffer = await response.arrayBuffer();
    return parseExifOrientation(new DataView(buffer));
  } catch {
    return 1;
  }
}

function parseExifOrientation(view: DataView): number {
  if (view.byteLength < 2) return 1;
  if (view.getUint16(0) !== 0xffd8) return 1;

  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    if (marker === 0xffe1) {
      const exifOffset = offset + 10;
      if (exifOffset + 8 > view.byteLength) return 1;
      const isLittleEndian = view.getUint16(exifOffset) === 0x4949;
      const ifdOffset = exifOffset + view.getUint32(exifOffset + 4, isLittleEndian);
      if (ifdOffset + 2 > view.byteLength) return 1;
      const entries = view.getUint16(ifdOffset, isLittleEndian);

      for (let i = 0; i < entries; i++) {
        const entryOffset = ifdOffset + 2 + i * 12;
        if (entryOffset + 10 > view.byteLength) break;
        if (view.getUint16(entryOffset, isLittleEndian) === 0x0112) {
          return view.getUint16(entryOffset + 8, isLittleEndian);
        }
      }
      return 1;
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  return 1;
}
