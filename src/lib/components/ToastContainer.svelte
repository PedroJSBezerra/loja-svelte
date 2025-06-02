<script>
  import { onDestroy, tick } from 'svelte';

  export let toasts = [];
  export let removeToast = (id) => {};

  // Exibe apenas o primeiro toast da fila
  $: currentToast = toasts.length > 0 ? toasts[0] : null;

  let visible = false;
  let timer;

  // Sempre que o toast muda, faz animação de entrada e inicia timer
  $: if (currentToast) {
    showToast();
  } else {
    visible = false;
    clearTimeout(timer);
  }

  async function showToast() {
    visible = false;
    clearTimeout(timer);
    await tick();
    visible = true;
    timer = setTimeout(() => {
      startRemove(currentToast.id);
    }, currentToast.duration || 3000);
  }

  function startRemove(id) {
    visible = false;
    setTimeout(() => {
      removeToast(id);
    }, 300); // tempo da transição CSS
  }

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<div id="toast-container" aria-live="assertive">
  {#if currentToast}
    <div
      class="toast {currentToast.type} {visible ? 'visible' : ''}"
      role="alert"
      aria-live="assertive"
    >
      <i class="fas {currentToast.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
      <span>{currentToast.message}</span>
    </div>
  {/if}
</div>

<style>
#toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  position: relative;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  min-width: 250px;
  max-width: 400px;
  background-color: var(--toast-default-bg, #333);
  border: none;
  outline: none;
  font: inherit;
  text-align: left;
}
.toast.visible {
  opacity: 1;
  transform: translateY(0);
}
.toast.success {
  background-color: var(--success-color, #28a745);
}
.toast.error {
  background-color: var(--error-color, #dc3545);
}
.toast i {
  font-size: 1.2em;
}
.toast span {
  flex-grow: 1;
}
</style>