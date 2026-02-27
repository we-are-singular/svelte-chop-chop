/**
 * svelte-chop-chop — Profile picture preset
 * Circle crop, 1:1, max 512px.
 */

export const profilePicture = {
  aspectRatio: 1,
  sizeConstraints: {
    maxWidth: 512,
    maxHeight: 512,
  },
  exportDefaults: {
    maxWidth: 512,
    maxHeight: 512,
    format: 'image/jpeg',
    quality: 0.9,
  },
};
