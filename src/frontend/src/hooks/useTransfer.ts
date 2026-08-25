import { createActor } from "@/backend";
import type { UserProfile } from "@/backend.d";
import type { CurrencyCode } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { UserProfile };

export function useRecipientSearch(query: string) {
  const { actor, isFetching } = useActor(createActor);
  const trimmed = query.trim();

  return useQuery<UserProfile[]>({
    queryKey: ["recipientSearch", trimmed],
    queryFn: async () => {
      if (!actor || !trimmed) return [];
      const result = await actor.findUserByIdOrUsername(trimmed);
      if (result === null) return [];
      return [result];
    },
    enabled: !!actor && !isFetching && trimmed.length >= 2,
    staleTime: 10_000,
  });
}

export interface SendMoneyParams {
  recipientPrincipal: string;
  amountCents: number;
  currency: CurrencyCode;
  note: string;
  paymentMethodId?: string;
}

export function useSendMoney() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipientPrincipal,
      amountCents,
      currency: _currency,
      note,
      paymentMethodId: _pm,
    }: SendMoneyParams) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.sendMoney(
        recipientPrincipal as unknown as Principal,
        BigInt(amountCents),
        note,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
