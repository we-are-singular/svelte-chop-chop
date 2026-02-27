<script lang="ts">
  import Toast from './Toast.svelte';

  let { children } = $props();
</script>

<div class="site">
  <header class="site-header">
    <div class="site-header-inner">
      <a href="/" class="site-logo" aria-label="svelte-chop-chop home">
        <span class="site-logo-icon">✂️</span>
        <span class="site-logo-text">svelte-chop-chop</span>
      </a>

      <nav class="site-nav" aria-label="Main navigation">
        <a href="/#demo" class="site-nav-link">Demo</a>
        <a href="/docs/getting-started" class="site-nav-link">Docs</a>
        <a
          href="https://github.com/we-are-singular/svelte-chop-chop"
          class="site-nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </nav>
    </div>
  </header>

  <main class="site-main">
    {@render children()}
  </main>
</div>

<Toast />

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  :global(html) {
    font-family: system-ui, sans-serif;
    background: #0f0f0f;
    color: #e8e8e8;
  }
  :global(body) {
    margin: 0;
  }
  :global(a) {
    color: #4a9eff;
    text-decoration: none;
  }
  :global(a:hover) {
    text-decoration: underline;
  }
  :global(pre) {
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1.25rem;
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #c9d1d9;
  }
  :global(code:not(pre code)) {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    padding: 0.15em 0.4em;
    font-size: 0.88em;
  }

  .site {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(15, 15, 15, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .site-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .site-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
    color: #fff;
    text-decoration: none;
    flex-shrink: 0;
  }

  .site-logo:hover {
    text-decoration: none;
    opacity: 0.85;
  }

  .site-logo-text {
    color: #e8e8e8;
  }

  .site-nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: auto;
  }

  .site-nav-link {
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    transition:
      color 0.15s,
      background 0.15s;
    text-decoration: none;
  }

  .site-nav-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.07);
    text-decoration: none;
  }

  .site-main {
    flex: 1;
  }
</style>
