import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Cropper from './Cropper.svelte';

describe('Cropper', () => {
  it('should render empty state when no src', () => {
    render(Cropper);
    expect(screen.getByText('No image loaded')).toBeTruthy();
  });

  it('should accept class and style props', () => {
    const { container } = render(Cropper, {
      props: { class: 'custom-class', style: 'height: 500px;' },
    });
    const root = container.querySelector('.chop-cropper');
    expect(root?.classList.contains('custom-class')).toBe(true);
    expect(root?.getAttribute('style')).toContain('height: 500px');
  });

  it('should have correct ARIA attributes', () => {
    const { container } = render(Cropper);
    const root = container.querySelector('[role="application"]');
    expect(root).toBeTruthy();
    expect(root?.getAttribute('aria-label')).toBe('Image cropper');
  });
});
