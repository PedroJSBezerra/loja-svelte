<script>
  import { onMount, tick } from 'svelte';
  import '../app.css';
  
  // Importando os novos componentes
  import Header from '../lib/components/Header.svelte';
  import ProductCard from '../lib/components/ProductCard.svelte';
  import ProductModal from '../lib/components/ProductModal.svelte';
  import CartModal from '../lib/components/CartModal.svelte';
  import SettingsModal from '../lib/components/SettingsModal.svelte';
  import Toast from '../lib/components/Toast.svelte'; // Import the new Toast component
  import ToastContainer from '../lib/components/ToastContainer.svelte';
  import { getStockStatus } from '../lib/utils/helper.js'; // parseCSV será usado pelo productService
  import { fetchProducts } from '../lib/services/productService.js';
  import { 
    saveCart, 
    loadCart, 
    saveTheme, 
    loadThemePreference,
    saveViewMode,
    loadViewModePreference
  } from '../lib/services/localStorageService.js';
  // --- Estado da Aplicação (Svelte reactive variables) ---
  let allProducts = [];
  let currentCart = [];
  let activeToasts = []; // Array to manage active toasts
  let selectedProduct = null;
  let currentImageIndex = 0;
  let currentViewMode = 'grid'; // 'grid' ou 'list'
  let searchTerm = '';

  // Modal visibility
  let productModalActive = false;
  let cartModalActive = false;
  let settingsModalActive = false;
  let isDarkMode = false; // Default, will be overwritten by loadTheme

  // DOM element bindings (for elements that need direct reference)
  let animatedCartIconEl;
  // sliderImagesContainerEl, touchStartX, swipeThreshold agora são internos ao ProductModal.svelte

  // currentImageIndex também será gerenciado internamente pelo ProductModal ou passado como prop se necessário controle externo.

  let isLoadingProducts = false;
  let toastIdCounter = 0; // To generate unique IDs for toasts

  // --- Funções de Ajuda ---
  function showToast(message, type = 'success') {
    const id = toastIdCounter++;
    activeToasts = [...activeToasts, { id, message, type, duration: 3000 }];
  }
  function handleRemoveToast(event) {
    activeToasts = activeToasts.filter(toast => toast.id !== event.detail.id);
  }

  function animateCartIcon() {
    if (!animatedCartIconEl) return;
    animatedCartIconEl.classList.add('pulse');
    setTimeout(() => {
        animatedCartIconEl.classList.remove('pulse');
    }, 500);
  }

  // --- Funções do Carrinho ---
  function addItemToCart(productToAdd) {
    if (!productToAdd || typeof productToAdd.id === 'undefined') {
        console.error("Tentativa de adicionar produto inválido ao carrinho:", productToAdd);
        showToast('Erro ao adicionar produto ao carrinho.', 'error');
        return;
    }
    const existingItemIndex = currentCart.findIndex(item => item.product.id === productToAdd.id);

    if (existingItemIndex > -1) {
        if (currentCart[existingItemIndex].quantity < productToAdd.stock) {
            currentCart[existingItemIndex].quantity++;
            showToast(`${productToAdd.name} +1 no carrinho!`);
        } else {
            showToast(`Não há mais estoque de ${productToAdd.name}.`, 'error');
        }
    } else {
        currentCart.push({ product: productToAdd, quantity: 1 });
        showToast(`${productToAdd.name} adicionado ao carrinho!`);
    }
    currentCart = [...currentCart]; // Trigger Svelte reactivity for the array
    animateCartIcon();
    saveCart(currentCart);
  }

  function updateItemQuantity(productId, change) {
    const itemIndex = currentCart.findIndex(item => item.product.id === productId);

    if (itemIndex > -1) {
        const item = currentCart[itemIndex];
        const newQuantity = item.quantity + change;

        if (newQuantity > 0 && newQuantity <= item.product.stock) {
            item.quantity = newQuantity;
            showToast(`Quantidade de ${item.product.name} atualizada para ${newQuantity}.`);
        } else if (newQuantity <= 0) {
            // Use Svelte's confirm for better integration if available, or window.confirm
            if (window.confirm(`Remover ${item.product.name} do carrinho?`)) {
                currentCart.splice(itemIndex, 1);
                showToast(`${item.product.name} removido do carrinho.`, 'success');
            }
        } else if (newQuantity > item.product.stock) {
            showToast(`Você atingiu o limite de estoque para ${item.product.name}.`, 'error');
        }
        currentCart = [...currentCart]; // Trigger Svelte reactivity
    }
    saveCart(currentCart);
  }

  function clearCart() {
    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
        currentCart = [];
        showToast('Carrinho limpo!', 'success');
        saveCart(currentCart);
    }
  }

  // --- Funções de Modal ---
  async function openProductModal(product) {
    selectedProduct = product;
    // currentImageIndex será resetado dentro do ProductModal quando o 'product' prop mudar.
    productModalActive = true;
    document.body.style.overflow = 'hidden';
    // A lógica de tick() e adição de event listeners de toque foi movida para ProductModal.svelte
  }

  function closeProductModal() {
    productModalActive = false;
    document.body.style.overflow = '';
    // A remoção de event listeners de toque foi movida para ProductModal.svelte (via onDestroy ou reatividade)
    selectedProduct = null; // Clear selected product
  }

  function openCartModal() {
    cartModalActive = true;
    document.body.style.overflow = 'hidden';
  }
  
  function closeCartModal() {
    cartModalActive = false;
    document.body.style.overflow = '';
  }
  // As funções de swipe (handleTouchStart, handleTouchEnd) e as de navegação de imagem (nextImage, prevImage, goToImage)
  // foram movidas para dentro do ProductModal.svelte, pois são específicas dele.

  // --- Funções do Modal de Configurações ---
  function openSettingsModal() {
    settingsModalActive = true;
    document.body.style.overflow = 'hidden';
  }

  function closeSettingsModal() {
    settingsModalActive = false;
    document.body.style.overflow = '';
  }

  // --- Funções de Opções de Visualização (Grade/Lista) ---
  function setViewMode(mode) {
    currentViewMode = mode; // Update reactive variable
    saveViewMode(mode); // Persist using the service
  }

  // --- Funções de Dark Mode ---
  // A função loadTheme foi substituída pela chamada direta a loadThemePreference em onMount
  // e a lógica de salvar o tema foi movida para o bloco reativo abaixo usando saveTheme do serviço.

  // Função para aplicar o tema (chamada em onMount e quando isDarkMode muda via SettingsModal)
  function applyTheme(darkMode) {
    isDarkMode = darkMode; // Atualiza o estado reativo
    // O bloco reativo $: abaixo cuidará de atualizar a classe do body e o localStorage.
  }


  // Reactive statement to update body class and localStorage when isDarkMode changes
  $: {
    if (typeof document !== 'undefined') { // Ensure document is available (client-side)
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      saveTheme(isDarkMode); // Persist theme using the service
    }
  }

  // --- Função de Busca de Produtos (e Parsing CSV) ---
  async function fetchProductsData() {
    isLoadingProducts = true;
    try {
        allProducts = await fetchProducts();
    } catch (error) {
        // O erro já foi logado no productService, aqui apenas mostramos o toast.
        showToast('Erro ao carregar produtos. Verifique o link e as permissões da planilha.', 'error');
        allProducts = []; // Garante que allProducts seja um array vazio em caso de erro
    } finally {
        isLoadingProducts = false;
    }
  }

  // --- Reactive Computations ---
  $: filteredProducts = allProducts.filter(product =>
    (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  $: cartTotal = currentCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  $: cartItemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Lifecycle
  onMount(() => {
    currentCart = loadCart();
    currentViewMode = loadViewModePreference();
    applyTheme(loadThemePreference()); // Carrega e aplica o tema
    fetchProductsData();

    // Close modals on escape key
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            if (productModalActive) closeProductModal();
            if (cartModalActive) closeCartModal();
            if (settingsModalActive) closeSettingsModal();
        }
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
        window.removeEventListener('keydown', handleKeydown);
        // Clean up body overflow if component is destroyed while modal is open
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    };
  });

