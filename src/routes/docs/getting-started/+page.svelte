<script lang="ts">
  import { Cropper, ImageEditor } from "$lib";
  import { pluginFilters } from "$lib/plugins/plugin-filters.js";
  import { pluginFinetune } from "$lib/plugins/plugin-finetune.js";
  import { pluginFrame } from "$lib/plugins/plugin-frame.js";
  import { pluginWatermark } from "$lib/plugins/plugin-watermark.js";
  import { pluginResize } from "$lib/plugins/plugin-resize.js";
  import "$lib/themes/default.css";
  import DocLiveExample from "../DocLiveExample.svelte";
</script>

<svelte:head>
  <title>Getting Started — svelte-chop-chop</title>
  <meta
    name="description"
    content="Install svelte-chop-chop and add image cropping to your Svelte 5 app in minutes. Basic cropper, full editor, headless composable."
  />
</svelte:head>

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
  component and pass it an image source. Use the
  <code>toolbar</code>
   snippet to add an export button:
</p>

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

<DocLiveExample
  title="Basic Cropper"
  code={`<script lang="ts">
  import { Cropper } from '@we-are-singular/svelte-chop-chop';
  import '@we-are-singular/svelte-chop-chop/themes/default';
</script>

{#snippet cropToolbar(cropper)}
  <button onclick={async () => {
    const result = await cropper.export({ format: 'image/webp', quality: 0.9 });
    if (result.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cropped.webp';
      a.click();
    }
  }}>Crop</button>
{/snippet}

<Cropper src="/photo.jpg" aspectRatio={1} toolbar={cropToolbar} />`}
>
  {#snippet demo()}
    <Cropper
      src="https://picsum.photos/id/10/800/600"
      aspectRatio={1}
      style="height: 280px; width: 100%;"
      toolbar={cropToolbar}
    />
  {/snippet}
</DocLiveExample>

<h2>Full image editor</h2>

<p>
  The <code>ImageEditor</code>
   component bundles crop, filters, finetune, rotate, resize, frame and watermark
  panels:
</p>

<DocLiveExample
  title="Full ImageEditor with all plugins"
  code={`<script lang="ts">
  import { ImageEditor } from '@we-are-singular/svelte-chop-chop';
  import { pluginFilters } from '@we-are-singular/svelte-chop-chop/plugins/filters';
  import { pluginFinetune } from '@we-are-singular/svelte-chop-chop/plugins/finetune';
  import { pluginFrame } from '@we-are-singular/svelte-chop-chop/plugins/frame';
  import { pluginWatermark } from '@we-are-singular/svelte-chop-chop/plugins/watermark';
  import { pluginResize } from '@we-are-singular/svelte-chop-chop/plugins/resize';
  import '@we-are-singular/svelte-chop-chop/themes/default';
</script>

<ImageEditor
  src="/photo.jpg"
  plugins={[pluginFilters(), pluginFinetune(), pluginFrame(), pluginWatermark(), pluginResize()]}
  onexport={(result) => console.log('exported', result.blob)}
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

<h2>Headless composable</h2>

<p>
  Need full UI control? Use <code>createCropper</code>
  from the headless export. Bind the container and canvas via
  <code>$effect</code>
  :
</p>

<pre><code>&lt;script lang="ts"&gt;
  import &#123; createCropper &#125; from '@we-are-singular/svelte-chop-chop/headless';

  const cropper = createCropper(&#123;
    src: 'https://example.com/photo.jpg',
    aspectRatio: 16 / 9,
  &#125;);

  let containerEl: HTMLElement | undefined;
  let canvasEl: HTMLCanvasElement | undefined;

  $effect(() => &#123;
    if (containerEl) cropper.bindContainer(containerEl);
    if (canvasEl) cropper.bindCanvas(canvasEl);
    return () => cropper.destroy();
  &#125;);
&lt;/script&gt;

&lt;div bind:this=&#123;containerEl&#125; class="my-container" style="height: 300px;"&gt;
  &lt;canvas bind:this=&#123;canvasEl&#125;&gt;&lt;/canvas&gt;
  &lt;!-- Render your own stencil using cropper.stencilProps --&gt;
&lt;/div&gt;</code></pre>

<p>
  See <a href="/docs/cropper">Cropper</a>
  and
  <a href="/docs/custom-stencil">Custom Stencil</a>
   for details.
</p>

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
