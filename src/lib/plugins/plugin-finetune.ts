/**
 * svelte-chop-chop — Finetune plugin
 * Brightness, contrast, saturation sliders.
 */

import type { ChopPlugin } from '../core/types.js';

/**
 * Create finetune plugin.
 * Registers a 'finetune' tab that opens brightness/contrast/saturation sliders.
 */
export function pluginFinetune(): ChopPlugin {
  return {
    name: 'finetune',
    setup(ctx) {
      ctx.registerAction({
        id: 'finetune-tab',
        label: 'Finetune',
        icon: 'sliders',
        group: 'tabs',
        execute: () => ctx.showPanel(ctx.editor.activeTab === 'finetune' ? null : 'finetune'),
      });

      return () => {};
    },
  };
}
