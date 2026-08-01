/* Currency helpers — the store trades in AUD (Australian Dollars). */

export const CURRENCY = "AUD";

/**
 * Format an amount as "AUD 2,450" (thousands grouped, no decimals for
 * whole numbers). Matches the reference store design.
 */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasFraction = rounded % 1 !== 0;
  const formatted = rounded.toLocaleString("en-AU", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY} ${formatted}`;
}

/** Just the grouped number, e.g. "2,450" (used where the AUD label is separate). */
export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-AU");
}
