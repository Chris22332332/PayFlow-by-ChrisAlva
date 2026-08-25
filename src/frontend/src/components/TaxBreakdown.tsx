import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/types";

interface TaxBreakdownProps {
  baseAmount: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
  currency: CurrencyCode;
  className?: string;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
};

/** Format cents to display amount. JPY has no subunit. */
function formatAmount(cents: number, currency: CurrencyCode): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === "JPY") {
    return `${symbol}${cents.toLocaleString("en-US")}`;
  }
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

/**
 * TaxBreakdown — renders a compact 3-line tax summary.
 * Only renders when taxAmount > 0.
 */
export function TaxBreakdown({
  baseAmount,
  taxAmount,
  taxRate,
  totalAmount,
  currency,
  className,
}: TaxBreakdownProps) {
  if (taxAmount <= 0) return null;

  // Convert basis points to percentage: 2000 bp = 20%
  const taxPercent = (taxRate / 100).toFixed(0);

  return (
    <div
      className={cn("receipt-breakdown", className)}
      data-ocid="tax_breakdown.panel"
    >
      <div className="receipt-row">
        <span className="tax-base">Base amount</span>
        <span className="tax-base font-mono">
          {formatAmount(baseAmount, currency)}
        </span>
      </div>
      <div className="receipt-row" data-ocid="tax_breakdown.tax_line">
        <span className="tax-line">Tax (VAT {taxPercent}%)</span>
        <span className="tax-line">+{formatAmount(taxAmount, currency)}</span>
      </div>
      <div className="receipt-row border-t border-border pt-2 mt-1">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-sm font-semibold font-mono text-primary">
          {formatAmount(totalAmount, currency)}
        </span>
      </div>
    </div>
  );
}
