<script lang="ts">
  import { ImageEditor } from "$lib";
  import { pluginFilters } from "$lib/plugins/plugin-filters.js";
  import { pluginFinetune } from "$lib/plugins/plugin-finetune.js";
  import { pluginFrame } from "$lib/plugins/plugin-frame.js";
  import { pluginWatermark } from "$lib/plugins/plugin-watermark.js";
  import "$lib/themes/default.css";

  import type { ExportResult } from "$lib";
  import { toast } from "./toast.svelte.js";

  const allPlugins = [
    pluginFilters(),
    pluginFinetune(),
    pluginFrame(),
    pluginWatermark(),
  ];

  let lastExportUrl = $state<string | null>(null);

  function handleExport(result: ExportResult) {
    if (result.blob) {
      if (lastExportUrl) URL.revokeObjectURL(lastExportUrl);
      lastExportUrl = URL.createObjectURL(result.blob);
      const kb = (result.blob.size / 1024).toFixed(1);
      toast(`Exported successfully (${kb} KB)`, 'success');
    }
  }

  const features = [
    {
      icon: "✂️",
      name: "Flexible cropping",
      desc: "Free crop, fixed ratios, size constraints, crop-outside-image. Keyboard and touch ready.",
    },
    {
      icon: "🎨",
      name: "17+ filter presets",
      desc: "Instagram-style color matrix filters: Clarendon, Moon, Lark, Chrome and more.",
    },
    {
      icon: "🎚️",
      name: "Finetune controls",
      desc: "Brightness, contrast, saturation, exposure, temperature, clarity and gamma sliders.",
    },
    {
      icon: "🔄",
      name: "Image transforms",
      desc: "Rotate, flip horizontal/vertical, zoom and pan with canvas preview and full export.",
    },
    {
      icon: "🖼️",
      name: "Frames & watermarks",
      desc: "Decorative frame overlays (solid, line, hook) and text watermarks applied at export.",
    },
    {
      icon: "🔌",
      name: "Plugin architecture",
      desc: "Register toolbar actions, panels, keyboard shortcuts and canvas post-processors.",
    },
    {
      icon: "🧩",
      name: "Headless composables",
      desc: "Full control with createCropper and createImageEditor — bring your own UI.",
    },
    {
      icon: "0️⃣",
      name: "Zero dependencies",
      desc: "No runtime npm deps. Only peerDep is svelte ^5. Keep your bundle lean.",
    },
    {
      icon: "🏷️",
      name: "TypeScript-first",
      desc: "Fully typed public API. Strict tsconfig. JSDoc on every exported symbol.",
    },
  ] as const;
</script>

<!-- svelte-chop-chop — Landing page with live demo -->
<svelte:head>
  <title>svelte-chop-chop — Image editor SDK for Svelte 5</title>
  <meta
    name="description"
    content="Open-source image editor SDK for Svelte 5. Crop, rotate, filter, and export images with a modular plugin architecture."
  />
</svelte:head>

<section class="hero">
  <div class="hero-inner">
    <div class="hero-badges">
      <span class="hero-badge">Svelte 5 · TypeScript · Zero dependencies</span>
      <span
        class="hero-badge hero-badge-size"
        title="Core cropper &lt; 12KB gzipped, full editor &lt; 30KB gzipped"
      >
        📦 &lt; 30KB gzipped
      </span>
    </div>
    <h1 class="hero-title">
      Image editing,
      <br />
      the Svelte way.
    </h1>
    <p class="hero-desc">
      svelte-chop-chop is an open-source image editor SDK for Svelte 5. Crop,
      rotate, flip, apply filters and export — all with a clean headless
      composable API and ready-to-use components.
    </p>
    <div class="hero-actions">
      <a href="/docs/getting-started" class="btn btn-primary">Get Started</a>
      <a href="#demo" class="btn btn-secondary">Try it below</a>
    </div>
  </div>
</section>

