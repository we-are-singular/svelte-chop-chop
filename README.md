# svelte-chop-chop

> Headless-first image cropping and editing SDK for Svelte 5.
> Zero dependencies beyond Svelte.

[![npm](https://img.shields.io/npm/v/@we-are-singular/svelte-chop-chop)](https://www.npmjs.com/package/@we-are-singular/svelte-chop-chop)
[![license](https://img.shields.io/github/license/we-are-singular/svelte-chop-chop?cache=0)](LICENSE)

**[Documentation & Demo →](https://svelte-chop-chop.pages.dev)**

---

## Features

- **`<Cropper>`** — Lightweight crop component with handles, grid overlays, and transforms
- **`<ImageEditor>`** — Full-featured editor with plugin-driven toolbar
- **Headless composables** — `createCropper` and `createImageEditor` for fully custom UI
- **Plugin system** — filters, finetune, frame, watermark, resize (all opt-in)
- **Presets** — `profilePicture`, `coverPhoto`, `productImage`
- **Three themes** — default, dark, minimal (CSS custom properties)
- **Zero runtime dependencies** — peer dep: `svelte ^5.0.0` only

---

## Install

```bash
npm install @we-are-singular/svelte-chop-chop
```

---

## Quick Start

### Cropper

```svelte
<script lang="ts">
  import { Cropper } from '@we-are-singular/svelte-chop-chop';
  import '@we-are-singular/svelte-chop-chop/themes/default';
</script>

<Cropper src="/photo.jpg" aspectRatio={16 / 9} style="height: 400px;" />
```

### Image Editor

```svelte
<script lang="ts">
  import { ImageEditor } from '@we-are-singular/svelte-chop-chop';
  import { pluginFilters } from '@we-are-singular/svelte-chop-chop/plugins/filters';
  import { pluginFinetune } from '@we-are-singular/svelte-chop-chop/plugins/finetune';
  import { pluginFrame } from '@we-are-singular/svelte-chop-chop/plugins/frame';
  import { pluginWatermark } from '@we-are-singular/svelte-chop-chop/plugins/watermark';
  import { pluginResize } from '@we-are-singular/svelte-chop-chop/plugins/resize';
  import type { ExportResult } from '@we-are-singular/svelte-chop-chop';
  import '@we-are-singular/svelte-chop-chop/themes/default';

  function handleExport(result: ExportResult) {
    const url = URL.createObjectURL(result.blob!);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.jpg';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<ImageEditor
  src="/photo.jpg"
  plugins={[pluginFilters(), pluginFinetune(), pluginFrame(), pluginWatermark(), pluginResize()]}
  onexport={handleExport}
  style="height: 500px;"
/>
```

---

## Cropper Props

| Prop               | Type                                                     | Default            | Description                                                 |
| ------------------ | -------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| `src`              | `ImageSource`                                            | —                  | URL, data URL, `File`, `Blob`, or `HTMLImageElement`        |
| `aspectRatio`      | `number \| { min?: number; max?: number } \| null`       | `null`             | Aspect ratio constraint                                     |
| `sizeConstraints`  | `SizeConstraints`                                        | —                  | Min/max width/height in pixels                              |
| `initialCropScale` | `number`                                                 | `1`                | Initial crop as fraction of image (0–1). 0.8 = 80% centered |
| `grid`             | `"none" \| "rule-of-thirds" \| "grid" \| "golden-ratio"` | `"rule-of-thirds"` | Grid overlay                                                |
| `transitions`      | `boolean`                                                | `true`             | CSS transitions                                             |
| `stencil`          | `Component`                                              | `CropStencil`      | Custom stencil component                                    |
| `readOnly`         | `boolean`                                                | `false`            | Disable interaction                                         |
| `class` / `style`  | `string`                                                 | `''`               | Root element styling                                        |

**Bindable:** `coordinates` (`CropCoordinates`), `transforms` (`TransformState`)
**Events:** `onchange`, `onready`, `onerror`

---

## Headless Usage

```typescript
import { createCropper } from "@we-are-singular/svelte-chop-chop/headless";
import { createImageEditor } from "@we-are-singular/svelte-chop-chop";

// Lightweight cropper
const cropper = createCropper({ aspectRatio: 16 / 9 });
await cropper.loadImage("/photo.jpg");
const result = await cropper.export({ format: "image/webp", quality: 0.9 });

// Full editor
const editor = createImageEditor({ plugins: [pluginFilters()] });
await editor.loadImage("/photo.jpg");
editor.applyFilter("clarendon");
editor.rotate(90);
const result = await editor.export({ format: "image/webp", quality: 0.9 });
// result.blob, result.dataURL, result.canvas, result.coordinates
```

---

## Plugins

| Import                                                | Description                                      |
| ----------------------------------------------------- | ------------------------------------------------ |
| `@we-are-singular/svelte-chop-chop/plugins/filters`   | 16 Instagram-style color filter presets          |
| `@we-are-singular/svelte-chop-chop/plugins/finetune`  | Brightness, contrast, saturation, exposure, etc. |
| `@we-are-singular/svelte-chop-chop/plugins/frame`     | Decorative frame at export (solid, line, hook)   |
| `@we-are-singular/svelte-chop-chop/plugins/watermark` | Text watermark at export                         |
| `@we-are-singular/svelte-chop-chop/plugins/resize`    | Output width/height controls                     |

### Custom Plugin

```typescript
import type { ChopPlugin } from "@we-are-singular/svelte-chop-chop";

const myPlugin: ChopPlugin = {
  name: "my-plugin",
  setup(ctx) {
    ctx.registerAction({
      id: "my-action",
      label: "My Action",
      group: "tabs",
      execute: () => ctx.showPanel("my-panel"),
    });

    ctx.registerPostProcessor(async (drawCtx, canvas) => {
      // draw on canvas at export time
    });

    return () => {
      /* cleanup */
    };
  },
};
```

---

## Presets

```typescript
import { profilePicture, coverPhoto, productImage } from '@we-are-singular/svelte-chop-chop/presets';

// Spread into component props
<Cropper src="/photo.jpg" {...profilePicture} />
```

| Preset           | Aspect | Max Size        | Format |
| ---------------- | ------ | --------------- | ------ |
| `profilePicture` | 1:1    | 512px           | JPEG   |
| `coverPhoto`     | 16:9   | min 1200px wide | JPEG   |
| `productImage`   | 1:1    | —               | PNG    |

---

## Theming

```css
@import "@we-are-singular/svelte-chop-chop/themes/default"; /* or dark, minimal */
```

Override any CSS custom property:

```css
:root {
  --chop-bg: #1a1a2e;
  --chop-stencil-border: #e94560;
  --chop-toolbar-active: #e94560;
}
```

**Available variables:** `--chop-bg`, `--chop-canvas-bg`, `--chop-color`, `--chop-border-radius`, `--chop-stencil-border`, `--chop-stencil-border-active`, `--chop-grid-color`, `--chop-overlay`, `--chop-toolbar-bg`, `--chop-toolbar-color`, `--chop-toolbar-active`, `--chop-transition-duration`, `--chop-transition-easing`

---

## Package Exports

| Path                                               | Description                    |
| -------------------------------------------------- | ------------------------------ |
| `@we-are-singular/svelte-chop-chop`                | Components, composables, types |
| `@we-are-singular/svelte-chop-chop/headless`       | `createCropper` composable     |
| `@we-are-singular/svelte-chop-chop/plugins`        | All plugin factories           |
| `@we-are-singular/svelte-chop-chop/presets`        | Preset bundles                 |
| `@we-are-singular/svelte-chop-chop/themes/default` | Default CSS theme              |
| `@we-are-singular/svelte-chop-chop/themes/dark`    | Dark CSS theme                 |
| `@we-are-singular/svelte-chop-chop/themes/minimal` | Minimal CSS theme              |

---

## Keyboard Shortcuts

| Key                       | Action                          |
| ------------------------- | ------------------------------- |
| `R` / `Shift+R`           | Rotate 90° CW / CCW             |
| `H` / `V`                 | Flip horizontal / vertical      |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo                     |
| `+` / `-`                 | Zoom in / out                   |
| `0`                       | Reset crop to image bounds      |
| `Escape`                  | Reset all transforms            |
| `Ctrl+F`                  | Toggle filters panel            |
| Arrow keys                | Move crop 1px (10px with Shift) |

---

## License

MIT © [We Are Singular](https://github.com/we-are-singular)
