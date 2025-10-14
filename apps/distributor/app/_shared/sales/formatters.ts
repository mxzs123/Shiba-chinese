export function formatCurrency(value: number) {
  // Manual formatting keeps SSR/CSR output identical (avoids Intl edge cases).
  const rounded = Math.round(value);
  const withSeparators = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `¥${withSeparators}`;
}

export function formatPercent(value: number, digits = 0) {
  const ratio = Number.isFinite(value) ? value : 0;
  const percent = (ratio * 100).toFixed(digits);
  return `${percent.replace(/\.0+$/, "")}%`;
}
