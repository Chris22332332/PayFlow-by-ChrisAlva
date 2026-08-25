import { createActor } from "@/backend";
import type { AutoPayConfig as BackendAutoPayConfig } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Info, Lock } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CONFIG: BackendAutoPayConfig = {
  autoChargeOnSend: false,
  autoDepositOnReceive: false,
  defaultPayoutMethodId: undefined,
};

function useAutoPayConfig() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery<BackendAutoPayConfig>({
    queryKey: ["autoPayConfig"],
    queryFn: async () => {
      if (!actor) return DEFAULT_CONFIG;
      return actor.getAutoPayConfig();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 2,
  });

  return {
    config: data ?? DEFAULT_CONFIG,
    isLoading,
  };
}

function useUpdateAutoPayConfig() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: BackendAutoPayConfig) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateAutoPayConfig(config);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autoPayConfig"] });
    },
  });
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (val: boolean) => void;
  ocid: string;
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onToggle,
  ocid,
}: ToggleRowProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight flex items-center gap-1.5">
          {label}
          {disabled && <Lock className="h-3 w-3 text-muted-foreground" />}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        disabled={disabled}
        data-ocid={ocid}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}

export function AutoPayToggle() {
  const { config, isLoading } = useAutoPayConfig();
  const updateConfig = useUpdateAutoPayConfig();

  const hasLinkedMethod =
    config.defaultPayoutMethodId !== undefined &&
    config.defaultPayoutMethodId !== null;

  const handleToggle = async (
    field: "autoChargeOnSend" | "autoDepositOnReceive",
    value: boolean,
  ) => {
    const updated: BackendAutoPayConfig = { ...config, [field]: value };
    try {
      await updateConfig.mutateAsync(updated);
      toast.success("Auto-pay settings updated");
    } catch {
      toast.error("Failed to update auto-pay settings");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-5" data-ocid="autopay.loading_state">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-5" data-ocid="autopay.panel">
      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-xl bg-primary/8 border border-primary/15 px-3 py-2.5 mb-4">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 leading-snug">
          When enabled, payments are automatically charged from or deposited to
          your linked payment method — no manual steps required.
        </p>
      </div>

      {!hasLinkedMethod && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 border border-border px-3 py-2.5 mb-3">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Link a payment method in{" "}
            <a
              href="/payment-methods"
              className="text-primary underline underline-offset-2"
            >
              Payment Methods
            </a>{" "}
            to enable auto-pay.
          </p>
        </div>
      )}

      <div className="divide-y divide-border">
        <ToggleRow
          label="Auto-charge card on send"
          description="Automatically charge your linked card when you send a payment"
          checked={config.autoChargeOnSend}
          disabled={!hasLinkedMethod || updateConfig.isPending}
          onToggle={(val) => handleToggle("autoChargeOnSend", val)}
          ocid="autopay.charge_on_send_switch"
        />
        <ToggleRow
          label="Auto-deposit to bank on receive"
          description="Automatically deposit received funds to your linked bank account"
          checked={config.autoDepositOnReceive}
          disabled={!hasLinkedMethod || updateConfig.isPending}
          onToggle={(val) => handleToggle("autoDepositOnReceive", val)}
          ocid="autopay.deposit_on_receive_switch"
        />
      </div>

      {updateConfig.isPending && (
        <p
          className="text-xs text-muted-foreground mt-3 text-center"
          data-ocid="autopay.loading_state"
        >
          Saving…
        </p>
      )}
    </div>
  );
}
