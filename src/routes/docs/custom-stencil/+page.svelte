<h1>Custom Stencil</h1>
<p class="lead">
  The stencil is the draggable, resizable overlay that marks the crop area.
  You can write your own stencil component by following the stencil contract.
</p>

<h2>Stencil contract</h2>

<p>A stencil component receives these props from the cropper engine:</p>

<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cropRect</code></td>
      <td><code>Rect</code></td>
      <td>Current crop rect in viewport pixels: <code>&#123; x, y, width, height &#125;</code>.</td>
    </tr>
    <tr>
      <td><code>onmove</code></td>
      <td><code>(dx: number, dy: number) =&gt; void</code></td>
      <td>Call with pixel delta to move the stencil.</td>
    </tr>
    <tr>
      <td><code>onresize</code></td>
      <td><code>(delta: ResizeDelta) =&gt; void</code></td>
      <td>Call with a resize delta object to resize from a handle.</td>
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

<h2>ResizeDelta</h2>

<pre><code>interface ResizeDelta &#123;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
&#125;</code></pre>

<h2>Using DragHandle</h2>

<p>
  The built-in <code>DragHandle</code> component handles pointer events and emits resize deltas.
  Use it for the corner and edge handles of your stencil:
</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; DragHandle &#125; from 'svelte-chop-chop';
  import type &#123; StencilProps &#125; from 'svelte-chop-chop';

  let &#123; cropRect, onmove, onresize, grid, gridOnlyActive &#125;: StencilProps = $props();
&lt;/script&gt;

&lt;!-- Position stencil over crop rect --&gt;
&lt;div
  class="my-stencil"
  style="left:&#123;cropRect.x&#125;px; top:&#123;cropRect.y&#125;px;
         width:&#123;cropRect.width&#125;px; height:&#123;cropRect.height&#125;px"
  role="region"
  aria-label="Crop area"
&gt;
  &lt;!-- Corner handles --&gt;
  &lt;DragHandle direction="nw" &#123;onresize&#125; /&gt;
  &lt;DragHandle direction="ne" &#123;onresize&#125; /&gt;
  &lt;DragHandle direction="sw" &#123;onresize&#125; /&gt;
  &lt;DragHandle direction="se" &#123;onresize&#125; /&gt;

  &lt;!-- Move area --&gt;
  &lt;div
    class="my-stencil-move"
    onpointerdown=&#123;(e) =&gt; &#123;
      // implement drag to move
    &#125;&#125;
  /&gt;
&lt;/div&gt;</code></pre>

<h2>Passing the custom stencil</h2>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; Cropper &#125; from 'svelte-chop-chop';
  import MyStencil from './MyStencil.svelte';
&lt;/script&gt;

&lt;Cropper src="/photo.jpg" stencil=&#123;MyStencil&#125; /&gt;</code></pre>

<h2>CropOverlay</h2>

<p>
  Use the built-in <code>CropOverlay</code> component to render the dark semi-transparent
  overlay with a transparent cutout over the crop rect:
</p>

<pre><code>import &#123; CropOverlay &#125; from 'svelte-chop-chop';

&lt;CropOverlay &#123;cropRect&#125; containerRect=&#123;...&#125; /&gt;</code></pre>

<h2>GridOverlay</h2>

<p>
  <code>GridOverlay</code> draws rule-of-thirds lines, a full grid, or a golden ratio guide:
</p>

<pre><code>import &#123; GridOverlay &#125; from 'svelte-chop-chop';

&lt;GridOverlay
  &#123;cropRect&#125;
  type="rule-of-thirds"
  visible=&#123;grid &amp;&amp; (!gridOnlyActive || isDragging)&#125;
/&gt;</code></pre>
