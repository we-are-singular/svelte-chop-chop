<h1>Cropper</h1>
<p class="lead">
  The <code>Cropper</code> component provides interactive image cropping with a draggable stencil,
  zoom, pan, keyboard navigation, and touch/pinch support.
</p>

<h2>Import</h2>

<pre><code>import &#123; Cropper &#125; from 'svelte-chop-chop';</code></pre>

<h2>Props</h2>

<h3>Image</h3>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>src</code></td>
      <td><code>ImageSource</code></td>
      <td>—</td>
      <td>Image URL, data URL, <code>File</code>, <code>Blob</code>, or <code>HTMLImageElement</code>.</td>
    </tr>
  </tbody>
</table>

<h3>Crop constraints</h3>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>aspectRatio</code></td>
      <td><code>number | &#123; min?: number; max?: number &#125; | null</code></td>
      <td><code>null</code></td>
      <td>Lock width/height ratio. <code>null</code> allows free crop.</td>
    </tr>
    <tr>
      <td><code>sizeConstraints</code></td>
      <td><code>SizeConstraints</code></td>
      <td>—</td>
      <td>Object with <code>minWidth</code>, <code>maxWidth</code>, <code>minHeight</code>, <code>maxHeight</code>, <code>minArea</code>.</td>
    </tr>
    <tr>
      <td><code>cropOutsideImage</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
      <td>Allow the stencil to extend outside the image bounds.</td>
    </tr>
    <tr>
      <td><code>initialCrop</code></td>
      <td><code>Partial&lt;Rect&gt;</code></td>
      <td>—</td>
      <td>Initial crop rectangle. If omitted, crop fits the image.</td>
    </tr>
  </tbody>
</table>

<h3>Visual</h3>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>grid</code></td>
      <td><code>'none' | 'rule-of-thirds' | 'grid' | 'golden-ratio'</code></td>
      <td><code>'rule-of-thirds'</code></td>
      <td>Grid overlay style on the stencil.</td>
    </tr>
    <tr>
      <td><code>gridOnlyActive</code></td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
      <td>Only show the grid while the stencil is being dragged.</td>
    </tr>
    <tr>
      <td><code>transitions</code></td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
      <td>Enable smooth CSS transitions when the stencil snaps to position.</td>
    </tr>
  </tbody>
</table>

<h3>Stencil</h3>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>stencil</code></td>
      <td><code>Component</code></td>
      <td><code>CropStencil</code></td>
      <td>Stencil component. Pass <code>CircleStencil</code> for circular crop.</td>
    </tr>
    <tr>
      <td><code>stencilProps</code></td>
      <td><code>Record&lt;string, unknown&gt;</code></td>
      <td><code>&#123;&#125;</code></td>
      <td>Extra props forwarded to the stencil component.</td>
    </tr>
  </tbody>
</table>

<h3>Interaction</h3>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>readOnly</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
      <td>Disable all user interactions (view-only mode).</td>
    </tr>
  </tbody>
</table>

<h3>HTML</h3>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>class</code></td>
      <td><code>string</code></td>
      <td><code>''</code></td>
      <td>Extra CSS class on the root element.</td>
    </tr>
    <tr>
      <td><code>style</code></td>
      <td><code>string</code></td>
      <td><code>''</code></td>
      <td>Inline styles on the root element.</td>
    </tr>
  </tbody>
</table>

<h2>Bindable values</h2>

<table>
  <thead>
    <tr><th>Binding</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>bind:coordinates</code></td>
      <td><code>CropCoordinates</code></td>
      <td>Two-way binding for the current crop coordinates (normalised, pixels, viewport).</td>
    </tr>
    <tr>
      <td><code>bind:transforms</code></td>
      <td><code>TransformState</code></td>
      <td>Two-way binding for transform state (rotation, flip, zoom, pan).</td>
    </tr>
  </tbody>
</table>

<h2>Events</h2>

<table>
  <thead>
    <tr><th>Event</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>onchange</code></td>
      <td><code>(c: CropCoordinates) =&gt; void</code></td>
      <td>Fires whenever the crop region changes.</td>
    </tr>
    <tr>
      <td><code>onready</code></td>
      <td><code>() =&gt; void</code></td>
      <td>Fires when the image has loaded and the cropper is interactive.</td>
    </tr>
    <tr>
      <td><code>onerror</code></td>
      <td><code>(e: Error) =&gt; void</code></td>
      <td>Fires when image loading fails.</td>
    </tr>
  </tbody>
</table>

<h2>Snippets</h2>

<p>Override default UI regions by passing named snippets:</p>