</script>

<svelte:head>
    <title>Catálogo de Eletrônicos</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</svelte:head>

<Header
    bind:searchTerm
    cartItemCount={cartItemCount}
    bind:animatedCartIconEl
    on:openSettings={openSettingsModal}
    on:openCart={openCartModal}
/>


<main style="padding-top: calc(56px + 8px);"> <!-- Header height + main padding -->
    <div class="product-container" 
         class:grid-view={currentViewMode === 'grid'}
         class:list-view={currentViewMode === 'list'}>
        {#if isLoadingProducts}
            <div id="loader" role="status" aria-live="polite">Carregando produtos...</div>
        {:else if filteredProducts.length === 0 && !isLoadingProducts}
            <p>Nenhum produto encontrado.</p>
        {:else}
            {#each filteredProducts as product (product.id)}
                <ProductCard
                    product={product}
                    viewMode={currentViewMode}
                    on:openProductModal={() => openProductModal(product)}
                />
            {/each}
        {/if}
    </div>
</main>

<!-- Product Modal -->
<ProductModal
    product={selectedProduct}
    active={productModalActive}
    on:close={closeProductModal}
    on:addToCart={(event) => addItemToCart(event.detail)}
/>

<!-- Cart Modal -->
<CartModal
    cart={currentCart}
    active={cartModalActive}
    cartTotal={cartTotal}
    on:close={closeCartModal}
    on:updateItemQuantity={(event) => updateItemQuantity(event.detail.productId, event.detail.change)}
    on:clearCart={clearCart}
/>

<!-- Settings Modal -->
<SettingsModal
    active={settingsModalActive}
    currentViewMode={currentViewMode}
    bind:isDarkMode
    on:close={closeSettingsModal}
    on:setViewMode={(event) => setViewMode(event.detail)}
/>

<!-- Toast Container - Managed by ToastContainer.svelte -->
<ToastContainer toasts={activeToasts} removeToast={id => handleRemoveToast({ detail: { id } })} />
