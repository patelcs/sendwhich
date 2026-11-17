export function formatAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Keeps only a valid decimal number while typing: digits, one `.` (a `,` is treated as `.`),
 * and at most `maxDecimals` fraction digits (no fraction at all when `maxDecimals` is 0).
 */
export function sanitizeDecimalInput(raw: string, maxDecimals: number): string {
  const cleaned = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [integer, ...fraction] = cleaned.split('.');
  if (fraction.length === 0 || maxDecimals <= 0) return integer;
  return `${integer || '0'}.${fraction.join('').slice(0, maxDecimals)}`;
}
