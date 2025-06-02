export function getStockStatus(stock) {
    if (isNaN(stock) || stock === 0) {
        return { text: 'Esgotado', className: 'out' };
    } else if (stock <= 5) {
        return { text: `${stock} em estoque`, className: 'low' };
    } else {
        return { text: 'Em estoque', className: 'high' };
    }
}

export function parseCSV(text) {
    const rows = text.split(/\r?\n/).slice(1); // Ignora o cabeçalho
    return rows.map((row, index) => {
        const values = [];
        let inQuote = false;
        let currentField = "";
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentField.trim());
                currentField = "";
            } else {
                currentField += char;
            }
        }
        values.push(currentField.trim());

        if (values.length < 5 || values[0].trim() === '') return null;

        const priceString = values[2].replace(',', '.');
        const stockString = values[3];

        return {
            id: `product-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
            name: values[0] || 'Produto Sem Nome',
            description: values[1] || '',
            price: parseFloat(priceString) || 0,
            stock: parseInt(stockString, 10) || 0,
            images: values[4] ? values[4].split(',').map(url => url.trim()).filter(url => url) : []
        };
    }).filter(Boolean); // Remove null entries
}

export function formatCurrency(value, defaultValue = 'N/A') {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatNewlinesToBr(text, defaultValue = 'Sem descrição.') {
  if (typeof text !== 'string' || text.trim() === '') {
    return defaultValue;
  }
  return text.replace(/\n/g, '<br>');
}