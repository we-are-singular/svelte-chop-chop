<h1>Theming</h1>
<p class="lead">
  svelte-chop-chop uses CSS custom properties for theming. Import a built-in theme
  or override individual variables to match your brand.
</p>

<h2>Built-in themes</h2>

<p>Import exactly one theme in your app entry point or layout:</p>

<pre><code>// Default (dark blue-grey)
import 'svelte-chop-chop/themes/default';

// Pure dark
import 'svelte-chop-chop/themes/dark';

// Minimal (no chrome, white overlay)
import 'svelte-chop-chop/themes/minimal';</code></pre>

<h2>CSS custom properties reference</h2>

<h3>Base</h3>

<table>
  <thead>
    <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--chop-bg</code></td><td><code>#1a1a2e</code></td><td>Editor background.</td></tr>
    <tr><td><code>--chop-surface</code></td><td><code>#16213e</code></td><td>Toolbar and panel surface.</td></tr>
    <tr><td><code>--chop-border</code></td><td><code>rgba(255,255,255,0.08)</code></td><td>Divider and border color.</td></tr>
    <tr><td><code>--chop-radius</code></td><td><code>8px</code></td><td>General border radius.</td></tr>
    <tr><td><code>--chop-font</code></td><td><code>system-ui, sans-serif</code></td><td>Font family.</td></tr>
  </tbody>
</table>

<h3>Typography</h3>

<table>
  <thead>
    <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--chop-text</code></td><td><code>rgba(255,255,255,0.87)</code></td><td>Primary text color.</td></tr>
    <tr><td><code>--chop-text-muted</code></td><td><code>rgba(255,255,255,0.5)</code></td><td>Secondary/muted text.</td></tr>
    <tr><td><code>--chop-text-xs</code></td><td><code>0.7rem</code></td><td>Extra-small font size (labels).</td></tr>
  </tbody>
</table>

<h3>Stencil</h3>

<table>
  <thead>
    <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--chop-stencil-border</code></td><td><code>rgba(255,255,255,0.8)</code></td><td>Stencil border color.</td></tr>
    <tr><td><code>--chop-stencil-border-width</code></td><td><code>1.5px</code></td><td>Stencil border thickness.</td></tr>
    <tr><td><code>--chop-overlay-bg</code></td><td><code>rgba(0,0,0,0.55)</code></td><td>Dark overlay outside stencil.</td></tr>
    <tr><td><code>--chop-handle-size</code></td><td><code>14px</code></td><td>Drag handle hit area.</td></tr>
    <tr><td><code>--chop-handle-color</code></td><td><code>#fff</code></td><td>Drag handle visual color.</td></tr>
    <tr><td><code>--chop-grid-color</code></td><td><code>rgba(255,255,255,0.3)</code></td><td>Rule-of-thirds grid lines.</td></tr>
  </tbody>
</table>

<h3>Toolbar &amp; panels</h3>

<table>
  <thead>
    <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--chop-toolbar-height</code></td><td><code>48px</code></td><td>Tab bar height.</td></tr>
    <tr><td><code>--chop-panel-height</code></td><td><code>100px</code></td><td>Panel strip height.</td></tr>
    <tr><td><code>--chop-accent</code></td><td><code>#4a9eff</code></td><td>Active tab / accent color.</td></tr>
    <tr><td><code>--chop-tab-color</code></td><td><code>rgba(255,255,255,0.5)</code></td><td>Inactive tab color.</td></tr>
    <tr><td><code>--chop-tab-active-color</code></td><td><code>#4a9eff</code></td><td>Active tab color.</td></tr>
  </tbody>
</table>

<h3>Slider</h3>

<table>
  <thead>
    <tr><th>Variable</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--chop-slider-track</code></td><td><code>rgba(255,255,255,0.15)</code></td><td>Slider track background.</td></tr>
    <tr><td><code>--chop-slider-fill</code></td><td><code>#4a9eff</code></td><td>Slider fill color.</td></tr>
    <tr><td><code>--chop-slider-thumb</code></td><td><code>#fff</code></td><td>Slider thumb color.</td></tr>
  </tbody>
</table>

<h2>Custom theme example</h2>

<p>Override variables in your global CSS to create a custom theme:</p>

<pre><code>/* my-theme.css */
:root &#123;
  --chop-bg: #0d0d0d;
  --chop-surface: #1a1a1a;
  --chop-accent: #ff6b35;
  --chop-tab-active-color: #ff6b35;
  --chop-slider-fill: #ff6b35;
  --chop-handle-color: #ff6b35;
  --chop-stencil-border: rgba(255, 107, 53, 0.8);
&#125;</code></pre>

<p>Import it after the base theme:</p>

<pre><code>import 'svelte-chop-chop/themes/dark';
import './my-theme.css';</code></pre>
