<!--
  Toast notification overlay.
  Renders active toasts from the toast store.
-->
<script lang="ts">
  import { getToasts } from './toast.svelte.js';

  const toasts = $derived(getToasts());
</script>

{#if toasts.length > 0}
  <div class="toast-container" aria-live="polite">
    {#each toasts as t (t.id)}
      <div class="toast toast-{t.type}" role="alert">
        {t.message}
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #fff;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: toast-in 0.25s ease-out;
    pointer-events: auto;
  }

  .toast-success {
    background: rgba(34, 197, 94, 0.9);
  }

  .toast-error {
    background: rgba(239, 68, 68, 0.9);
  }

  .toast-info {
    background: rgba(74, 158, 255, 0.9);
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
