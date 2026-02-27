<!--
  Code block with svelte-highlight (HighlightSvelte) and copy button.
  Uses highlight.js for proper Svelte/HTML/TS syntax highlighting.
-->
<script lang="ts">
  import { HighlightSvelte } from "svelte-highlight";

  let { code }: { code: string } = $props();

  let btnEl: HTMLButtonElement | undefined;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      if (btnEl) {
        btnEl.textContent = "Copied!";
        btnEl.classList.add("copied");
        setTimeout(() => {
          if (btnEl) {
            btnEl.textContent = "Copy";
            btnEl.classList.remove("copied");
          }
        }, 2000);
      }
    } catch {
      if (btnEl) {
        btnEl.textContent = "Failed";
        setTimeout(() => {
          if (btnEl) btnEl.textContent = "Copy";
        }, 2000);
      }
    }
  }
</script>

<div class="code-block">
  <HighlightSvelte {code} />
  <button
    bind:this={btnEl}
    type="button"
    class="copy-btn"
    onclick={copyCode}
    aria-label="Copy code to clipboard"
  >
    Copy
  </button>
</div>

<style>
  .code-block {
    position: relative;
    margin: 1.25rem 0;
  }

  .code-block :global(pre) {
    margin: 0;
    padding: 1.25rem;
    padding-right: 4rem;
  }

  .copy-btn {
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

  .copy-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .copy-btn.copied {
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.4);
  }
</style>
