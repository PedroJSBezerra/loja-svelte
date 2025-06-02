// src/lib/services/productService.js
import { parseCSV } from '../utils/helper.js'; // Supondo que parseCSV permaneça em helper.js

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRY00iz3q4UEcZ0BUpYJ52EnLyKpAv2r37_UUS01aqb2GF1hWpxKEcmUYC1RslP-Kp-dUuJd_wTb2uq/pub?output=csv';

/**
 * Fetches product data from the Google Sheet CSV.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
 * @throws {Error} If the network response is not ok or if parsing fails.
 */
export async function fetchProducts() {
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        return parseCSV(data);
    } catch (error) {
        console.error('Falha ao buscar produtos:', error);
        // Re-throw the error so the caller can handle it, e.g., show a toast
        throw error; 
    }
}
