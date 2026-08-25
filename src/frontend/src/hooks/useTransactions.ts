import { Currency, TxStatus, TxType } from "@/backend";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useWalletStore } from "../store";
import type { CurrencyCode, Transaction } from "../types";
import { useBackend } from "./useBackend";

function mapTxType(txType: TxType): Transaction["type"] {
  switch (txType) {
    case TxType.sent:
      return "sent";
    case TxType.received:
      return "received";
    case TxType.deposit:
      return "added";
    case TxType.withdrawal:
      return "withdrawn";
    case TxType.request:
      return "request";
  }
}

function mapTxStatus(status: TxStatus): Transaction["status"] {
  switch (status) {
    case TxStatus.completed:
      return "completed";
    case TxStatus.pending:
      return "pending";
    case TxStatus.cancelled:
    case TxStatus.rejected:
      return "failed";
  }
}

/** Map Candid Currency enum to string CurrencyCode */
function mapCurrency(currency: Currency): CurrencyCode {
  switch (currency) {
    case Currency.USD:
      return "USD";
    case Currency.EUR:
      return "EUR";
    case Currency.GBP:
      return "GBP";
    case Currency.CAD:
      return "CAD";
    case Currency.AUD:
      return "AUD";
    case Currency.JPY:
      return "JPY";
    default:
      return "USD";
  }
}

export function useTransactions() {
  const { actor, isFetching } = useBackend();
  const { setTransactions } = useWalletStore();
  const queryClient = useQueryClient();

  const query = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getTransactionHistory(null);
      return raw.map((tx) => ({
        id: String(tx.id),
        type: mapTxType(tx.txType),
        amount: Number(tx.amount),
        base_amount: Number(tx.base_amount),
        currency: mapCurrency(tx.currency),
        tax_rate: Number(tx.tax_rate),
        tax_amount: Number(tx.tax_amount),
        original_currency:
          tx.original_currency != null
            ? mapCurrency(tx.original_currency)
            : null,
        original_amount:
          tx.original_amount != null ? Number(tx.original_amount) : null,
        description: tx.note || tx.txType,
        counterparty: tx.counterparty ? tx.counterparty.toString() : undefined,
        timestamp: Number(tx.timestamp / 1_000_000n),
        status: mapTxStatus(tx.status),
        referenceId: `TXN-${String(tx.id).padStart(8, "0")}`,
        requestId: tx.requestId != null ? String(tx.requestId) : undefined,
      }));
    },
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (query.data) {
      setTransactions(query.data);
    }
  }, [query.data, setTransactions]);

  const sendMoney = useMutation({
    mutationFn: async ({
      recipientIdentifier,
      amountCents,
      note,
    }: {
      recipientIdentifier: string;
      amountCents: number;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      let principal: Principal | null = null;
      if (recipientIdentifier.includes("@")) {
        principal = await actor.findUser({
          __kind__: "email",
          email: recipientIdentifier,
        });
      } else if (/^\+?\d[\d\s-]{7,}$/.test(recipientIdentifier)) {
        principal = await actor.findUser({
          __kind__: "phone",
          phone: recipientIdentifier,
        });
      } else {
        principal = await actor.findUser({
          __kind__: "username",
          username: recipientIdentifier,
        });
      }
      if (!principal) throw new Error("User not found");
      await actor.sendMoney(principal, BigInt(amountCents), note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });

  const requestMoney = useMutation({
    mutationFn: async ({
      payerIdentifier,
      amountCents,
      note,
    }: {
      payerIdentifier: string;
      amountCents: number;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      let principal: Principal | null = null;
      if (payerIdentifier.includes("@")) {
        principal = await actor.findUser({
          __kind__: "email",
          email: payerIdentifier,
        });
      } else if (/^\+?\d[\d\s-]{7,}$/.test(payerIdentifier)) {
        principal = await actor.findUser({
          __kind__: "phone",
          phone: payerIdentifier,
        });
      } else {
        principal = await actor.findUser({
          __kind__: "username",
          username: payerIdentifier,
        });
      }
      if (!principal) throw new Error("User not found");
      await actor.requestMoney(principal, BigInt(amountCents), note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  /** Download transaction history as CSV */
  const exportCsv = useCallback(async () => {
    if (!actor) throw new Error("Actor not available");
    const csv = await actor.exportTransactionsCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [actor]);

  const exportCsvMutation = useMutation({ mutationFn: exportCsv });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    sendMoney,
    requestMoney,
    exportCsv: exportCsvMutation,
  };
}
