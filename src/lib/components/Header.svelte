<script>
  import { createEventDispatcher } from 'svelte';

  export let searchTerm = '';
  export let cartItemCount = 0;
  export let animatedCartIconEl = null; // Para bind:this

  const dispatch = createEventDispatcher();

  function openSettings() {
    dispatch('openSettings');
  }

  function openCart() {
    dispatch('openCart');
  }
</script>

<header>
    <div class="settings-icon" on:click={openSettings} role="button" tabindex="0"
         aria-label="Abrir configurações"
         on:keydown={(e) => e.key === 'Enter' && openSettings()}>
        <i class="fas fa-cog"></i>
    </div>
    <input type="text" placeholder="Buscar no catálogo..." bind:value={searchTerm} aria-label="Buscar produtos" />
    <div class="cart-icon-container" on:click={openCart} role="button" tabindex="0"
         aria-label="Abrir carrinho de compras"
         on:keydown={(e) => e.key === 'Enter' && openCart()}>
        <i class="fas fa-shopping-cart" bind:this={animatedCartIconEl}></i>
        <span id="cart-count" aria-live="polite">{cartItemCount}</span>
    </div>
</header>