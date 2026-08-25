import { BankLinkForm } from "@/components/BankLinkForm";
import type { BankFormValues } from "@/components/BankLinkForm";
import { Badge } from "@/components/StatusBadge";
import { StripeCardForm } from "@/components/StripeCardForm";
import { stripePromise } from "@/components/StripeCardForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useCardControls,
  useDeleteVirtualCard,
  useFreezeCard,
  useGenerateVirtualCard,
  useRegenerateVirtualCard,
  useReportLostStolen,
  useSetCardControls,
  useUnfreezeCard,
  useVirtualCards,
} from "@/hooks/useCardControls";
import {
  type ExtendedPaymentMethod,
  usePaymentMethods,
} from "@/hooks/usePaymentMethods";
import { useStripe } from "@/hooks/useStripe";
import { cn } from "@/lib/utils";
import {
  Elements,
  useElements,
  useStripe as useStripeElements,
} from "@stripe/react-stripe-js";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Globe,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldOff,
  Smartphone,
  Trash2,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerStatus = "Verified" | "Pending" | "Failed" | "Unverified";

interface MockActivity {
  merchant: string;
  amount: number;
  date: string;
  type: "debit" | "credit";
}

// ─── Mock recent activity per card ───────────────────────────────────────────

const MOCK_ACTIVITIES: MockActivity[][] = [
  [
    { merchant: "Spotify Premium", amount: 9.99, date: "May 1", type: "debit" },
    { merchant: "Uber Eats", amount: 22.5, date: "Apr 29", type: "debit" },
    { merchant: "Netflix", amount: 15.49, date: "Apr 28", type: "debit" },
  ],
  [
    { merchant: "Amazon.com", amount: 47.8, date: "Apr 30", type: "debit" },
    { merchant: "Starbucks", amount: 6.75, date: "Apr 27", type: "debit" },
    { merchant: "Apple Store", amount: 0.99, date: "Apr 25", type: "debit" },
  ],
  [
    { merchant: "Steam Games", amount: 29.99, date: "Apr 28", type: "debit" },
    { merchant: "Target", amount: 63.12, date: "Apr 26", type: "debit" },
    {
      merchant: "Cashback Reward",
      amount: 5.0,
      date: "Apr 20",
      type: "credit",
    },
  ],
];

function getMockActivities(index: number): MockActivity[] {
  return MOCK_ACTIVITIES[index % MOCK_ACTIVITIES.length];
}

// ─── Helper: check expiry warning ─────────────────────────────────────────────

function isExpiringWithin30Days(expiry?: string): boolean {
  if (!expiry) return false;
  const [month, year] = expiry.split("/");
  if (!month || !year) return false;
  const expiryDate = new Date(
    2000 + Number.parseInt(year),
    Number.parseInt(month) - 1,
    1,
  );
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 30 && diffDays >= 0;
}

// ─── Verification badge ──────────────────────────────────────────────────────

