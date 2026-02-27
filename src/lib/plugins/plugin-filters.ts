/**
 * svelte-chop-chop — Preset filters plugin
 * Instagram-style color matrix presets.
 */

import type { ChopPlugin, FilterMatrix } from '../core/types.js';

const IDENTITY: number[] = [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0];

export const FILTER_PRESETS: FilterMatrix[] = [
  { name: 'none',       label: 'None',       matrix: IDENTITY },
  {
    name: 'clarendon', label: 'Clarendon',
    matrix: [1.2,0,0,0,10, 0,1.2,0,0,5, 0,0,1.3,0,0, 0,0,0,1,0],
  },
  {
    name: 'gingham',   label: 'Gingham',
    matrix: [0.9,0.05,0,0,10, 0.05,0.9,0.05,0,5, 0,0.05,0.9,0,0, 0,0,0,1,0],
  },
  {
    name: 'moon',      label: 'Moon',
    matrix: [0.45,0.45,0.45,0,30, 0.34,0.34,0.34,0,30, 0.27,0.27,0.27,0,30, 0,0,0,1,0],
  },
  {
    name: 'lark',      label: 'Lark',
    matrix: [1.1,0,0,0,10, 0,1.0,0,0,5, 0,0,0.8,0,-10, 0,0,0,1,0],
  },
  {
    name: 'reyes',     label: 'Reyes',
    matrix: [0.85,0.1,0.05,0,40, 0.05,0.85,0.1,0,40, 0.1,0.05,0.85,0,35, 0,0,0,1,0],
  },
  {
    name: 'juno',      label: 'Juno',
    matrix: [1.1,0,0,0,0, 0,1.05,0,0,5, 0,0,0.9,0,-5, 0,0,0,1,0],
  },
  {
    name: 'slumber',   label: 'Slumber',
    matrix: [0.85,0.1,0,0,20, 0.05,0.9,0,0,15, 0.1,0,0.7,0,20, 0,0,0,1,0],
  },
  {
    name: 'crema',     label: 'Crema',
    matrix: [1.0,0.05,0,0,15, 0,0.95,0.05,0,10, 0,0,0.9,0,10, 0,0,0,1,0],
  },
  {
    name: 'ludwig',    label: 'Ludwig',
    matrix: [1.05,0,0,0,5, 0,1.0,0,0,5, 0,0,0.95,0,0, 0,0,0,1,0],
  },
  {
    name: 'aden',      label: 'Aden',
    matrix: [0.9,0.1,0,0,15, 0,0.85,0.1,0,15, 0.1,0,0.8,0,20, 0,0,0,1,0],
  },
  {
    name: 'perpetua',  label: 'Perpetua',
    matrix: [1.05,0,0,0,0, 0.1,1.0,0,0,10, 0,0.05,0.9,0,5, 0,0,0,1,0],
  },
  {
    name: 'vintage',   label: 'Vintage',
    matrix: [0.9,0.05,0.05,0,20, 0.05,0.85,0.05,0,10, 0,0.05,0.75,0,5, 0,0,0,1,0],
  },
  {
    name: 'chrome',    label: 'Chrome',
    matrix: [0.98,0.05,0,0,0, 0,0.9,0,0,0, 0,0.02,0.85,0,0, 0,0,0,1,0],
  },
  {
    name: 'fade',      label: 'Fade',
    matrix: [0.8,0,0,0,40, 0,0.8,0,0,40, 0,0,0.8,0,40, 0,0,0,1,0],
  },
  {
    name: 'cool',      label: 'Cool',
    matrix: [0.9,0,0.1,0,0, 0,0.95,0.05,0,0, 0,0.05,1.1,0,5, 0,0,0,1,0],
  },
  {
    name: 'warm',      label: 'Warm',
    matrix: [1.1,0.05,0,0,10, 0,1.0,0,0,0, 0,0,0.85,0,-5, 0,0,0,1,0],
  },
];

export interface PluginFiltersOptions {
  presets?: FilterMatrix[];
}

/**
 * Create filters plugin.
 * Registers a 'filters' tab that opens the FilterStrip panel.
 */
export function pluginFilters(options: PluginFiltersOptions = {}): ChopPlugin {
  const presets = options.presets ?? FILTER_PRESETS;

  return {
    name: 'filters',
    setup(ctx) {
      // Register presets into the editor so buildFilterMatrix can look them up
      ctx.registerFilterPresets(presets);

      ctx.registerAction({
        id: 'filters-tab',
        label: 'Filters',
        icon: 'palette',
        group: 'tabs',
        execute: () => ctx.showPanel(ctx.editor.activeTab === 'filters' ? null : 'filters'),
      });

      ctx.registerShortcut({
        key: 'f',
        ctrl: true,
        action: () => ctx.showPanel(ctx.editor.activeTab === 'filters' ? null : 'filters'),
        label: 'Toggle filters',
      });

      return () => {};
    },
  };
}
