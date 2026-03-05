<script lang="ts">
  import { ImageEditor } from "$lib";
  import { pluginFilters } from "$lib/plugins/plugin-filters.js";
  import { pluginFinetune } from "$lib/plugins/plugin-finetune.js";
  import { pluginFrame } from "$lib/plugins/plugin-frame.js";
  import { pluginWatermark } from "$lib/plugins/plugin-watermark.js";
  import { pluginResize } from "$lib/plugins/plugin-resize.js";
  import "$lib/themes/default.css";
  import DocLiveExample from "../DocLiveExample.svelte";
</script>

<svelte:head>
  <title>ImageEditor — svelte-chop-chop</title>
  <meta
    name="description"
    content="ImageEditor component reference. Full-featured image editor with crop, rotate, filters, and plugin system."
  />
</svelte:head>

<h1>ImageEditor</h1>
<p class="lead">
  The all-in-one <code>ImageEditor</code>
  component provides a full-featured editing toolbar driven by a plugin system. Crop,
  filter, tune, resize, frame and watermark — all in one component.
</p>

<h2>Import</h2>

<pre><code>import &#123; ImageEditor &#125; from '@we-are-singular/svelte-chop-chop';</code></pre>

<h2>Props</h2>

<table>
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>src</code></td>
      <td><code>ImageSource</code></td>
      <td>—</td>
      <td>
        Image URL, data URL, <code>File</code>
        ,
        <code>Blob</code>
        , or
        <code>HTMLImageElement</code>
        .
      </td>
    </tr>
    <tr>
      <td><code>plugins</code></td>
      <td><code>ChopPlugin[]</code></td>
      <td><code>[]</code></td>
      <td>Plugin instances that add toolbar tabs and functionality.</td>
    </tr>
    <tr>
      <td><code>aspectRatio</code></td>
      <td>
        <code>number | &#123; min?: number; max?: number &#125; | null</code>
      </td>
      <td><code>null</code></td>
      <td>Initial crop aspect ratio.</td>
    </tr>
    <tr>
      <td><code>initialCropScale</code></td>
      <td><code>number</code></td>
      <td><code>0.8</code></td>
      <td>
        Initial crop as fraction of image (0–1). <code>0.8</code>
        = 80% centered. Applied when changing aspect ratio or stencil too.
      </td>
    </tr>
    <tr>
      <td><code>class</code></td>
      <td><code>string</code></td>
      <td><code>''</code></td>
      <td>Extra CSS class on the root element.</td>
    </tr>
  </tbody>
</table>

<h2>Events</h2>

<table>
  <thead>
    <tr>
      <th>Event</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>onexport</code></td>
      <td><code>(blob: Blob) =&gt; void</code></td>
      <td>
        Fires when the user presses the export/save button. Receives the
        exported <code>Blob</code>
        .
      </td>
    </tr>
    <tr>
      <td><code>oncancel</code></td>
      <td><code>() =&gt; void</code></td>
      <td>Fires when the user presses cancel/close.</td>
    </tr>
  </tbody>
</table>

<h2>Minimal editor (crop + rotate only)</h2>

<p>
  Use <code>ImageEditor</code>
  without plugins for just crop and rotate:
</p>

<DocLiveExample
  title="Crop and rotate only (no plugins)"
  code={`<ImageEditor src="/photo.jpg" style="height: 320px;" />`}
