<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let message = '';
  export let type = 'success'; // 'success' or 'error'
  export let duration = 3000;
  export let id = Symbol(); // Unique identifier for the toast

  const dispatch = createEventDispatcher();

  let visible = false;
  let timer;

  onMount(() => {
    // Ensure initial styles are applied before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { // Double RAF for some browsers/timing issues
        visible = true;
      });
    });

    timer = setTimeout(() => {
      removeToast();
    }, duration);
  });

  function removeToast() {
    visible = false;
    // Allow time for exit animation before dispatching remove
    setTimeout(() => {
      dispatch('remove', { id });
    }, 300); // This duration should match your CSS transition for opacity/transform
  }

  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<div class="toast {type}" class:visible role="alert" aria-live="assertive">
  <i class="fas {type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
  <span>{message}</span>
</div>

<style>
  .toast {
    position: relative; /* Posicionado em relação ao seu container flex */
    padding: 1rem 1.5rem;
    margin-bottom: 1rem; /* Espaçamento entre toasts, se o container for flex-direction: column */
    border-radius: 4px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    opacity: 0; /* Começa totalmente transparente para a animação */
    transform: translateY(-100%); /* Começa fora da tela, no topo */
    transition: opacity 0.3s ease, transform 0.3s ease; /* Animação de entrada e saída */
    cursor: pointer;
    min-width: 250px;
    max-width: 400px;
    background-color: var(--toast-default-bg, #333); /* Cor de fundo padrão */
    /* Reset de estilos para garantir consistência, especialmente se clicável */
    border: none;
    outline: none;
    font: inherit;
    text-align: left;
  }

  .toast.visible {
    opacity: 1; /* Totalmente visível */
    transform: translateY(0); /* Desliza para a posição final (de cima para baixo) */
  }

  .toast.success {
    background-color: var(--success-color, #28a745); /* Verde para sucesso */
  }

  .toast.error {
    background-color: var(--error-color, #dc3545); /* Vermelho para erro */
  }

  .toast i {
    font-size: 1.2em; /* Tamanho do ícone */
  }

  .toast span {
    flex-grow: 1; /* Ocupa o espaço restante */
  }
</style>