<!-- Live demo -->
<section class="demo-section" id="demo">
  <!-- Blurred background image matching the demo image -->
  <div class="demo-bg" aria-hidden="true"></div>

  <div class="section-inner">
    <h2 class="section-title">Try it live</h2>
    <p class="demo-intro">
      Crop, rotate, apply filters, add a watermark or frame — then hit
      <strong>Done</strong> to export.
    </p>
  </div>

  <div class="demo-stage">
    <div class="demo-editor">
      <ImageEditor
        src="https://picsum.photos/id/10/900/600"
        plugins={allPlugins}
        style="height: 600px; width: 100%;"
        onexport={handleExport}
      />
    </div>
    {#if lastExportUrl}
      <div class="export-result">
        <h3>Export result</h3>
        <img src={lastExportUrl} alt="Exported result" class="export-img" />
        <a
          href={lastExportUrl}
          download="svelte-chop-chop-export.jpg"
          class="btn btn-primary btn-sm"
        >
          ↓ Download
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Features grid -->
<section class="features">
  <div class="section-inner">
    <h2 class="section-title">Everything you need</h2>
    <div class="feature-grid">
      {#each features as f (f.name)}
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">{f.icon}</div>
          <h3 class="feature-name">{f.name}</h3>
          <p class="feature-desc">{f.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="section-inner cta-inner">
    <h2 class="section-title">Ready to start?</h2>
    <p class="cta-desc">Install in seconds. No configuration required.</p>
    <div class="hero-actions">
      <a href="/docs/getting-started" class="btn btn-primary">
        Read the docs →
      </a>
      <a
        href="https://github.com/we-are-singular/svelte-chop-chop"
        class="btn btn-secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub
      </a>
    </div>
  </div>
</section>

<footer class="site-footer">
  <p>MIT License · Built with Svelte 5</p>
</footer>

<style>
  /* ── Hero ────────────────────────────────────────────────── */
  .hero {
    padding: 4rem 1.5rem 3rem;
    background: radial-gradient(
      ellipse at 60% 0%,
      rgba(74, 158, 255, 0.12) 0%,
      transparent 70%
    );
  }

  .hero-inner {
    max-width: 760px;
    margin: 0 auto;
    text-align: center;
  }

  .hero-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .hero-badge {
    display: inline-block;
    padding: 0.3rem 0.9rem;
    background: rgba(74, 158, 255, 0.12);
    border: 1px solid rgba(74, 158, 255, 0.3);
    border-radius: 100px;
    font-size: 0.8rem;
    color: #4a9eff;
    letter-spacing: 0.03em;
  }

  .hero-badge-size {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.4);
    color: #22c55e;
  }

  .hero-title {
    font-size: clamp(2.25rem, 6vw, 3.75rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin: 0 0 1.25rem;
    color: #fff;
  }

  .hero-desc {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
    margin: 0 auto 2rem;
    max-width: 600px;
  }

  .hero-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── Demo section ────────────────────────────────────────── */
  .demo-section {
    position: relative;
    background: #1e1e1e;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    padding: 3rem 0 0;
    overflow: hidden;
  }

  .demo-section .section-inner {
    position: relative;
    z-index: 1;
    padding: 0 1.5rem;
  }

  .demo-bg {
    position: absolute;
    inset: -60px;
    background-image: url('https://picsum.photos/id/10/900/600');
    background-size: cover;
    background-position: center;
    filter: blur(50px);
    opacity: 0.1;
    pointer-events: none;
    z-index: 0;
  }

  .demo-intro {
    text-align: center;
    color: rgba(255, 255, 255, 0.55);
    font-size: 1rem;
    max-width: 640px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }

  .demo-intro strong {
    color: rgba(255, 255, 255, 0.9);
  }

  .demo-stage {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0 1.5rem 3rem;
  }

  .demo-editor {
    flex-shrink: 0;
    width: 900px;
    max-width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.06),
      0 24px 80px rgba(0, 0, 0, 0.6);
  }

  .export-result {
    flex-shrink: 0;
    width: 200px;
    text-align: center;
  }

  .export-result h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 0.5rem;
  }

  .export-img {
    display: block;
    width: 100%;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.75rem;
  }

  .btn-sm {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }

  /* ── Buttons ─────────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.65rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition:
      opacity 0.15s,
      transform 0.1s;
  }

  .btn:hover {
    opacity: 0.85;
    transform: translateY(-1px);
    text-decoration: none;
  }

  .btn-primary {
    background: #4a9eff;
    color: #fff;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  /* ── Sections ────────────────────────────────────────────── */
  .features {
    padding: 4rem 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .cta-section {
    padding: 4rem 1.5rem;
  }

  .section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .cta-inner {
    text-align: center;
  }

  .cta-desc {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.75rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 2.5rem;
    color: #fff;
  }

  /* ── Feature grid ────────────────────────────────────────── */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.5rem;
    transition: border-color 0.15s;
  }

  .feature-card:hover {
    border-color: rgba(74, 158, 255, 0.35);
  }

  .feature-icon {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
    line-height: 1;
  }

  .feature-name {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    margin: 0 0 0.5rem;
  }

  .feature-desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.65;
    margin: 0;
  }

  /* ── Footer ──────────────────────────────────────────────── */
  .site-footer {
    padding: 2rem 1.5rem;
    text-align: center;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
</style>