<table>
  <thead>
    <tr><th>Snippet</th><th>Props</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>overlay</code></td><td><code>StencilProps</code></td><td>Custom overlay drawn on top of the stencil area.</td></tr>
    <tr><td><code>toolbar</code></td><td><code>CropperReturn</code></td><td>Custom toolbar with full access to the cropper instance.</td></tr>
    <tr><td><code>empty</code></td><td>—</td><td>Shown when no image source is provided.</td></tr>
    <tr><td><code>loading</code></td><td>—</td><td>Shown while the image is loading.</td></tr>
    <tr><td><code>error</code></td><td><code>Error</code></td><td>Shown when image loading fails.</td></tr>
  </tbody>
</table>

<h2>CropCoordinates type</h2>

<p>
  Every coordinate callback and binding provides a <code>CropCoordinates</code> object with three
  representations of the same crop region:
</p>

<pre><code>interface CropCoordinates &#123;
  /** Crop rect relative to original image (0-1 normalised) */
  normalized: Rect;
  /** Crop rect in original image pixels */
  pixels: Rect;
  /** Crop rect relative to the editor viewport */
  viewport: Rect;
&#125;</code></pre>

<h2>Stencil types</h2>

<p>Use the built-in <code>CropStencil</code> (rectangular) or <code>CircleStencil</code> (circular mask):</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; Cropper, CircleStencil &#125; from 'svelte-chop-chop';
&lt;/script&gt;

&lt;Cropper src="/avatar.jpg" aspectRatio=&#123;1&#125; stencil=&#123;CircleStencil&#125; /&gt;</code></pre>

<p>Note: <code>CircleStencil</code> automatically forces a <code>1:1</code> aspect ratio regardless of the <code>aspectRatio</code> prop.</p>

<h2>Export</h2>

<p>Bind <code>this</code> to get a reference to the cropper instance and call <code>export()</code>:</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; Cropper &#125; from 'svelte-chop-chop';
  import type &#123; ExportResult &#125; from 'svelte-chop-chop';

  let cropper: Cropper;

  async function save() &#123;
    const result: ExportResult = await cropper.export(&#123;
      format: 'image/webp',
      quality: 0.92,
      maxWidth: 1200,
    &#125;);

    // result.blob    — the exported Blob
    // result.file    — a File object (for FormData uploads)
    // result.dataURL — base64 data URL string
    // result.canvas  — the HTMLCanvasElement used for rendering
    // result.coordinates — CropCoordinates
    // result.transforms  — TransformState
    // result.originalSize — &#123; width, height &#125;

    const url = URL.createObjectURL(result.blob!);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cropped.webp';
    a.click();
  &#125;
&lt;/script&gt;

&lt;Cropper bind:this=&#123;cropper&#125; src="/photo.jpg" /&gt;
&lt;button onclick=&#123;save&#125;&gt;Download&lt;/button&gt;</code></pre>

<h2>ExportResult type</h2>

<pre><code>interface ExportResult &#123;
  canvas?: HTMLCanvasElement;
  blob?: Blob;
  file?: File;
  dataURL?: string;
  coordinates: CropCoordinates;
  transforms: TransformState;
  originalSize: Size;
&#125;</code></pre>

<h2>Presets</h2>

<p>Spread a preset to preconfigure the Cropper for common use cases:</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; Cropper &#125; from 'svelte-chop-chop';
  import &#123; profilePicture &#125; from 'svelte-chop-chop/presets';
&lt;/script&gt;

&lt;Cropper src="/photo.jpg" &#123;...profilePicture&#125; /&gt;</code></pre>

<p>Available presets: <code>profilePicture</code> (1:1, 512px), <code>coverPhoto</code> (16:9, min 1200px), <code>productImage</code> (1:1, PNG).</p>

<h2>Keyboard shortcuts</h2>

<p>When the cropper container is focused:</p>

<table>
  <thead>
    <tr><th>Key</th><th>Action</th></tr>
  </thead>
  <tbody>
    <tr><td><code>Arrow keys</code></td><td>Move stencil 1px (10px with Shift)</td></tr>
    <tr><td><code>+</code> / <code>-</code></td><td>Zoom in / out</td></tr>
    <tr><td><code>0</code></td><td>Reset zoom (fit to view)</td></tr>
    <tr><td><code>Escape</code></td><td>Reset crop to fit image</td></tr>
  </tbody>
</table>

<h2>Custom stencil</h2>

<p>
  See the <a href="/docs/custom-stencil">Custom Stencil</a> guide for details on
  writing your own stencil component.
</p>
