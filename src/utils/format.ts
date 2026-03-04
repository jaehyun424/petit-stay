const currencyFormatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
    return currencyFormatter.format(amount);
}
