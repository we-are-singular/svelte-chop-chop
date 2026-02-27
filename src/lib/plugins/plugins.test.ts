import { describe, it, expect, vi } from 'vitest';
import { pluginFilters, FILTER_PRESETS } from './plugin-filters.js';
import { pluginFinetune } from './plugin-finetune.js';
import { pluginResize } from './plugin-resize.js';
import { pluginFrame } from './plugin-frame.js';
import { pluginWatermark } from './plugin-watermark.js';
import type { PluginContext } from '../core/types.js';

/** Create a mock PluginContext for testing plugin setup. */
function mockContext(): PluginContext & {
  actions: Array<{ id: string; label: string }>;
  shortcuts: Array<{ key: string }>;
  postProcessors: Array<Function>;
  filterPresets: Array<unknown>;
} {
  const ctx = {
    actions: [] as Array<{ id: string; label: string }>,
    shortcuts: [] as Array<{ key: string }>,
    postProcessors: [] as Array<Function>,
    filterPresets: [] as Array<unknown>,
    editor: {
      activeTab: null as string | null,
      frameSettings: { type: 'none' as const, width: 0, color: '#000' },
      watermarkSettings: {
        text: '',
        position: 'bottom-right' as const,
        fontSize: 16,
        color: '#fff',
        opacity: 0.5,
      },
    },
    registerAction(action: { id: string; label: string }) {
      ctx.actions.push(action);
    },
    registerShortcut(shortcut: { key: string }) {
      ctx.shortcuts.push(shortcut);
    },
    registerPostProcessor(fn: Function) {
      ctx.postProcessors.push(fn);
    },
    registerFilterPresets(presets: unknown[]) {
      ctx.filterPresets.push(...presets);
    },
    showPanel: vi.fn(),
    on: vi.fn(() => () => {}),
  };
  return ctx as unknown as ReturnType<typeof mockContext>;
}

describe('pluginFilters', () => {
  it('returns a plugin with name "filters"', () => {
    const plugin = pluginFilters();
    expect(plugin.name).toBe('filters');
  });

  it('registers filter presets on setup', () => {
    const ctx = mockContext();
    pluginFilters().setup(ctx as unknown as PluginContext);
    expect(ctx.filterPresets.length).toBeGreaterThan(0);
  });

  it('registers a filters-tab action', () => {
    const ctx = mockContext();
    pluginFilters().setup(ctx as unknown as PluginContext);
    expect(ctx.actions.some((a) => a.id === 'filters-tab')).toBe(true);
  });

  it('registers a keyboard shortcut (Ctrl+F)', () => {
    const ctx = mockContext();
    pluginFilters().setup(ctx as unknown as PluginContext);
    expect(ctx.shortcuts.some((s) => s.key === 'f')).toBe(true);
  });

  it('accepts custom presets', () => {
    const ctx = mockContext();
    const custom = [{ name: 'test', label: 'Test', matrix: new Array(20).fill(0) }];
    pluginFilters({ presets: custom }).setup(ctx as unknown as PluginContext);
    expect(ctx.filterPresets).toEqual(custom);
  });
});

describe('FILTER_PRESETS', () => {
  it('has at least 10 presets', () => {
    expect(FILTER_PRESETS.length).toBeGreaterThanOrEqual(10);
  });

  it('every preset has a 20-element matrix', () => {
    for (const preset of FILTER_PRESETS) {
      expect(preset.matrix).toHaveLength(20);
    }
  });

  it('every preset has name and label', () => {
    for (const preset of FILTER_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.label).toBeTruthy();
    }
  });

  it('includes "none" identity preset', () => {
    const none = FILTER_PRESETS.find((p) => p.name === 'none');
    expect(none).toBeDefined();
    // Identity diagonal
    expect(none!.matrix[0]).toBe(1);
    expect(none!.matrix[6]).toBe(1);
    expect(none!.matrix[12]).toBe(1);
    expect(none!.matrix[18]).toBe(1);
  });
});

describe('pluginFinetune', () => {
  it('returns a plugin with name "finetune"', () => {
    expect(pluginFinetune().name).toBe('finetune');
  });

  it('registers a finetune-tab action', () => {
    const ctx = mockContext();
    pluginFinetune().setup(ctx as unknown as PluginContext);
    expect(ctx.actions.some((a) => a.id === 'finetune-tab')).toBe(true);
  });
});

describe('pluginResize', () => {
  it('returns a plugin with name "resize"', () => {
    expect(pluginResize().name).toBe('resize');
  });

  it('registers a resize-tab action', () => {
    const ctx = mockContext();
    pluginResize().setup(ctx as unknown as PluginContext);
    expect(ctx.actions.some((a) => a.id === 'resize-tab')).toBe(true);
  });
});

describe('pluginFrame', () => {
  it('returns a plugin with name "frame"', () => {
    expect(pluginFrame().name).toBe('frame');
  });

  it('registers a frame-tab action', () => {
    const ctx = mockContext();
    pluginFrame().setup(ctx as unknown as PluginContext);
    expect(ctx.actions.some((a) => a.id === 'frame-tab')).toBe(true);
  });

  it('registers a post-processor', () => {
    const ctx = mockContext();
    pluginFrame().setup(ctx as unknown as PluginContext);
    expect(ctx.postProcessors.length).toBe(1);
  });
});

describe('pluginWatermark', () => {
  it('returns a plugin with name "watermark"', () => {
    expect(pluginWatermark().name).toBe('watermark');
  });

  it('registers a watermark-tab action', () => {
    const ctx = mockContext();
    pluginWatermark().setup(ctx as unknown as PluginContext);
    expect(ctx.actions.some((a) => a.id === 'watermark-tab')).toBe(true);
  });

  it('registers a post-processor', () => {
    const ctx = mockContext();
    pluginWatermark().setup(ctx as unknown as PluginContext);
    expect(ctx.postProcessors.length).toBe(1);
  });
});
