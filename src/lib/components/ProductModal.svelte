<script>
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import { getStockStatus, formatCurrency, formatNewlinesToBr } from '../utils/helper.js';
  export let product; // O produto selecionado para exibir
  export let active = false; // Controla a visibilidade do modal

  const dispatch = createEventDispatcher();

  let currentImageIndex = 0;
  let sliderImagesContainerEl; // Para bind:this e eventos de toque
  let touchStartX = 0;
  const swipeThreshold = 50;

  $: stockStatusModal = product ? getStockStatus(product.stock) : { text: '', className: '' };
  $: imagesToDisplayModal = product && product.images && product.images.length > 0
    ? product.images
    : (product ? ['https://via.placeholder.com/400/cccccc/ffffff?text=Sem+Imagem'] : []);
  $: totalImagesModal = imagesToDisplayModal.length;

  function close() {
    dispatch('close');
  }

  function addToCart() {
    dispatch('addToCart', product);
  }

  function nextImage() {
    if (currentImageIndex < totalImagesModal - 1) {
      currentImageIndex++;
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    }
  }

  function goToImage(index) {
    currentImageIndex = index;
  }

  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
  }

  function handleTouchEnd(event) {
    if (!product || !product.images || product.images.length <= 1) {
      touchStartX = 0;
      return;
    }
    const finalTouchEndX = event.changedTouches[0].screenX;
    if (finalTouchEndX < touchStartX - swipeThreshold) {
      nextImage();
    } else if (finalTouchEndX > touchStartX + swipeThreshold) {
      prevImage();
    }
    touchStartX = 0;
  }

  // Adicionar e remover listeners de toque quando o modal é ativado/desativado
  // e o elemento do slider está disponível.
  $: if (active && sliderImagesContainerEl && totalImagesModal > 1) {
    sliderImagesContainerEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    sliderImagesContainerEl.addEventListener('touchend', handleTouchEnd);
    // Cleanup function for when the condition is no longer true or component unmounts
    onDestroy(() => {
      if (sliderImagesContainerEl) { // Check again in case it was removed from DOM
        sliderImagesContainerEl.removeEventListener('touchstart', handleTouchStart);
        sliderImagesContainerEl.removeEventListener('touchend', handleTouchEnd);
      }
    });
  } else if (!active && sliderImagesContainerEl) {
      sliderImagesContainerEl.removeEventListener('touchstart', handleTouchStart);
      sliderImagesContainerEl.removeEventListener('touchend', handleTouchEnd);
  }

  // Reset image index when product changes
  $: if (product) currentImageIndex = 0;

</script>

{#if active && product}
<div class="modal active" on:click|self={close} role="dialog" aria-modal="true" aria-labelledby="product-modal-name-{product.id}" tabindex="0" on:keydown={(e) => { if (e.key === 'Escape') close(); }}>
    <div class="modal-content product-modal-content">
        <span class="close-button" on:click={close} role="button" tabindex="0" aria-label="Fechar modal de produto" on:keydown={(e) => e.key === 'Enter' && close()}>&times;</span>
        <div class="modal-image-slider-container">
            {#if totalImagesModal > 1}<button class="slider-btn prev" on:click={prevImage} disabled={currentImageIndex === 0} aria-label="Imagem anterior">&#10094;</button>{/if}
            <div class="slider-images" bind:this={sliderImagesContainerEl} style="transform: translateX(-{currentImageIndex * 100}%);">
                {#each imagesToDisplayModal as imgUrl, i (imgUrl + i)}
                    <img src={imgUrl} alt="{product.name || 'Produto'} - Imagem {i + 1}" />
                {/each}
            </div>
            {#if totalImagesModal > 1}
            <div class="slider-indicators" role="tablist" aria-label="Indicadores de imagem">
                {#each imagesToDisplayModal as _, i (i)}<button class="indicator-dot" class:active={currentImageIndex === i} on:click={() => goToImage(i)} aria-label="Ir para imagem {i + 1}" role="tab" aria-selected={currentImageIndex === i}></button>{/each}
            </div>
            <button class="slider-btn next" on:click={nextImage} disabled={currentImageIndex === totalImagesModal - 1} aria-label="Próxima imagem">&#10095;</button>
            {/if}
        </div>
        <div class="modal-details-content">
            <div class="modal-price-tag">{formatCurrency(product.price)}</div>
            <div id="product-modal-name-{product.id}" class="modal-name-tag">{product.name || 'Produto sem nome'}</div>
              <div class="modal-stock-tag stock {stockStatusModal.className}">{stockStatusModal.text}</div>            
            <p class="modal-description-text">{@html formatNewlinesToBr(product.description)}</p>
           <button class="add-to-cart-btn" on:click={addToCart} disabled={product.stock === 0 || isNaN(product.stock)}>
                {product.stock === 0 || isNaN(product.stock) ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </button>
        </div>
    </div>
</div>
{/if}