<!-- Docs index — redirect to Getting Started -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    goto("/docs/getting-started", { replaceState: true });
  });
</script>

<div class="docs-index">
  <h1>Documentation</h1>
  <p class="lead">Redirecting to Getting Started…</p>
  <p>
    If you're not redirected, <a href="/docs/getting-started">click here</a>
    .
  </p>
  <ul class="doc-links">
    <li><a href="/docs/getting-started">Getting Started</a></li>
    <li><a href="/docs/cropper">Cropper</a></li>
    <li><a href="/docs/image-editor">ImageEditor</a></li>
    <li><a href="/docs/plugins">Plugins</a></li>
    <li><a href="/docs/custom-stencil">Custom Stencil</a></li>
    <li><a href="/docs/theming">Theming</a></li>
  </ul>
</div>

<style>
  .docs-index {
    padding: 2rem 0;
  }

  .docs-index h1 {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #fff;
  }

  .lead {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 1rem;
  }

  .doc-links {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
  }

  .doc-links li {
    margin-bottom: 0.5rem;
  }

  .doc-links a {
    color: #4a9eff;
  }
</style>
