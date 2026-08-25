import { createActor } from "@/backend";
import type {
  BillingInterval,
  Subscription,
  SubscriptionStatus,
  SubscriptionTier,
} from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetSubscription() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscription();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetSubscriptionStatus() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SubscriptionStatus | null>({
    queryKey: ["subscriptionStatus"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscriptionStatus();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useCreateSubscriptionCheckout() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      tier,
      interval,
    }: {
      tier: SubscriptionTier;
      interval: BillingInterval;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.createSubscriptionCheckout(tier, interval);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok; // Stripe checkout URL
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
  });
}

export function useCancelSubscription() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.cancelSubscription();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      qc.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });
}
