

export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

export function formatMonetaryDecimal(value) {
    if (isNaN(value) || value === null) {
      return '0.00';
    }
  
    return parseFloat(value).toFixed(2);
}
  