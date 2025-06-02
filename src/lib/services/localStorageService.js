// src/lib/services/localStorageService.js

const CART_KEY = 'shoppingCart';
const THEME_KEY = 'theme';
const VIEW_MODE_KEY = 'viewMode';

/**
 * Saves the current cart to localStorage.
 * @param {Array<Object>} cart - The current cart array.
 */
export function saveCart(cart) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
}

/**
 * Loads the cart from localStorage.
 * Parses and validates product stock and price.
 * @returns {Array<Object>} The loaded cart array or an empty array.
 */
export function loadCart() {
    if (typeof localStorage !== 'undefined') {
        const storedCart = localStorage.getItem(CART_KEY);
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                // Ensure product properties are correctly typed
                parsedCart.forEach(item => {
                    if (item.product) {
                        if (typeof item.product.stock !== 'number') {
                            item.product.stock = parseInt(item.product.stock, 10) || 0;
                        }
                        if (typeof item.product.price !== 'number') {
                            item.product.price = parseFloat(item.product.price) || 0;
                        }
                    }
                });
                return parsedCart.filter(item => item.product && typeof item.product.id !== 'undefined');
            } catch (e) {
                console.error("Erro ao carregar carrinho do localStorage:", e);
                localStorage.removeItem(CART_KEY); // Clear corrupted data
                return [];
            }
        }
    }
    return [];
}

/**
 * Saves the current theme preference (dark/light) to localStorage.
 * @param {boolean} isDarkMode - True if dark mode is active, false otherwise.
 */
export function saveTheme(isDarkMode) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    }
}

/**
 * Loads the theme preference from localStorage.
 * Defaults to system preference if no theme is saved.
 * @returns {boolean} True if dark mode should be active, false otherwise.
 */
export function loadThemePreference() {
    if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Default to system preference if no theme is saved
        return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Fallback
}

export function saveViewMode(mode) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(VIEW_MODE_KEY, mode);
    }
}

export function loadViewModePreference() {
    if (typeof localStorage !== 'undefined') {
        const savedMode = localStorage.getItem(VIEW_MODE_KEY);
        if (savedMode && (savedMode === 'grid' || savedMode === 'list')) {
            return savedMode;
        }
    }
    return 'grid'; // Default view mode
}