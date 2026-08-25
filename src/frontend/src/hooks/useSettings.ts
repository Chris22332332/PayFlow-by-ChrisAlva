import { createActor } from "@/backend";
import type { DeviceSession, UserSettings } from "@/backend.d";
import { Currency, NumberFormat, TxHistoryVisibility } from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const DEFAULT_SETTINGS: UserSettings = {
  primary_currency: Currency.USD,
  data_sharing: false,
  per_tx_limit: BigInt(10000),
  decimal_places: BigInt(2),
  notification_promotions: false,
  notification_p2p_requests: true,
  number_format: NumberFormat.Period,
  monthly_limit: BigInt(500000),
  notification_email_receipts: true,
  tx_history_visibility: TxHistoryVisibility.Private,
  notification_payment_alerts: true,
  daily_limit: BigInt(50000),
};

export function useUserSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SETTINGS;
      return actor.getUserSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useUpdateUserSettings() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updated: UserSettings) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateUserSettings(updated);
    },
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: ["userSettings"] });
      const previous = qc.getQueryData<UserSettings>(["userSettings"]);
      qc.setQueryData(["userSettings"], updated);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["userSettings"], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });
}

export function useDeviceSessions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DeviceSession[]>({
    queryKey: ["deviceSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDeviceSessions();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useRevokeSession() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.revokeDeviceSession(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deviceSessions"] });
    },
  });
}

export function useRevokeAllSessions() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.revokeAllSessions();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deviceSessions"] });
    },
  });
}
