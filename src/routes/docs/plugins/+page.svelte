<h1>Plugins</h1>
<p class="lead">
  Plugins extend the <code>ImageEditor</code> by registering toolbar tabs, panels, keyboard
  shortcuts, filter presets, and canvas post-processors.
</p>

<h2>Built-in plugins</h2>

<h3>pluginFilters</h3>
<p>
  Import: <code>svelte-chop-chop/plugins/filters</code><br/>
  Registers a <strong>Filters</strong> tab with 17 Instagram-style color matrix presets:
  Original, Clarendon, Gingham, Moon, Lark, Reyes, Juno, Slumber, Crema, Ludwig, Aden,
  Perpetua, Mayfair, Rise, Hudson, Valencia and X-Pro II.
</p>

<h3>pluginFinetune</h3>
<p>
  Import: <code>svelte-chop-chop/plugins/finetune</code><br/>
  Registers a <strong>Finetune</strong> tab with 7 adjustment sliders:
  Brightness, Contrast, Saturation, Exposure, Temperature, Clarity and Gamma.
</p>

<h3>pluginFrame</h3>
<p>
  Import: <code>svelte-chop-chop/plugins/frame</code><br/>
  Registers a <strong>Frame</strong> tab to add decorative borders at export time.
  Frame styles: <em>none</em>, <em>solid</em>, <em>line</em>, and <em>hook</em>.
  Configurable color and width.
</p>

<h3>pluginWatermark</h3>
<p>
  Import: <code>svelte-chop-chop/plugins/watermark</code><br/>
  Registers a <strong>Watermark</strong> tab to add text overlays at export time.
  Positions: top-left, top-center, top-right, center, bottom-left, bottom-center, bottom-right.
  Configurable text, color, font size, and opacity.
</p>

<h3>pluginResize</h3>
<p>
  Import: <code>svelte-chop-chop/plugins/resize</code><br/>
  Registers a <strong>Resize</strong> tab for setting a target export resolution.
</p>

<h2>Plugin API</h2>

<p>
  A plugin is an object with a <code>setup(ctx: PluginContext)</code> method.
  The context provides everything needed to hook into the editor:
</p>

<pre><code>import type &#123; ChopPlugin, PluginContext &#125; from '@we-are-singular/svelte-chop-chop';

export const myPlugin: ChopPlugin = &#123;
  setup(ctx: PluginContext) &#123;
    // Register a toolbar tab
    ctx.registerAction(&#123;
      id: 'my-tab',
      label: 'My Tool',
      icon: '🛠️',
      panel: MyPanel,     // Svelte 5 component
    &#125;);

    // Add logic that runs after image export
    ctx.registerPostProcessor(async (canvasCtx, canvas) =&gt; &#123;
      // draw on canvasCtx / canvas before encoding
    &#125;);

    // Register filter presets
    ctx.registerFilterPresets([
      &#123; name: 'Vintage', matrix: [...] &#125;,
    &#125;]);
  &#125;,
&#125;;
</code></pre>

<h2>PluginContext reference</h2>

<table>
  <thead>
    <tr><th>Method</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><code>registerAction(action)</code></td>
      <td>Adds a tab button + panel to the toolbar.</td>
    </tr>
    <tr>
      <td><code>registerPostProcessor(fn)</code></td>
      <td>Runs <code>fn(ctx2d, canvas)</code> on the export canvas after filters.</td>
    </tr>
    <tr>
      <td><code>registerFilterPresets(presets)</code></td>
      <td>Adds named color-matrix presets to the <code>FilterStrip</code>.</td>
    </tr>
    <tr>
      <td><code>editor</code></td>
      <td>The full <code>ImageEditorReturn</code> state object.</td>
    </tr>
  </tbody>
</table>

<h2>Using plugins</h2>

<pre><code>&lt;ImageEditor
  src="/photo.jpg"
  plugins=&#123;[pluginFilters(), pluginFinetune(), pluginResize()]&#125;
/&gt;</code></pre>

<p>Plugins are applied in array order. Each plugin's tabs appear in the toolbar left to right.</p>
