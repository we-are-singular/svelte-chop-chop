<!-- Docs section — two-column sidebar layout -->
<script lang="ts">
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  const navLinks = [
    { href: '/docs/getting-started', label: 'Getting Started' },
    { href: '/docs/cropper', label: 'Cropper' },
    { href: '/docs/image-editor', label: 'ImageEditor' },
    { href: '/docs/plugins', label: 'Plugins' },
    { href: '/docs/custom-stencil', label: 'Custom Stencil' },
    { href: '/docs/theming', label: 'Theming' },
  ];

  const current = $derived($page.url.pathname);

  // --- Code block enhancement: syntax highlighting + copy button ---
  const KEYWORDS = /\b(import|export|from|const|let|var|function|async|await|return|if|else|new|type|interface|class|extends|typeof|null|true|false|void|undefined)\b/g;
  const STRINGS_RE = /(&#39;[^&#39;]*&#39;|&quot;[^&quot;]*&quot;|'[^']*'|"[^"]*")/g;
  const COMMENTS_RE = /(\/\/[^\n]*)/g;
  const TYPES_RE = /\b(string|number|boolean|HTMLCanvasElement|HTMLImageElement|HTMLElement|Blob|File|Rect|Point|Size|CropCoordinates|TransformState|FilterState|ExportResult|ExportOptions|ChopPlugin|PluginContext|Component|Snippet|ImageSource|AspectRatio|SizeConstraints|GridType|StencilProps|Error|Promise|void|WatermarkSettings|FrameSettings)\b/g;
  const HTML_TAGS_RE = /(&lt;\/?)([\w-]+)/g;
  const NUMBERS_RE = /\b(\d+\.?\d*)\b/g;

  function highlight(code: string): string {
    const strings: string[] = [];
    let result = code.replace(STRINGS_RE, (match) => {
      strings.push(`<span class="hl-str">${match}</span>`);
      return `__S${strings.length - 1}__`;
    });

    const comments: string[] = [];
    result = result.replace(COMMENTS_RE, (match) => {
      comments.push(`<span class="hl-cmt">${match}</span>`);
      return `__C${comments.length - 1}__`;
    });

    result = result.replace(HTML_TAGS_RE, (_, prefix, tag) =>
      `${prefix}<span class="hl-tag">${tag}</span>`
    );
    result = result.replace(TYPES_RE, '<span class="hl-typ">$1</span>');
    result = result.replace(KEYWORDS, '<span class="hl-kw">$1</span>');
    result = result.replace(NUMBERS_RE, '<span class="hl-num">$1</span>');

    comments.forEach((s, i) => { result = result.replace(`__C${i}__`, s); });
    strings.forEach((s, i) => { result = result.replace(`__S${i}__`, s); });

    return result;
  }

  let contentEl = $state<HTMLElement | undefined>();

  function enhanceCodeBlocks() {
    if (!contentEl) return;
    for (const pre of contentEl.querySelectorAll('pre')) {
      if (pre.querySelector('.copy-btn')) continue;
      const codeEl = pre.querySelector('code');
      if (!codeEl) continue;

      codeEl.innerHTML = highlight(codeEl.innerHTML);

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeEl.textContent ?? '');
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        } catch {
          btn.textContent = 'Failed';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }
      });

      pre.style.position = 'relative';
      pre.appendChild(btn);
    }
  }

  // Re-run enhancement whenever the page changes
  $effect(() => {
    // Track page path to re-run on navigation
    void $page.url.pathname;
    // Use tick to wait for DOM update
    requestAnimationFrame(enhanceCodeBlocks);
  });
</script>

<div class="docs-layout">
  <aside class="docs-sidebar">
    <nav aria-label="Documentation">
      {#each navLinks as link (link.href)}
        <a
          href={link.href}
          class="sidebar-link"
          class:active={current === link.href}
        >
          {link.label}
        </a>
      {/each}
    </nav>
  </aside>

  <main class="docs-main">
    <div class="docs-content" bind:this={contentEl}>
      {@render children()}
    </div>
  </main>
</div>

<style>
  .docs-layout {
    display: flex;
    min-height: calc(100vh - 57px); /* subtract header height */
    align-items: flex-start;
  }

  .docs-sidebar {
    width: 220px;
    flex-shrink: 0;
    position: sticky;
    top: 57px;
    height: calc(100vh - 57px);
    overflow-y: auto;
    padding: 1.75rem 1rem;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
  }

  .sidebar-link {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    margin-bottom: 0.15rem;
    transition: color 0.15s, background 0.15s;
  }

  .sidebar-link:hover,
  .sidebar-link.active {
    color: #fff;
    background: rgba(74, 158, 255, 0.12);
    text-decoration: none;
  }

  .sidebar-link.active {
    color: #4a9eff;
  }

  .docs-main {
    flex: 1;
    min-width: 0;
    padding: 2.5rem 2rem;
  }

  .docs-content {
    max-width: 780px;
  }

  /* Shared doc prose styles */
  .docs-content :global(h1) {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #fff;
  }

  .docs-content :global(.lead) {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
    margin: 0 0 2.5rem;
  }

  .docs-content :global(h2) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 2.5rem 0 0.75rem;
    padding-top: 2.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    color: #fff;
  }

  .docs-content :global(h2:first-of-type) {
    border-top: none;
    padding-top: 0;
  }

  .docs-content :global(h3) {
    font-size: 1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .docs-content :global(p) {
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.75;
    margin: 0 0 1rem;
  }

  .docs-content :global(ul),
  .docs-content :global(ol) {
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.75;
    margin: 0 0 1rem;
    padding-left: 1.5rem;
  }

  .docs-content :global(li) {
    margin-bottom: 0.35rem;
  }

  .docs-content :global(a) {
    color: #4a9eff;
  }

  .docs-content :global(code) {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.875em;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 4px;
    padding: 0.15em 0.35em;
    color: #e2c08d;
  }

  .docs-content :global(pre) {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 1.25rem;
    overflow-x: auto;
    margin: 1.25rem 0;
  }

  .docs-content :global(pre code) {
    background: none;
    padding: 0;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.875rem;
  }

  .docs-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.25rem 0;
    font-size: 0.9rem;
  }

  .docs-content :global(th) {
    text-align: left;
    padding: 0.6rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .docs-content :global(td) {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.65);
    vertical-align: top;
  }

  .docs-content :global(td code) {
    font-size: 0.82rem;
  }

  /* Copy button on code blocks */
  .docs-content :global(.copy-btn) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-family: inherit;
    cursor: pointer;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
    z-index: 2;
  }

  .docs-content :global(.copy-btn:hover) {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .docs-content :global(.copy-btn.copied) {
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.4);
  }

  /* Syntax highlighting */
  .docs-content :global(.hl-kw) { color: #c678dd; }
  .docs-content :global(.hl-str) { color: #98c379; }
  .docs-content :global(.hl-cmt) { color: rgba(255, 255, 255, 0.35); font-style: italic; }
  .docs-content :global(.hl-typ) { color: #e5c07b; }
  .docs-content :global(.hl-tag) { color: #e06c75; }
  .docs-content :global(.hl-num) { color: #d19a66; }
</style>
