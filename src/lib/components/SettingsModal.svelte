<script>
  import { createEventDispatcher } from 'svelte';

  export let active = false;
  export let currentViewMode = 'grid';
  export let isDarkMode = false;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function setViewMode(mode) {
    dispatch('setViewMode', mode);
    close(); // Fecha o modal após a seleção
  }
  
</script>

{#if active}
<div class="modal active" on:click|self={close} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title" tabindex="0" on:keydown={(e) => { if (e.key === 'Escape') close(); }}>
    <div class="modal-content settings-modal-content">
        <span class="close-button" on:click={close} role="button" tabindex="0" aria-label="Fechar modal de configurações" on:keydown={(e) => e.key === 'Enter' && close()}>&times;</span>
        <h2 id="settings-modal-title">Configurações</h2>
        <div class="settings-section">
            <h4>Modo de Exibição</h4>
            <div class="display-options-modal">
                <button class="display-option-btn" class:active={currentViewMode === 'grid'} on:click={() => setViewMode('grid')} aria-pressed={currentViewMode === 'grid'}>
                    <i class="fas fa-th"></i> Grade
                </button>
                <button class="display-option-btn" class:active={currentViewMode === 'list'} on:click={() => setViewMode('list')} aria-pressed={currentViewMode === 'list'}>
                    <i class="fas fa-list"></i> Lista
                </button>
            </div>
        </div>
        <div class="settings-section">
            <h4>Tema</h4>
            <label class="switch">
                <input type="checkbox" bind:checked={isDarkMode} aria-label="Alternar tema escuro" />
                <i class="fas fa-sun" aria-hidden="true"></i>
                <i class="fas fa-moon" aria-hidden="true"></i>
            </label>
        </div>
    </div>
</div>
{/if}