import type { Currency } from "@/backend.d";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
};

const JPY_CURRENCIES = new Set(["JPY"]);

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency as string] ?? currency;
}

/**
 * Format an amount in cents to a locale-aware string.
 * USD/EUR/GBP/CAD/AUD → 2 decimal places; JPY → 0 decimal places.
 * Does NOT include the currency symbol — use getCurrencySymbol() separately.
 */
export function formatAmount(cents: number, currency: Currency): string {
  const code = currency as string;
  const isZeroDecimal = JPY_CURRENCIES.has(code);
  const value = isZeroDecimal ? Math.round(cents) : cents / 100;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(value);
}

/**
 * Full formatted currency string with symbol.
 * e.g. "$ 1,234.56" or "¥ 5,000"
 */
export function formatCurrencyDisplay(
  cents: number,
  currency: Currency,
): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol} ${formatAmount(cents, currency)}`;
}

/** All supported currencies */
export const ALL_CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
] as Currency[];
