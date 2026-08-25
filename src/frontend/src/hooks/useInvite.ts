import { createActor } from "@/backend";
import type { ReferralRewardRecord, ReferralRewardSummary } from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { ReferralRewardRecord, ReferralRewardSummary };

const EMPTY_REWARDS: ReferralRewardSummary = {
  totalEarned: BigInt(0),
  pendingRewards: BigInt(0),
  paidRewards: [],
};

export function useInviteCode() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery<string>({
    queryKey: ["inviteCode"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getInviteCode();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });

  const inviteCode = data ?? "";
  const inviteUrl = inviteCode
    ? `${window.location.origin}/invite/${inviteCode}`
    : "";

  return { inviteCode, inviteUrl, isLoading };
}

export function useInviteStats() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery({
    queryKey: ["inviteStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getInviteStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60,
  });

  return { stats: data ?? null, isLoading };
}

export function useValidateInvite(code: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<boolean>({
    queryKey: ["validateInvite", code],
    queryFn: async () => {
      if (!actor || !code) return false;
      return actor.validateInviteCode(code);
    },
    enabled: !!actor && !isFetching && code.length > 0,
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useRedeemInvite() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.redeemInviteCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inviteStats"] });
    },
  });
}

export function useReferralRewards() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery<ReferralRewardSummary>({
    queryKey: ["referralRewards"],
    queryFn: async () => {
      if (!actor) return EMPTY_REWARDS;
      return actor.getReferralRewards();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60,
  });

  return {
    rewards: data ?? EMPTY_REWARDS,
    isLoading,
  };
}
