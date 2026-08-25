import type { Currency } from "@/backend.d";
import { Skeleton } from "@/components/ui/skeleton";
import { useExchangeRate } from "@/hooks/useBalance";
import { formatAmount, getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { RefreshCw, Zap } from "lucide-react";

interface FxRateDisplayProps {
  from: Currency;
  to: Currency;
  sourceAmount?: number; // cents, optional — show converted amount when provided
  className?: string;
}

function timeAgo(ts: number): string {
  if (!ts) return "just now";
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hr ago`;
}

export function FxRateDisplay({
  from,
  to,
  sourceAmount,
  className,
}: FxRateDisplayProps) {
  const { data: fxRate, isLoading, isError } = useExchangeRate(from, to);

  if (from === to) return null;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border",
          className,
        )}
        data-ocid="fx_rate.loading_state"
      >
        <Skeleton className="h-3.5 w-40" />
      </div>
    );
  }

  if (isError || !fxRate) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive",
          className,
        )}
        data-ocid="fx_rate.error_state"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Exchange rate unavailable</span>
      </div>
    );
  }

  const fromSymbol = getCurrencySymbol(from);
  const toSymbol = getCurrencySymbol(to);
  const convertedAmount =
    sourceAmount != null
      ? formatAmount(Math.round(sourceAmount * fxRate.rate), to)
      : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 space-y-1.5",
        className,
      )}
      data-ocid="fx_rate.display"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent">Live Rate</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          Updated {timeAgo(fxRate.fetchedAt)}
        </span>
      </div>

      <p className="font-mono text-sm font-semibold text-foreground">
        1 {from} = {fxRate.rate.toFixed(4)} {to}
      </p>

      {convertedAmount !== null && sourceAmount != null && sourceAmount > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {fromSymbol} {formatAmount(sourceAmount, from)} {from}
          </span>
          <span className="text-xs text-muted-foreground">→</span>
          <span className="text-xs font-semibold text-foreground font-mono">
            {toSymbol} {convertedAmount} {to}
          </span>
        </div>
      )}
    </div>
  );
}
