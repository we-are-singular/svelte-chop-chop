<script lang="ts">
  import { Cropper, CircleStencil } from "$lib";
  import type { HandlePosition, Point, StencilProps } from "$lib";
  import "$lib/themes/default.css";
  import DocLiveExample from "../DocLiveExample.svelte";
</script>

{#snippet cropToolbar(cropper)}
  <div style="position: absolute; bottom: 12px; right: 12px; z-index: 10;">
    <button
      onclick={async () => {
        const result = await cropper.export({
          format: "image/webp",
          quality: 0.9,
        });
        if (result.blob) {
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "cropped.webp";
          a.click();
          URL.revokeObjectURL(url);
        }
      }}
      style="padding: 0.5rem 1rem; background: #4a9eff; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
    >
      Crop
    </button>
  </div>
{/snippet}

<svelte:head>
  <title>Custom Stencil — svelte-chop-chop</title>
  <meta
    name="description"
    content="Create custom stencil components. Stencil contract, DragHandle, CropOverlay, GridOverlay."
  />
</svelte:head>

<h1>Custom Stencil</h1>
<p class="lead">
  The stencil is the draggable, resizable overlay that marks the crop area. You
  can write your own stencil component by following the stencil contract.
</p>

<h2>Built-in stencils</h2>

<p>
  Use <code>CircleStencil</code>
   for circular crop (automatically 1:1):
</p>

<DocLiveExample
  title="CircleStencil example"
  code={`<script lang="ts">
  import { Cropper, CircleStencil } from '@we-are-singular/svelte-chop-chop';
  import '@we-are-singular/svelte-chop-chop/themes/default';
</script>

<Cropper src="/avatar.jpg" stencil={CircleStencil} />`}
>
  {#snippet demo()}
    <Cropper
      src="https://picsum.photos/id/64/400/400"
      stencil={CircleStencil}
      style="height: 280px; width: 100%;"
      toolbar={cropToolbar}
    />
  {/snippet}
</DocLiveExample>

<h2>Stencil contract</h2>

<p>A stencil component receives these props from the cropper engine:</p>

<table>
  <thead>
    <tr>
      <th>Prop</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>rect</code></td>
      <td><code>Rect</code></td>
      <td>
        Current crop rect in viewport pixels: <code>
          &#123; x, y, width, height &#125;
        </code>
        .
      </td>
    </tr>
    <tr>
      <td><code>onmove</code></td>
      <td><code>(delta: Point) =&gt; void</code></td>
      <td>
        Call with pixel delta <code>&#123; x, y &#125;</code>
         to move the stencil.
      </td>
    </tr>
    <tr>
      <td><code>onresize</code></td>
      <td><code>(handle: HandlePosition, delta: Point) =&gt; void</code></td>
      <td>Call with handle position and delta to resize from a handle.</td>
    </tr>
    <tr>
      <td><code>grid</code></td>
      <td><code>boolean</code></td>
      <td>Whether to show the rule-of-thirds grid.</td>
    </tr>
    <tr>
      <td><code>gridOnlyActive</code></td>
      <td><code>boolean</code></td>
      <td>Only show the grid during active interaction.</td>
    </tr>
  </tbody>
</table>

<h2>HandlePosition</h2>

<p>
  <code>HandlePosition</code>
  is
  <code>'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'</code>
  .
</p>

<h2>Using DragHandle</h2>

<p>
  The built-in <code>DragHandle</code>
   component handles pointer events and emits resize deltas. Use it for the corner
  and edge handles of your stencil:
</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; DragHandle &#125; from '@we-are-singular/svelte-chop-chop';
  import type &#123; StencilProps, Point, HandlePosition &#125; from '@we-are-singular/svelte-chop-chop';
  import &#123; createDragHandler &#125; from '@we-are-singular/svelte-chop-chop';

  let &#123; rect, onmove, onresize, onresizestart, onresizeend &#125;: StencilProps &amp; &#123;
    onmove: (delta: Point) =&gt; void;
    onresize: (handle: HandlePosition, delta: Point) =&gt; void;
    onresizestart?: () =&gt; void;
    onresizeend?: () =&gt; void;
  &#125; = $props();

  const drag = createDragHandler(&#123; onMove: onmove &#125;);
&lt;/script&gt;

&lt;div
  class="my-stencil"
  style="left:&#123;rect.x&#125;px; top:&#123;rect.y&#125;px; width:&#123;rect.width&#125;px; height:&#123;rect.height&#125;px"
  role="region"
  aria-label="Crop area"
  onpointerdown=&#123;drag.onpointerdown&#125;
  onpointermove=&#123;drag.onpointermove&#125;
  onpointerup=&#123;drag.onpointerup&#125;
&gt;
  &lt;DragHandle position="nw" &#123;onresize&#125; &#123;onresizestart&#125; &#123;onresizeend&#125; /&gt;
  &lt;DragHandle position="ne" &#123;onresize&#125; &#123;onresizestart&#125; &#123;onresizeend&#125; /&gt;
  &lt;DragHandle position="sw" &#123;onresize&#125; &#123;onresizestart&#125; &#123;onresizeend&#125; /&gt;
  &lt;DragHandle position="se" &#123;onresize&#125; &#123;onresizestart&#125; &#123;onresizeend&#125; /&gt;
&lt;/div&gt;</code></pre>

<h2>Passing the custom stencil</h2>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; Cropper &#125; from '@we-are-singular/svelte-chop-chop';
  import MyStencil from './MyStencil.svelte';
&lt;/script&gt;

&lt;Cropper src="/photo.jpg" stencil=&#123;MyStencil&#125; /&gt;</code></pre>

<h2>CropOverlay</h2>

<p>
  Use the built-in <code>CropOverlay</code>
   component to render the dark semi-transparent overlay with a transparent cutout
  over the crop rect:
</p>

<pre><code>import &#123; CropOverlay &#125; from '@we-are-singular/svelte-chop-chop';

&lt;CropOverlay rect=&#123;rect&#125; imageBounds=&#123;imageBounds&#125; /&gt;</code></pre>

<h2>GridOverlay</h2>

<p>
  <code>GridOverlay</code>
   draws rule-of-thirds lines, a full grid, or a golden ratio guide:
</p>

<pre><code>import &#123; GridOverlay &#125; from '@we-are-singular/svelte-chop-chop';

&lt;GridOverlay
  &#123;cropRect&#125;
  type="rule-of-thirds"
  visible=&#123;grid &amp;&amp; (!gridOnlyActive || isDragging)&#125;
/&gt;</code></pre>
