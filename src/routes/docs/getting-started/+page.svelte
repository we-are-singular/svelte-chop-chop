<h1>Getting Started</h1>
<p class="lead">
  Install svelte-chop-chop and add image cropping to your Svelte 5 app in
  minutes.
</p>

<h2>Installation</h2>

<pre><code>npm install @we-are-singular/svelte-chop-chop</code></pre>

<h2>Peer dependencies</h2>

<p>Only Svelte 5 is required as a peer dependency:</p>

<pre><code>peerDependencies:
  svelte: "^5.0.0"</code></pre>

<h2>Basic cropper</h2>

<p>
  Import the <code>Cropper</code>
   component and pass it an image source:
</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; Cropper &#125; from '@we-are-singular/svelte-chop-chop';
  import '@we-are-singular/svelte-chop-chop/themes/default';

  let cropper = $state&lt;ReturnType&lt;typeof Cropper.create&gt;&gt;();

  async function crop() &#123;
    const blob = await cropper?.export(&#123; format: 'image/webp', quality: 0.9 &#125;);
    // use the blob...
  &#125;
&lt;/script&gt;

&lt;Cropper
  bind:this=&#123;cropper&#125;
  src="/photo.jpg"
  aspectRatio=&#123;1&#125;
/&gt;
&lt;button onclick=&#123;crop&#125;&gt;Crop&lt;/button&gt;</code></pre>

<h2>Full image editor</h2>

<p>
  The <code>ImageEditor</code>
   component bundles crop, filters, finetune, rotate, resize, frame and watermark
  panels:
</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; ImageEditor &#125; from '@we-are-singular/svelte-chop-chop';
  import &#123; pluginFilters &#125; from '@we-are-singular/svelte-chop-chop/plugins/filters';
  import &#123; pluginFinetune &#125; from '@we-are-singular/svelte-chop-chop/plugins/finetune';
  import &#123; pluginFrame &#125; from '@we-are-singular/svelte-chop-chop/plugins/frame';
  import &#123; pluginWatermark &#125; from '@we-are-singular/svelte-chop-chop/plugins/watermark';
  import &#123; pluginResize &#125; from '@we-are-singular/svelte-chop-chop/plugins/resize';
  import '@we-are-singular/svelte-chop-chop/themes/default';
&lt;/script&gt;

&lt;ImageEditor
  src="/photo.jpg"
  plugins=&#123;[pluginFilters(), pluginFinetune(), pluginFrame(), pluginWatermark(), pluginResize()]&#125;
  onexport=&#123;(blob) =&gt; console.log('exported', blob)&#125;
/&gt;</code></pre>

<h2>Headless composable</h2>

<p>
  Need full UI control? Use <code>createCropper</code>
   directly:
</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; createCropper &#125; from '@we-are-singular/svelte-chop-chop/headless';

  const cropper = createCropper(&#123;
    aspectRatio: 16 / 9,
    minWidth: 100,
    minHeight: 100,
  &#125;);
&lt;/script&gt;

&lt;div use:cropper.bindContainer class="my-container"&gt;
  &lt;img use:cropper.bindImage src="/photo.jpg" alt="" /&gt;
&lt;/div&gt;</code></pre>

<h2>CSS themes</h2>

<p>Three themes are included. Import exactly one:</p>

<pre><code>import '@we-are-singular/svelte-chop-chop/themes/default'; // recommended
import '@we-are-singular/svelte-chop-chop/themes/dark';
import '@we-are-singular/svelte-chop-chop/themes/minimal';</code></pre>

<h2>Next steps</h2>

<ul>
  <li><a href="/docs/cropper">Cropper component reference</a></li>
  <li><a href="/docs/image-editor">ImageEditor component reference</a></li>
  <li><a href="/docs/plugins">Plugins</a></li>
  <li><a href="/docs/theming">Theming</a></li>
  <li><a href="/demo">Live demo</a></li>
</ul>
