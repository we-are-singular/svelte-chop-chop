<!-- Docs section — two-column sidebar layout -->
<script lang="ts">
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";
  import "svelte-highlight/styles/github-dark.css";
  import hljs from "highlight.js/lib/core";
  import xml from "highlight.js/lib/languages/xml";
  import javascript from "highlight.js/lib/languages/javascript";
  import bash from "highlight.js/lib/languages/bash";

  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("bash", bash);

  let { children }: { children: Snippet } = $props();

  const BASE_URL = "https://svelte-chop-chop.pages.dev";
  const canonicalUrl = $derived(
    `${BASE_URL}${$page.url.pathname}`.replace(/\/$/, "") || `${BASE_URL}/`,
  );

  const navLinks = [
    { href: "/docs/getting-started", label: "Getting Started" },
    { href: "/docs/cropper", label: "Cropper" },
    { href: "/docs/image-editor", label: "ImageEditor" },
    { href: "/docs/plugins", label: "Plugins" },
    { href: "/docs/custom-stencil", label: "Custom Stencil" },
    { href: "/docs/theming", label: "Theming" },
  ];

  const current = $derived($page.url.pathname);

  function detectLanguage(code: string): string {
    if (/^npm install|^pnpm |^yarn |^bun /.test(code.trim())) return "bash";
    if (/^peerDependencies:/.test(code.trim())) return "bash";
    return "xml"; // Svelte/HTML/TS mix
  }

  let contentEl = $state<HTMLElement | undefined>();

  function enhanceCodeBlocks() {
    if (!contentEl) return;
    for (const pre of contentEl.querySelectorAll("pre")) {
      if (pre.closest(".code-block")) continue; // Skip CodeBlock (uses HighlightSvelte)
      if (pre.querySelector(".copy-btn")) continue;
      const codeEl = pre.querySelector("code");
      if (!codeEl) continue;

      const rawCode = codeEl.textContent ?? "";
      const lang = detectLanguage(rawCode);
      try {
        codeEl.innerHTML = hljs.highlight(rawCode, { language: lang }).value;
      } catch {
        codeEl.textContent = rawCode;
      }
      codeEl.classList.add("hljs");

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(rawCode);
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 2000);
        } catch {
          btn.textContent = "Failed";
          setTimeout(() => (btn.textContent = "Copy"), 2000);
        }
      });

      pre.style.position = "relative";
      pre.appendChild(btn);
    }
  }

  $effect(() => {
    void $page.url.pathname;
    requestAnimationFrame(enhanceCodeBlocks);
  });
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:url" content={canonicalUrl} />
</svelte:head>

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
    transition:
      color 0.15s,
      background 0.15s;
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
    width: 100%;
    margin: 0 auto;
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
    font-family: "Fira Code", "Cascadia Code", monospace;
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
    transition:
      color 0.15s,
      background 0.15s,
      border-color 0.15s;
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

  /* Syntax highlighting via svelte-highlight / highlight.js (github-dark theme) */
</style>
