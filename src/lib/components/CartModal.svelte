<script>
  import { createEventDispatcher } from 'svelte';
  import { formatCurrency } from '../utils/helper.js';

  export let cart = [];
  export let active = false;
  export let cartTotal = 0;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function updateItemQuantity(productId, change) {
    dispatch('updateItemQuantity', { productId, change });
  }

  function clearCart() {
    dispatch('clearCart');
  }
</script>

{#if active}
<div class="modal active" on:click|self={close} role="dialog" aria-modal="true" aria-labelledby="cart-modal-title" tabindex="0" on:keydown={(e) => { if (e.key === 'Escape') close(); }}>
    <div class="modal-content cart-modal-content">
        <span class="close-button" on:click={close} role="button" tabindex="0" aria-label="Fechar modal do carrinho" on:keydown={(e) => e.key === 'Enter' && close()}>&times;</span>
        <h2 id="cart-modal-title">Seu Carrinho</h2>
        <div class="cart-items-list">
            {#if cart.length === 0}
                <p class="empty-cart-message-text">Seu carrinho está vazio.</p>
            {:else}
                {#each cart as item (item.product.id)}
                    {@const itemImage = item.product.images && item.product.images.length > 0 ? item.product.images[0] : 'https://via.placeholder.com/60/cccccc/ffffff?text='}
                    <div class="cart-item">
                        <img src={itemImage} alt={item.product.name} />
                        <div class="cart-item-details">
                            <div class="name">{item.product.name}</div>
                            <div class="price">{formatCurrency(item.product.price)} x {item.quantity}</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="decrease-quantity" on:click={() => updateItemQuantity(item.product.id, -1)} aria-label="Diminuir quantidade de {item.product.name}">-</button>
                            <span aria-live="polite"> {item.quantity} </span>
                            <button class="increase-quantity" on:click={() => updateItemQuantity(item.product.id, 1)} aria-label="Aumentar quantidade de {item.product.name}">+</button>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
        {#if cart.length > 0}
        <div class="cart-summary-container">
            <h3>Total: <span class="cart-total-amount">{formatCurrency(cartTotal)}</span></h3>
            <button class="clear-cart-btn" on:click={clearCart}>Limpar Carrinho</button>
        </div>
        {/if}
    </div>
</div>
{/if}