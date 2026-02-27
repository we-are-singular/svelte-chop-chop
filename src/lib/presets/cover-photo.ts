/**
 * svelte-chop-chop — Cover photo preset
 * 16:9, min 1200px wide.
 */

export const coverPhoto = {
  aspectRatio: 16 / 9,
  sizeConstraints: {
    minWidth: 1200,
  },
  exportDefaults: {
    format: 'image/jpeg',
    quality: 0.9,
  },
};
