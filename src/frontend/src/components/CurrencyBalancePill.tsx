import type { Currency } from "@/backend.d";
import { Skeleton } from "@/components/ui/skeleton";
import { useExchangeRate } from "@/hooks/useBalance";
import { formatAmount, getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { ChevronDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface CurrencyBalancePillProps {
  currency: Currency;
  amount: number; // cents
  primaryCurrency?: Currency;
  isEmpty?: boolean;
  className?: string;
}

export function CurrencyBalancePill({
  currency,
  amount,
  primaryCurrency = "USD" as Currency,
  isEmpty = false,
  className,
}: CurrencyBalancePillProps) {
  const [expanded, setExpanded] = useState(false);
  const symbol = getCurrencySymbol(currency);
  const displayAmount = formatAmount(amount, currency);

  const { data: fxRate, isLoading: fxLoading } = useExchangeRate(
    currency,
    primaryCurrency,
  );

  const primaryEquivalent =
    fxRate && amount > 0
      ? formatAmount(Math.round(amount * fxRate.rate), primaryCurrency)
      : null;

  const primarySymbol = getCurrencySymbol(primaryCurrency);

  return (
    <div className={cn("inline-block", className)}>
      <button
        type="button"
        onClick={() => !isEmpty && setExpanded((v) => !v)}
        data-ocid={`currency.pill.${currency.toLowerCase()}`}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-smooth",
          isEmpty
            ? "bg-muted/30 text-muted-foreground/50 border-border/40 cursor-default"
            : "bg-muted/60 text-foreground border-border hover:bg-muted hover:border-primary/40 cursor-pointer",
          expanded && !isEmpty && "border-primary/60 bg-muted",
        )}
        aria-label={`${currency} balance: ${symbol} ${displayAmount}`}
        disabled={isEmpty}
      >
        <span className="font-mono text-[11px] text-muted-foreground">
          {symbol}
        </span>
        <span>{currency}</span>
        <span className={cn("font-mono", isEmpty && "opacity-40")}>
          {displayAmount}
        </span>
        {!isEmpty && (
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        )}
      </button>

      {expanded && !isEmpty && (
        <div className="mt-1.5 px-3 py-2 rounded-xl border border-border bg-card/80 text-xs space-y-1 shadow-elevated min-w-[180px]">
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide font-semibold">
            {primaryCurrency} Equivalent
          </p>
          {fxLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : primaryEquivalent ? (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="font-mono font-semibold text-foreground">
                {primarySymbol} {primaryEquivalent}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Rate unavailable</span>
          )}
          {fxRate && (
            <p className="text-muted-foreground font-mono text-[10px]">
              1 {currency} = {fxRate.rate.toFixed(4)} {primaryCurrency}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
