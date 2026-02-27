import { describe, it, expect } from 'vitest';
import { profilePicture } from './profile-picture.js';
import { coverPhoto } from './cover-photo.js';
import { productImage } from './product-image.js';

describe('profilePicture preset', () => {
  it('has 1:1 aspect ratio', () => {
    expect(profilePicture.aspectRatio).toBe(1);
  });

  it('limits to 512px', () => {
    expect(profilePicture.sizeConstraints.maxWidth).toBe(512);
    expect(profilePicture.sizeConstraints.maxHeight).toBe(512);
    expect(profilePicture.exportDefaults.maxWidth).toBe(512);
  });

  it('exports as JPEG', () => {
    expect(profilePicture.exportDefaults.format).toBe('image/jpeg');
  });
});

describe('coverPhoto preset', () => {
  it('has 16:9 aspect ratio', () => {
    expect(coverPhoto.aspectRatio).toBeCloseTo(16 / 9);
  });

  it('requires minimum 1200px width', () => {
    expect(coverPhoto.sizeConstraints.minWidth).toBe(1200);
  });
});

describe('productImage preset', () => {
  it('has 1:1 aspect ratio', () => {
    expect(productImage.aspectRatio).toBe(1);
  });

  it('exports as PNG', () => {
    expect(productImage.exportDefaults.format).toBe('image/png');
  });
});
