/**
 * svelte-chop-chop — Resize plugin
 * Output size control, width/height inputs.
 */

import type { ChopPlugin } from '../core/types.js';

/**
 * Create resize plugin.
 * Registers a 'resize' tab that opens output width/height inputs.
 */
export function pluginResize(): ChopPlugin {
  return {
    name: 'resize',
    setup(ctx) {
      ctx.registerAction({
        id: 'resize-tab',
        label: 'Resize',
        icon: 'maximize',
        group: 'tabs',
        execute: () => ctx.showPanel(ctx.editor.activeTab === 'resize' ? null : 'resize'),
      });

      return () => {};
    },
  };
}
