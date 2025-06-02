<script>
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition'; // Importar transição do Svelte

  export let toasts = [];
  export let removeToast = (id) => {};

  // Exibe apenas o primeiro toast da fila
  $: currentToast = toasts.length > 0 ? toasts[0] : null;

  let autoDismissTimer;

  // Reativo para gerenciar o auto-dismiss do toast atual
  $: {
    clearTimeout(autoDismissTimer); // Limpa o timer anterior sempre que currentToast muda
    if (currentToast) {
      autoDismissTimer = setTimeout(() => {
        // Quando o timer expira, chama a função removeToast do pai.
        // Isso fará com que currentToast mude (para o próximo toast ou para null).
        // O Svelte então verá o elemento "keyeado" mudar/desaparecer,
        // disparando sua transição 'out'.
        if (currentToast) { // Verifica novamente, pois currentToast pode ter mudado
            removeToast(currentToast.id);
        }
      }, currentToast.duration || 3000);
    }
  }

  onDestroy(() => {
    clearTimeout(autoDismissTimer);
  });
</script>

<div id="toast-container" aria-live="assertive">
  {#if currentToast}
    <div
      class="toast {currentToast.type}"
      role="alert"
      aria-live="assertive"
      key={currentToast.id}
      transition:fly={{ y: -60, duration: 300 }}
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
  z-index: 1050; /* Acima de modals comuns (Bootstrap usa 1040/1050) */
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