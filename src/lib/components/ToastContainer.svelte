<script>
  import { onDestroy } from 'svelte';
  import Toast from './Toast.svelte';

  export let toasts = [];
  export let removeToast = (id) => {};

  // Remove toast automaticamente após a duração
  let timers = {};

  $: {
    // Para cada toast novo, inicia um timer se não existir
    toasts.forEach(toast => {
      if (!timers[toast.id]) {
        timers[toast.id] = setTimeout(() => {
          removeToast(toast.id);
          delete timers[toast.id];
        }, toast.duration || 3000);
      }
    });
  }

  // Limpa timers ao destruir componente
  onDestroy(() => {
    Object.values(timers).forEach(clearTimeout);
  });
</script>

<div id="toast-container" aria-live="assertive">
  {#each toasts as toast (toast.id)}
    <Toast
      id={toast.id}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      on:remove={() => removeToast(toast.id)}
    />
  {/each}
</div>

<style>
#toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%; /* Garante que ocupe a largura total */

  /* Sem animações de transição (mantido) */
  transition: none;

  /* Garante que fique acima de outros elementos (mantido) */
  z-index: 1000;

  /* Altura e padding para torná-lo discreto */
  height: auto; /* Altura baseada no conteúdo */
  padding: 3px 5px; /* <-- Padding mais estreito */
  box-sizing: border-box; /* Mantido para width: 100% */

  /* Sombra discreta */
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2); /* <-- Sombra discreta de 3px */

  /* Estilos de aparência (ajuste para ser discreto, mantidos ou ajustados levemente) */
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  font-size: 0.9em;
  border-radius: 0;

  /* Garante visibilidade (mantido) */
  display: block;
  visibility: visible;
  opacity: 1;
}
</style>