function VerificationBadge({ status }: { status: VerStatus }) {
  if (status === "Verified") {
    return (
      <Badge variant="success" className="gap-1 text-[10px] px-2 py-0.5">
        <BadgeCheck className="h-3 w-3" />
        Verified
      </Badge>
    );
  }
  if (status === "Pending") {
    return (
      <Badge variant="warning" className="gap-1 text-[10px] px-2 py-0.5">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }
  if (status === "Failed") {
    return (
      <Badge variant="destructive" className="gap-1 text-[10px] px-2 py-0.5">
        <AlertCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="pending" className="gap-1 text-[10px] px-2 py-0.5">
      <ShieldAlert className="h-3 w-3" />
      Unverified
    </Badge>
  );
}

// ─── Styled card visual ───────────────────────────────────────────────────────

interface CardVisualProps {
  method: ExtendedPaymentMethod;
  isFrozen?: boolean;
  isReportedLost?: boolean;
}

function CardVisual({ method, isFrozen, isReportedLost }: CardVisualProps) {
  const isBank = method.type === "bank";
  const expiryWarning = !isBank && isExpiringWithin30Days(method.expiry);

  return (
    <div className="relative">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-5 h-36 flex flex-col justify-between transition-all duration-500",
          isBank
            ? "bg-gradient-to-br from-secondary to-muted/60"
            : method.isDefault
              ? "bg-gradient-to-br from-primary to-primary/60"
              : "bg-gradient-to-br from-card to-muted/30 border border-border",
          (isFrozen || isReportedLost) && "opacity-60 grayscale",
        )}
      >
        {/* Background decorative circles */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-2 top-8 w-14 h-14 rounded-full bg-white/5 pointer-events-none" />

        {/* Top row */}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span
              className={cn(
                "text-xs font-bold tracking-widest uppercase",
                method.isDefault && !isBank
                  ? "text-primary-foreground/90"
                  : "text-muted-foreground",
              )}
            >
              {isBank ? "Bank Account" : (method.brand ?? "Credit / Debit")}
            </span>
            {method.isDefault && (
              <p
                className={cn(
                  "text-[9px] mt-0.5",
                  method.isDefault && !isBank
                    ? "text-primary-foreground/60"
                    : "text-muted-foreground",
                )}
              >
                PRIMARY
              </p>
            )}
          </div>
          {isBank ? (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          ) : (
            <div
              className={cn(
                "w-10 h-7 rounded-md flex items-center justify-center",
                method.isDefault ? "bg-primary-foreground/20" : "bg-muted/40",
              )}
            >
              <CreditCard
                className={cn(
                  "h-4 w-4",
                  method.isDefault
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                )}
              />
            </div>
          )}
        </div>

        {/* Chip simulation for cards */}
        {!isBank && (
          <div className="absolute left-5 top-12 w-7 h-5 rounded bg-accent/30 border border-accent/20" />
        )}

        {/* Bottom row */}
        <div className="relative z-10">
          <p
            className={cn(
              "font-mono text-sm tracking-[0.2em]",
              method.isDefault && !isBank
                ? "text-primary-foreground"
                : "text-foreground",
            )}
          >
            •••• •••• •••• {method.last4}
          </p>
          {!isBank && method.expiry && (
            <div className="flex items-center gap-2 mt-1">
              <p
                className={cn(
                  "text-[10px] font-mono",
                  method.isDefault
                    ? "text-primary-foreground/60"
                    : "text-muted-foreground",
                )}
              >
                EXP {method.expiry}
              </p>
              {expiryWarning && (
                <span className="text-[9px] bg-warning/20 text-warning px-1.5 py-0.5 rounded font-semibold">
                  EXPIRING SOON
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Frozen overlay */}
      <AnimatePresence>
        {(isFrozen || isReportedLost) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl flex items-center justify-center bg-background/60 backdrop-blur-sm border-2 border-destructive/40"
          >
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-1">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-xs font-bold text-destructive">
                {isReportedLost ? "REPORTED LOST" : "FROZEN"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Virtual card display ─────────────────────────────────────────────────────

interface VirtualCardProps {
  pan: string;
  cvv: string;
  expiry: string;
  cardId: string;
  basePmId: string;
}

function VirtualCardDisplay({
  pan,
  cvv,
  expiry,
  cardId,
  basePmId,
}: VirtualCardProps) {
  const [revealCvv, setRevealCvv] = useState(false);
  const deleteVirtualCard = useDeleteVirtualCard();
  const regenerateVirtualCard = useRegenerateVirtualCard();

  const fullPan = `•••• •••• •••• ${pan}`;

  const copyPan = () => {
    navigator.clipboard.writeText(`•••• •••• •••• ${pan}`).catch(() => {});
    toast.success("Virtual card number copied");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5 h-36 bg-gradient-to-br from-primary/70 to-accent/50 flex flex-col justify-between"
      data-ocid="virtual_card.card"
    >
      {/* BG decoration */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-6 bottom-4 w-10 h-10 rounded-full bg-white/5 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-[9px] font-bold tracking-widest text-primary-foreground/70 uppercase">
            Virtual Card
          </span>
          <p className="text-[10px] text-primary-foreground/50 mt-0.5">
            Online payments only
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-4 w-4 text-primary-foreground/70" />
        </div>
      </div>

      <div className="relative z-10">
        <p className="font-mono text-sm tracking-[0.2em] text-primary-foreground">
          {fullPan}
        </p>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-[10px] font-mono text-primary-foreground/60">
            EXP {expiry}
          </p>
          <button
            type="button"
            className="text-[10px] font-mono text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            onClick={() => setRevealCvv((v) => !v)}
            data-ocid="virtual_card.cvv_toggle"
          >
            CVV: {revealCvv ? cvv : "•••"}
          </button>
        </div>
      </div>

      {/* Actions row */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          title="Copy card number"
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          onClick={copyPan}
          data-ocid="virtual_card.copy_button"
        >
          <Copy className="h-3.5 w-3.5 text-primary-foreground/80" />
        </button>
        <button
          type="button"
          title="Regenerate card"
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() =>
            regenerateVirtualCard.mutate(
              { cardId, basePmId },
              {
                onSuccess: () => toast.success("Virtual card regenerated"),
              },
            )
          }
          data-ocid="virtual_card.regenerate_button"
        >
          <RefreshCw className="h-3.5 w-3.5 text-primary-foreground/80" />
        </button>
        <button
          type="button"
          title="Delete virtual card"
          className="p-1.5 rounded-lg bg-destructive/30 hover:bg-destructive/50 transition-colors"
          onClick={() =>
            deleteVirtualCard.mutate(
              { cardId, basePmId },
              {
                onSuccess: () => toast.success("Virtual card deleted"),
              },
            )
          }
          data-ocid="virtual_card.delete_button"
        >
          <Trash2 className="h-3.5 w-3.5 text-primary-foreground/80" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Card controls section ───────────────────────────────────────────────────

interface CardControlsProps {
  method: ExtendedPaymentMethod;
  index: number;
}

function CardControlsSection({ method, index }: CardControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const [reportLostOpen, setReportLostOpen] = useState(false);
  const [limitInput, setLimitInput] = useState("");

  const { data: controls } = useCardControls(method.id);
  const freezeCard = useFreezeCard();
  const unfreezeCard = useUnfreezeCard();
  const setCardControls = useSetCardControls();
  const reportLostStolen = useReportLostStolen();
  const generateVirtualCard = useGenerateVirtualCard();
  const { data: virtualCards = [] } = useVirtualCards(method.id);

  const isFrozen = controls?.isFrozen ?? false;
  const isReportedLost = !!controls?.reportedLostAt;
  const activities = getMockActivities(index);

  const handleFreezeToggle = async () => {
    if (isFrozen) {
      await unfreezeCard.mutateAsync(method.id);
      toast.success("Card unfrozen — transactions enabled");
    } else {
      await freezeCard.mutateAsync(method.id);
      toast.success("Card frozen — all transactions blocked");
    }
  };

  const handleToggle = async (
    field:
      | "onlinePaymentsEnabled"
      | "internationalEnabled"
      | "contactlessEnabled"
      | "atmWithdrawalsEnabled",
    value: boolean,
  ) => {
    await setCardControls.mutateAsync({
      paymentMethodId: method.id,
      [field]: value,
    });
    toast.success("Card setting updated");
  };

  const handleLimitSave = async () => {
    const cents = Math.round(Number.parseFloat(limitInput) * 100);
    if (Number.isNaN(cents) || cents <= 0) {
      toast.error("Enter a valid limit amount");
      return;
    }
    await setCardControls.mutateAsync({
      paymentMethodId: method.id,
      dailyLimitCents: cents,
    });
    toast.success(`Daily limit set to $${limitInput}`);
    setLimitInput("");
  };

  const handleReportLost = async () => {
    await reportLostStolen.mutateAsync(method.id);
    toast.error("Card reported as lost/stolen — permanently deactivated");
    setReportLostOpen(false);
  };

  if (method.type === "bank") {
    return (
      <div className="space-y-3">
        <CardVisual method={method} />
        <ActivityFeed activities={activities} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <CardVisual
        method={method}
        isFrozen={isFrozen}
        isReportedLost={isReportedLost}
      />

      {/* Expiry warning */}
      {isExpiringWithin30Days(method.expiry) && (
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/25 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
          <p className="text-xs text-warning font-medium">
            This card expires soon. Consider updating your payment method.
          </p>
        </div>
      )}

      {/* Reported lost banner */}
      {isReportedLost && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/25 px-3 py-2">
          <ShieldOff className="h-3.5 w-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive font-medium">
            Reported lost/stolen — card permanently deactivated
          </p>
        </div>
      )}

      {/* Quick freeze bar */}
      {!isReportedLost && (
        <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                isFrozen ? "bg-destructive/15" : "bg-primary/10",
              )}
            >
              {isFrozen ? (
                <Lock className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <Zap className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold">
                {isFrozen ? "Card frozen" : "Card active"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isFrozen
                  ? "No transactions allowed"
                  : "All transactions enabled"}
              </p>
            </div>
          </div>
          <Switch
            checked={isFrozen}
            onCheckedChange={handleFreezeToggle}
            disabled={
              freezeCard.isPending || unfreezeCard.isPending || isReportedLost
            }
            className={isFrozen ? "data-[state=checked]:bg-destructive" : ""}
            data-ocid={`card_controls.freeze_toggle.${index + 1}`}
          />
        </div>
      )}

      {/* Accordion: card controls */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2.5 bg-card hover:bg-muted/30 transition-colors"
          onClick={() => setExpanded((v) => !v)}
          data-ocid={`card_controls.accordion_toggle.${index + 1}`}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">Card Controls</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 space-y-3 bg-muted/20 border-t border-border">
                {/* Toggle controls */}
                {[
                  {
                    icon: Globe,
                    label: "Online Payments",
                    desc: "E-commerce and digital purchases",
                    field: "onlinePaymentsEnabled" as const,
                    value: controls?.onlinePaymentsEnabled ?? true,
                    ocid: `card_controls.online_toggle.${index + 1}`,
                  },
                  {
                    icon: Globe,
                    label: "International Transactions",
                    desc: "Payments outside your home country",
                    field: "internationalEnabled" as const,
                    value: controls?.internationalEnabled ?? true,
                    ocid: `card_controls.intl_toggle.${index + 1}`,
                  },
                  {
                    icon: Wifi,
                    label: "Contactless (NFC)",
                    desc: "Tap to pay at terminals",
                    field: "contactlessEnabled" as const,
                    value: controls?.contactlessEnabled ?? true,
                    ocid: `card_controls.contactless_toggle.${index + 1}`,
                  },
                  {
                    icon: Smartphone,
                    label: "ATM Withdrawals",
                    desc: "Cash withdrawals at ATMs",
                    field: "atmWithdrawalsEnabled" as const,
                    value: controls?.atmWithdrawalsEnabled ?? true,
                    ocid: `card_controls.atm_toggle.${index + 1}`,
                  },
                ].map(({ icon: Icon, label, desc, field, value, ocid }) => (
                  <div
                    key={field}
                    className="flex items-center justify-between gap-2 py-1"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {desc}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(v) => handleToggle(field, v)}
                      disabled={setCardControls.isPending || isReportedLost}
                      data-ocid={ocid}
                    />
                  </div>
                ))}

                {/* Daily limit */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-medium">
                    Daily Limit
                    <span className="ml-2 text-muted-foreground font-normal">
                      Current: $
                      {(
                        (controls?.dailyLimitCents ?? 500_000) / 100
                      ).toLocaleString()}
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      className="h-8 text-xs"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      data-ocid={`card_controls.limit_input.${index + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs px-3"
                      onClick={handleLimitSave}
                      disabled={!limitInput || setCardControls.isPending}
                      data-ocid={`card_controls.limit_save_button.${index + 1}`}
                    >
                      Set
                    </Button>
                  </div>
                </div>

                {/* Report lost/stolen */}
                {!isReportedLost && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                      onClick={() => setReportLostOpen(true)}
                      data-ocid={`card_controls.report_lost_button.${index + 1}`}
                    >
                      <ShieldOff className="h-3 w-3" />
                      Report as Lost / Stolen
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Virtual card section */}
      {!isReportedLost && (
        <div className="space-y-2">
          {virtualCards.length > 0 ? (
            virtualCards.map((vc) => (
              <VirtualCardDisplay
                key={vc.id}
                pan={vc.pan}
                cvv={vc.cvv}
                expiry={vc.expiry}
                cardId={vc.id}
                basePmId={method.id}
              />
            ))
          ) : (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group"
              onClick={() =>
                generateVirtualCard.mutate(method.id, {
                  onSuccess: () => toast.success("Virtual card created!"),
                })
              }
              disabled={generateVirtualCard.isPending}
              data-ocid={`virtual_card.create_button.${index + 1}`}
            >
              {generateVirtualCard.isPending ? (
                <Spinner size="sm" className="text-primary" />
              ) : (
                <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              )}
              Create Virtual Card
            </button>
          )}
        </div>
      )}

      {/* Activity feed */}
      <ActivityFeed activities={activities} />

      {/* Report lost confirm modal */}
      <ConfirmModal
        open={reportLostOpen}
        onOpenChange={(open) => setReportLostOpen(open)}
        title="Report card as lost or stolen?"
        description="This will permanently deactivate the card and block all pending transactions. This action cannot be undone. You will need to add a new card."
        confirmLabel="Report & Deactivate"
        isDestructive
        onConfirm={handleReportLost}
        isLoading={reportLostStolen.isPending}
        data-ocid={`card_controls.report_lost.dialog.${index + 1}`}
      />
    </div>
  );
}

// ─── Recent activity mini-feed ────────────────────────────────────────────────

function ActivityFeed({ activities }: { activities: MockActivity[] }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-0.5">
        Recent Activity
      </p>
      {activities.map((a) => (
        <div
          key={`${a.merchant}-${a.date}`}
          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{a.merchant}</p>
            <p className="text-[10px] text-muted-foreground">{a.date}</p>
          </div>
          <span
            className={cn(
              "text-xs font-semibold font-mono shrink-0",
              a.type === "credit" ? "text-success" : "text-foreground",
            )}
          >
            {a.type === "credit" ? "+" : "−"}${a.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Pending bank verification banner ────────────────────────────────────────

interface PendingBannerProps {
  method: ExtendedPaymentMethod;
  onVerify: () => void;
}

function PendingVerificationBanner({ method, onVerify }: PendingBannerProps) {
  if (method.verificationStatus !== "Pending") return null;
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-accent/10 border border-accent/25 px-3 py-2.5 mt-2">
      <AlertTriangle className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-accent font-medium">
          Pending micro-deposit verification
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Check your account for 2 small deposits to confirm ownership.
        </p>
      </div>
      <button
        type="button"
        className="text-[10px] font-semibold text-accent hover:text-accent/80 whitespace-nowrap transition-smooth"
        onClick={onVerify}
        data-ocid={`payment_methods.verify_now_button.${method.id}`}
      >
        Verify now →
      </button>
    </div>
  );
}

// ─── Micro-deposit verification modal ────────────────────────────────────────

function MicroDepositVerifier({ onClose }: { onClose: () => void }) {
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleVerify = () => {
    if (!amount1 || !amount2) {
      toast.error("Please enter both deposit amounts");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      toast.success("Bank account verified successfully!");
      onClose();
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-6 gap-3">
        <Spinner size="md" className="text-primary" />
        <p className="text-sm text-muted-foreground">Verifying deposits…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-muted-foreground">
        Enter the two micro-deposit amounts (in cents) that appeared in your
        bank statement. Example: if you saw{" "}
        <span className="text-foreground font-mono">$0.32</span> and{" "}
        <span className="text-foreground font-mono">$0.17</span>, enter{" "}
        <span className="text-foreground font-mono">32</span> and{" "}
        <span className="text-foreground font-mono">17</span>.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="deposit-1">First deposit (¢)</Label>
          <Input
            id="deposit-1"
            placeholder="e.g. 32"
            inputMode="numeric"
            value={amount1}
            onChange={(e) => setAmount1(e.target.value.replace(/\D/g, ""))}
            data-ocid="micro_deposit.amount1_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deposit-2">Second deposit (¢)</Label>
          <Input
            id="deposit-2"
            placeholder="e.g. 17"
            inputMode="numeric"
            value={amount2}
            onChange={(e) => setAmount2(e.target.value.replace(/\D/g, ""))}
            data-ocid="micro_deposit.amount2_input"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          data-ocid="micro_deposit.cancel_button"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!amount1 || !amount2}
          onClick={handleVerify}
          data-ocid="micro_deposit.confirm_button"
        >
          Confirm deposits
        </Button>
      </div>
    </div>
  );
}

// ─── Add Card form (inside Stripe Elements) ───────────────────────────────────

interface AddCardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function AddCardFormInner({ onSuccess, onCancel }: AddCardFormProps) {
  const stripeElements = useStripeElements();
  const elements = useElements();
  const { createSetupIntent, confirmStripeCard } = usePaymentMethods();
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripeElements || !elements) {
      toast.error("Stripe not loaded. Please refresh.");
      return;
    }
    const cardElement = elements.getElement("card");
    if (!cardElement) {
      toast.error("Card element not found.");
      return;
    }
    setIsProcessing(true);
    setCardError(null);
    try {
      const intent = await createSetupIntent.mutateAsync();
      const result = await stripeElements.confirmCardSetup(
        intent.client_secret,
        { payment_method: { card: cardElement } },
      );
      if (result.error) {
        setCardError(result.error.message ?? "Card setup failed");
        return;
      }
      const pm = result.setupIntent.payment_method;
      const pmId = typeof pm === "string" ? pm : (pm?.id ?? "pm_unknown");
      await confirmStripeCard.mutateAsync({
        stripePaymentMethodId: pmId,
        displayLabel: "Card",
        last4: "****",
        expiry: "**/**",
      });
      toast.success("Card added successfully!");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add card";
      setCardError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <StripeCardForm withProvider={false} errorMessage={cardError} />
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isProcessing}
          data-ocid="add_card.cancel_button"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={isProcessing}
          onClick={handleSubmit}
          data-ocid="add_card.submit_button"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" className="text-primary-foreground" />
              Processing…
            </span>
          ) : (
            "Add card"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PaymentMethodsPage() {
  const {
    methods,
    isLoading,
    confirmStripeBank,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentMethods();

  const { stripe } = useStripe();

  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [verifyMethod, setVerifyMethod] =
    useState<ExtendedPaymentMethod | null>(null);

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(id);
      toast.success("Default payment method updated");
    } catch {
      toast.error("Failed to update default payment method");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removePaymentMethod.mutateAsync(deleteId);
      toast.success("Payment method removed");
      setDeleteId(null);
    } catch {
      toast.error("Failed to remove payment method");
    }
  };

  const handleBankSubmit = async (values: BankFormValues) => {
    const last4 = values.accountNumber.slice(-4);
    const label = `${values.accountType === "checking" ? "Checking" : "Savings"} ••${last4}`;
    const fakePmId = `ba_sim_${Date.now()}`;
    try {
      await confirmStripeBank.mutateAsync({
        stripePaymentMethodId: fakePmId,
        displayLabel: label,
        last4,
        holderName: values.holderName,
      });
      toast.success(
        "Bank account linked! Verification deposits are on their way.",
      );
      setAddBankOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to link bank account";
      toast.error(msg);
    }
  };

  const stripeReady = stripe !== null;

  return (
    <div className="space-y-6" data-ocid="payment_methods.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight">
            Payment Methods
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your cards, banks, and card controls like Revolut
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setAddBankOpen(true)}
            data-ocid="payment_methods.add_bank_button"
          >
            <Building2 className="h-4 w-4" />
            Link bank
          </Button>
          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setAddCardOpen(true)}
            disabled={!stripeReady}
            data-ocid="payment_methods.add_card_button"
          >
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="payment_methods.loading_state"
        >
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : methods.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payment methods"
          description="Add a card or bank account to start sending and receiving money instantly."
          action={{
            label: "Add a card",
            onClick: () => setAddCardOpen(true),
          }}
          data-ocid="payment_methods.empty_state"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {methods.map((method, i) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-4 space-y-3 hover:shadow-elevated transition-smooth"
              data-ocid={`payment_methods.item.${i + 1}`}
            >
              {/* Card with controls */}
              <CardControlsSection method={method} index={i} />

              {/* Info row */}
              <div className="flex items-start justify-between gap-2 pt-1">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {method.brand ?? method.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {method.type === "bank" ? "Bank account" : "Card"} ••••{" "}
                    {method.last4}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {method.isDefault && (
                    <Badge variant="default" className="gap-1 text-[10px]">
                      <CheckCircle className="h-3 w-3" />
                      Default
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-muted transition-smooth"
                        aria-label="More options"
                        data-ocid={`payment_methods.item.${i + 1}.dropdown_menu`}
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-popover border-border"
                    >
                      {!method.isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleSetDefault(method.id)}
                          data-ocid={`payment_methods.item.${i + 1}.set_default_button`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Set as default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(method.id)}
                        data-ocid={`payment_methods.item.${i + 1}.delete_button`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Verification status */}
              <div className="flex items-center justify-between">
                <VerificationBadge status={method.verificationStatus} />
              </div>

              {/* Pending banner for bank */}
              {method.type === "bank" && (
                <PendingVerificationBanner
                  method={method}
                  onVerify={() => setVerifyMethod(method)}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Security note */}
      {!isLoading && methods.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 text-xs text-muted-foreground pt-2"
        >
          <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          All payment data is tokenized and encrypted. PayFlow never stores raw
          card numbers.
        </motion.div>
      )}

      <Separator className="opacity-30" />

      {/* Add Card modal */}
      <Modal
        open={addCardOpen}
        onOpenChange={(open) => setAddCardOpen(open)}
        title="Add a card"
        description="Enter your card details securely via Stripe. We never see your raw card number."
        data-ocid="payment_methods.add_card.dialog"
        className="sm:max-w-sm"
      >
        <Elements stripe={stripePromise}>
          <AddCardFormInner
            onSuccess={() => setAddCardOpen(false)}
            onCancel={() => setAddCardOpen(false)}
          />
        </Elements>
      </Modal>

      {/* Add Bank modal */}
      <Modal
        open={addBankOpen}
        onOpenChange={(open) => setAddBankOpen(open)}
        title="Link a bank account"
        description="Connect your bank via ACH. Verification takes 1–3 business days."
        data-ocid="payment_methods.add_bank.dialog"
      >
        <BankLinkForm
          onSubmit={handleBankSubmit}
          onCancel={() => setAddBankOpen(false)}
          isLoading={confirmStripeBank.isPending}
        />
      </Modal>

      {/* Micro-deposit verification modal */}
      <Modal
        open={!!verifyMethod}
        onOpenChange={(open) => {
          if (!open) setVerifyMethod(null);
        }}
        title="Verify bank account"
        description="Confirm the two small deposits that appeared in your bank statement."
        data-ocid="payment_methods.verify.dialog"
      >
        <MicroDepositVerifier onClose={() => setVerifyMethod(null)} />
      </Modal>

      {/* Confirm remove */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Remove payment method"
        description="This card or account will be unlinked from your PayFlow wallet. Any scheduled payments using this method may fail."
        confirmLabel="Remove"
        isDestructive
        onConfirm={handleDelete}
        isLoading={removePaymentMethod.isPending}
        data-ocid="payment_methods.delete.dialog"
      />
    </div>
  );
}