>
  {#snippet demo()}
    <ImageEditor
      src="https://picsum.photos/id/10/800/600"
      style="height: 280px; width: 100%;"
    />
  {/snippet}
</DocLiveExample>

<h2>Full example with all plugins</h2>

<DocLiveExample
  title="ImageEditor with all plugins"
  code={`<script lang="ts">
  import { ImageEditor } from '@we-are-singular/svelte-chop-chop';
  import { pluginFilters, pluginFinetune, pluginFrame, pluginWatermark, pluginResize } from '@we-are-singular/svelte-chop-chop';
  import '@we-are-singular/svelte-chop-chop/themes/default';

  function handleExport(result) {
    if (result.blob) {
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'edited.jpg';
      link.click();
      URL.revokeObjectURL(url);
    }
  }
</script>

<ImageEditor
  src="/photo.jpg"
  plugins={[pluginFilters(), pluginFinetune(), pluginFrame(), pluginWatermark(), pluginResize()]}
  onexport={handleExport}
/>`}
>
  {#snippet demo()}
    <ImageEditor
      src="https://picsum.photos/id/10/800/600"
      plugins={[
        pluginFilters(),
        pluginFinetune(),
        pluginFrame(),
        pluginWatermark(),
        pluginResize(),
      ]}
      style="height: 320px; width: 100%;"
    />
  {/snippet}
</DocLiveExample>

<h2>Upload to server example</h2>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; ImageEditor &#125; from '@we-are-singular/svelte-chop-chop';
  import &#123; pluginFilters &#125; from '@we-are-singular/svelte-chop-chop/plugins/filters';

  async function handleExport(blob: Blob) &#123;
    const formData = new FormData();
    formData.append('image', blob, 'photo.jpg');
    await fetch('/api/upload', &#123; method: 'POST', body: formData &#125;);
  &#125;
&lt;/script&gt;

&lt;ImageEditor
  src="/photo.jpg"
  plugins=&#123;[pluginFilters()]&#125;
  onexport=&#123;handleExport&#125;
/&gt;</code></pre>

<h2>Keyboard shortcuts</h2>

<p>The editor accepts keyboard input when focused:</p>

<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>R</code></td>
      <td>Rotate 90° clockwise</td>
    </tr>
    <tr>
      <td><code>Shift+R</code></td>
      <td>Rotate 90° counter-clockwise</td>
    </tr>
    <tr>
      <td><code>H</code></td>
      <td>Flip horizontal</td>
    </tr>
    <tr>
      <td><code>V</code></td>
      <td>Flip vertical</td>
    </tr>
    <tr>
      <td><code>Ctrl+Z</code></td>
      <td>Undo</td>
    </tr>
    <tr>
      <td><code>Ctrl+Shift+Z</code></td>
      <td>Redo</td>
    </tr>
    <tr>
      <td><code>Arrow keys</code></td>
      <td>Move crop 1px (10px with Shift)</td>
    </tr>
    <tr>
      <td>
        <code>+</code>
        /
        <code>-</code>
      </td>
      <td>Zoom in / out</td>
    </tr>
    <tr>
      <td><code>0</code></td>
      <td>Reset zoom (fit to view)</td>
    </tr>
    <tr>
      <td><code>Escape</code></td>
      <td>Cancel / close</td>
    </tr>
  </tbody>
</table>

<h2>Headless composable</h2>

<p>
  For full UI control, use <code>createImageEditor</code>
  from the headless export. It returns a reactive state object with all actions:
</p>

<pre><code>import &#123; createImageEditor &#125; from '@we-are-singular/svelte-chop-chop/headless';
import &#123; pluginFilters &#125; from '@we-are-singular/svelte-chop-chop/plugins/filters';
import &#123; pluginFinetune &#125; from '@we-are-singular/svelte-chop-chop/plugins/finetune';

const editor = createImageEditor(&#123;
  plugins: [pluginFilters(), pluginFinetune()],
&#125;);

// Load an image
await editor.loadImage('/photo.jpg');

// Apply a filter
editor.applyFilter('clarendon');

// Adjust finetune
editor.setFinetune('brightness', 20);
editor.setFinetune('contrast', 10);

// Rotate and flip
editor.rotate(90);
editor.flipX();

// Undo / redo
editor.undo();

// Export
const result = await editor.export(&#123;
  format: 'image/webp',
  quality: 0.9,
  maxWidth: 1920,
&#125;);

// result.blob, result.file, result.dataURL, result.canvas
// result.coordinates, result.transforms, result.originalSize</code></pre>

<h2>Export options</h2>

<p>
  Export renders at <strong>full resolution</strong>
  using the original image pixels. The viewport size does not limit output — a
  large image displayed small will export at its cropped region's actual
  dimensions. Use
  <code>maxWidth</code>
  /
  <code>maxHeight</code>
   to downscale if needed.
</p>

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>format</code></td>
      <td><code>'image/jpeg' | 'image/png' | 'image/webp'</code></td>
      <td><code>'image/png'</code></td>
      <td>MIME type for the output image.</td>
    </tr>
    <tr>
      <td><code>quality</code></td>
      <td><code>number</code></td>
      <td><code>0.92</code></td>
      <td>Compression quality 0–1 (JPEG/WebP only).</td>
    </tr>
    <tr>
      <td><code>maxWidth</code></td>
      <td><code>number</code></td>
      <td>—</td>
      <td>Maximum output width. Downscales proportionally if exceeded.</td>
    </tr>
    <tr>
      <td><code>maxHeight</code></td>
      <td><code>number</code></td>
      <td>—</td>
      <td>Maximum output height. Downscales proportionally if exceeded.</td>
    </tr>
    <tr>
      <td><code>shape</code></td>
      <td><code>'rect' | 'circle'</code></td>
      <td><code>'rect'</code></td>
      <td>
        Crop shape. <code>'circle'</code>
        applies a circular mask with transparent corners. Automatically uses PNG
        if JPEG was selected (JPEG doesn't support transparency).
      </td>
    </tr>
    <tr>
      <td><code>postProcess</code></td>
      <td><code>(ctx, canvas) =&gt; void | Promise</code></td>
      <td>—</td>
      <td>
        Hook to draw on the canvas after rendering but before encoding (e.g.
        custom watermark).
      </td>
    </tr>
  </tbody>
</table>

<h2>ExportResult type</h2>

<pre><code>interface ExportResult &#123;
  canvas?: HTMLCanvasElement;
  blob?: Blob;
  file?: File;
  dataURL?: string;
  coordinates: CropCoordinates;
  transforms: TransformState;
  originalSize: &#123; width: number; height: number &#125;;
&#125;</code></pre>
