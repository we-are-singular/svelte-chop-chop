<!--
  Reusable live example block for docs.
  Renders a live demo + code block with the exact code used.
  Uses svelte-highlight for proper syntax highlighting.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import CodeBlock from "./CodeBlock.svelte";

  let {
    demo,
    code,
    title = "Live example",
  }: {
    demo: Snippet;
    code: string;
    title?: string;
  } = $props();
</script>

<div class="live-example">
  <h3 class="live-example-title">{title}</h3>
  <div class="live-example-demo">
    {@render demo()}
  </div>
  <CodeBlock {code} />
</div>

<style>
  .live-example {
    margin: 2rem 0;
    padding: 1.5rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .live-example-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 1rem;
  }

  .live-example-demo {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.25);
    margin-bottom: 1rem;
  }

  .live-example-demo :global(.chop-editor),
  .live-example-demo :global(.chop-cropper) {
    min-height: 280px;
  }
</style>
