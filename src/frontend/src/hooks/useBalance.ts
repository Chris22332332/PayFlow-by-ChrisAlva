import type { Currency } from "@/backend.d";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWalletStore } from "../store";
import { useBackend } from "./useBackend";

export type { Currency };

export interface CurrencyBalance {
  currency: Currency;
  amount: number; // cents
}

export interface FxRateData {
  from: Currency;
  to: Currency;
  rate: number;
  fetchedAt: number;
}

export function useBalance() {
  const { actor, isFetching } = useBackend();
  const { setBalance } = useWalletStore();
  const queryClient = useQueryClient();

  const query = useQuery<number>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0;
      const raw = await actor.getBalance();
      return Number(raw);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const multiCurrencyQuery = useQuery<CurrencyBalance[]>({
    queryKey: ["multiCurrencyBalances"],
    queryFn: async () => {
      if (!actor) return [];
      const pairs = await actor.getMultiCurrencyBalances();
      return pairs.map(([currency, amount]) => ({
        currency,
        amount: Number(amount),
      }));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setBalance(query.data);
    }
  }, [query.data, setBalance]);

  const addFunds = useMutation({
    mutationFn: async ({
      amount,
      currency,
    }: {
      amount: number;
      currency: Currency;
    }) => {
      if (!actor) throw new Error("Actor not available");
      // addFunds on backend still uses bigint cents; currency context noted
      await actor.addFunds(BigInt(amount));
      // If not USD, convert — best effort, backend handles ledger
      void currency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["multiCurrencyBalances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const withdraw = useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor not available");
      await actor.withdrawFunds(BigInt(amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["multiCurrencyBalances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const sendMoneyWithFx = useMutation({
    mutationFn: async ({
      recipient,
      amount,
      fromCurrency,
      toCurrency,
      note,
    }: {
      recipient: string;
      amount: number;
      fromCurrency: Currency;
      toCurrency: Currency;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");

      let finalAmount = amount;
      if (fromCurrency !== toCurrency) {
        const converted = await actor.convertCurrency(
          BigInt(amount),
          fromCurrency,
          toCurrency,
        );
        finalAmount = Number(converted.amount);
      }

      // Find recipient principal
      const principal = await actor.findUser({
        __kind__: "username",
        username: recipient,
      });
      if (!principal) {
        const principalByEmail = await actor.findUser({
          __kind__: "email",
          email: recipient,
        });
        if (!principalByEmail) throw new Error("Recipient not found");
        await actor.sendMoney(principalByEmail, BigInt(finalAmount), note);
        return;
      }
      await actor.sendMoney(principal, BigInt(finalAmount), note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["multiCurrencyBalances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    balance: query.data ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    multiCurrencyBalances: multiCurrencyQuery.data ?? [],
    isMultiCurrencyLoading: multiCurrencyQuery.isLoading,
    addFunds,
    withdraw,
    sendMoneyWithFx,
    refetch: query.refetch,
  };
}

export function useExchangeRate(from: Currency, to: Currency) {
  const { actor, isFetching } = useBackend();

  return useQuery<FxRateData | null>({
    queryKey: ["exchangeRate", from, to],
    queryFn: async () => {
      if (!actor || from === to) return null;
      const fx = await actor.getExchangeRate(from, to);
      return {
        from: fx.from_currency,
        to: fx.to_currency,
        rate: fx.rate,
        fetchedAt: Number(fx.fetched_at),
      };
    },
    enabled: !!actor && !isFetching && from !== to,
    refetchInterval: 5 * 60_000, // 5-min cache
    staleTime: 5 * 60_000,
  });
}
