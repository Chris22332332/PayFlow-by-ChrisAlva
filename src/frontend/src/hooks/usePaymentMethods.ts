import { PaymentMethodType, VerificationStatus } from "@/backend";
import type { PaymentMethod } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "./useBackend";

export type VerStatus = "Verified" | "Pending" | "Failed" | "Unverified";

export interface ExtendedPaymentMethod extends PaymentMethod {
  expiry: string;
  verificationStatus: VerStatus;
  stripePaymentMethodId?: string;
  holderName?: string;
}

function mapVerStatus(v: VerificationStatus): VerStatus {
  if (v === VerificationStatus.Verified) return "Verified";
  if (v === VerificationStatus.Pending) return "Pending";
  if (v === VerificationStatus.Failed) return "Failed";
  return "Unverified";
}

function mapPmType(pmType: PaymentMethodType): PaymentMethod["type"] {
  return pmType === PaymentMethodType.bank ? "bank" : "card";
}

export function usePaymentMethods() {
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const query = useQuery<ExtendedPaymentMethod[]>({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.listPaymentMethods();
      return raw.map((pm) => ({
        id: String(pm.id),
        type: mapPmType(pm.pmType),
        label: pm.displayLabel,
        last4: pm.last4,
        isDefault: pm.isDefault,
        brand:
          pm.pmType === PaymentMethodType.card ? pm.displayLabel : undefined,
        expiry: pm.expiry,
        verificationStatus: mapVerStatus(pm.verification_status),
        stripePaymentMethodId: pm.stripe_payment_method_id,
        holderName: pm.account_holder_name,
      }));
    },
    enabled: !!actor && !isFetching,
  });

  const createSetupIntent = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.createStripeSetupIntent();
    },
  });

  const confirmStripeCard = useMutation({
    mutationFn: async (params: {
      stripePaymentMethodId: string;
      displayLabel: string;
      last4: string;
      expiry: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.confirmStripePaymentMethod(
        params.stripePaymentMethodId,
        params.displayLabel,
        PaymentMethodType.card,
        params.last4,
        params.expiry,
        null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });

  const confirmStripeBank = useMutation({
    mutationFn: async (params: {
      stripePaymentMethodId: string;
      displayLabel: string;
      last4: string;
      holderName: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.confirmStripePaymentMethod(
        params.stripePaymentMethodId,
        params.displayLabel,
        PaymentMethodType.bank,
        params.last4,
        "",
        params.holderName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });

  const removePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.removePaymentMethod(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });

  const setDefaultPaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setDefaultPaymentMethod(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });

  return {
    methods: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createSetupIntent,
    confirmStripeCard,
    confirmStripeBank,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
}
