/** Formats existing decimal values for display without rounding stored precision. */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  const text = String(value);
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return text;
  }
  const [whole = '', fraction] = text.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${grouped}${fraction === undefined ? '' : `,${fraction}`}`;
}
