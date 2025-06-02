<script>
  import { createEventDispatcher } from 'svelte';
  import { getStockStatus, formatCurrency } from '../utils/helper.js';

  export let product;
  export let viewMode; // 'grid' ou 'list'

  const dispatch = createEventDispatcher();

  $: stockStatus = getStockStatus(product.stock);
  $: firstImage = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/200/cccccc/ffffff?text=Sem+Imagem';

  function handleClick() {
    dispatch('openProductModal', product);
  }
</script>

<div class="product-card"
     class:grid-item={viewMode === 'grid'}
     class:list-item={viewMode === 'list'}
     on:click={handleClick}
     on:keydown={(e) => e.key === 'Enter' && handleClick()}
     role="button" tabindex="0" aria-label="Ver detalhes do produto {product.name}">
    <div class="image-container">
        <img src={firstImage} alt={product.name || 'Produto sem nome'} loading="lazy">
    </div>
    <div class="info">
        <p class="price">{formatCurrency(product.price)}</p>
        <p class="name">{product.name || 'Produto sem nome'}</p>
        <div class="stock {stockStatus.className}">{stockStatus.text}</div>
    </div>
</div>