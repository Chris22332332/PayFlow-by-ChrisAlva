import {
  BillingInterval,
  SubscriptionStatus,
  SubscriptionTier,
} from "@/backend";
import type { Subscription } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  Crown,
  ExternalLink,
  Rocket,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Plan Data ────────────────────────────────────────────────────────────────

export type PlanId = "free" | "plus" | "pro" | "business" | "enterprise";

interface Plan {
  id: PlanId;
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  tagline: string;
  icon: React.ElementType;
  features: string[];
  color: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    tier: SubscriptionTier.free,
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    tagline: "Basic wallet & transfers",
    icon: Star,
    features: [
      "P2P transfers",
      "Multi-currency wallet",
      "Transaction history",
      "Invite links",
    ],
    color: "text-muted-foreground",
  },
  {
    id: "plus",
    tier: SubscriptionTier.plus,
    name: "Plus",
    monthlyPrice: 4.99,
    annualPrice: 49.99,
    tagline: "For active senders",
    icon: Sparkles,
    features: [
      "Everything in Free",
      "Priority support",
      "Higher limits ($5,000/tx)",
      "2% cashback on transfers",
    ],
    color: "text-primary",
    highlight: true,
  },
  {
    id: "pro",
    tier: SubscriptionTier.pro,
    name: "Pro",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    tagline: "For power users",
    icon: Rocket,
    features: [
      "Everything in Plus",
      "Analytics dashboard",
      "Recurring transfers",
      "Group splits",
      "3% cashback on transfers",
    ],
    color: "text-accent",
  },
  {
    id: "business",
    tier: SubscriptionTier.business,
    name: "Business",
    monthlyPrice: 19.99,
    annualPrice: 199.99,
    tagline: "For teams & merchants",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Business invoicing",
      "Merchant payments",
      "API access",
      "Team accounts (up to 5)",
    ],
    color: "text-[oklch(0.7_0.18_310)]",
  },
  {
    id: "enterprise",
    tier: SubscriptionTier.enterprise,
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    tagline: "Custom pricing",
    icon: Crown,
    features: [
      "Everything in Business",
      "SLA guarantee",
      "Dedicated account manager",
      "Custom integrations",
    ],
    color: "text-[oklch(0.72_0.2_40)]",
  },
];

const TIER_ORDER: PlanId[] = ["free", "plus", "pro", "business", "enterprise"];

function tierRank(tier: SubscriptionTier): number {
  const map: Record<SubscriptionTier, number> = {
    [SubscriptionTier.free]: 0,
    [SubscriptionTier.plus]: 1,
    [SubscriptionTier.pro]: 2,
    [SubscriptionTier.business]: 3,
    [SubscriptionTier.enterprise]: 4,
  };
  return map[tier];
}

function currentTierRank(sub: Subscription | null): number {
  if (
    !sub ||
    sub.status === SubscriptionStatus.cancelled ||
    sub.status === SubscriptionStatus.expired
  ) {
    return 0; // treat as free
  }
  return tierRank(sub.tier);
}

// ─── Tier Badge ───────────────────────────────────────────────────────────────

const TIER_BADGE_STYLES: Record<PlanId, string> = {
  free: "bg-muted text-muted-foreground border-border",
  plus: "bg-primary/10 text-primary border-primary/30",
  pro: "bg-accent/10 text-accent border-accent/30",
  business:
    "bg-[oklch(0.7_0.18_310)]/10 text-[oklch(0.7_0.18_310)] border-[oklch(0.7_0.18_310)]/30",
  enterprise:
    "bg-[oklch(0.72_0.2_40)]/10 text-[oklch(0.72_0.2_40)] border-[oklch(0.72_0.2_40)]/30",
};

export function TierBadge({
  tier,
  className,
}: { tier: PlanId; className?: string }) {
  const plan = PLANS.find((p) => p.id === tier);
  if (!plan) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
        TIER_BADGE_STYLES[tier],
        className,
      )}
    >
      <plan.icon className="h-3 w-3" />
      {plan.name}
    </span>
  );
}

export function planIdFromTier(tier: SubscriptionTier): PlanId {
  return tier as PlanId;
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  isAnnual: boolean;
  currentSub: Subscription | null;
  onUpgrade: (plan: Plan) => void;
  onDowngrade: (plan: Plan) => void;
  onCancel: () => void;
}

function PlanCard({
  plan,
  isAnnual,
  currentSub,
  onUpgrade,
  onDowngrade,
  onCancel,
}: PlanCardProps) {
  const activeTierRank = currentTierRank(currentSub);
  const thisRank = TIER_ORDER.indexOf(plan.id);
  const isCurrentPlan =
    currentSub &&
    currentSub.tier === plan.tier &&
    (currentSub.status === SubscriptionStatus.active ||
      currentSub.status === SubscriptionStatus.trialing);
  const isFreeAndActive =
    plan.id === "free" &&
    (currentSub === null ||
      currentSub.status === SubscriptionStatus.cancelled ||
      currentSub.status === SubscriptionStatus.expired);
  const isActive = isCurrentPlan || isFreeAndActive;
  const isHigher = thisRank > activeTierRank;
  const isLower = thisRank < activeTierRank;

  const displayPrice =
    plan.monthlyPrice === null
      ? null
      : isAnnual
        ? plan.annualPrice
        : plan.monthlyPrice;

  const Icon = plan.icon;

  return (
    <Card
      className={cn(
        "relative flex flex-col p-6 transition-smooth border",
        isActive
          ? "border-primary shadow-elevated ring-1 ring-primary/40"
          : plan.highlight
            ? "border-primary/30 shadow-elevated"
            : "border-border",
        "bg-card",
      )}
      data-ocid={`subscriptions.plan_card.${plan.id}`}
    >
      {/* Current Plan badge */}
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-md">
            <Check className="h-3 w-3" />
            Current Plan
          </span>
        </div>
      )}

      {/* Popular badge */}
      {plan.highlight && !isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-muted/50", plan.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg">
              {plan.name}
            </h3>
            <p className="text-xs text-muted-foreground">{plan.tagline}</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        {plan.monthlyPrice === null ? (
          <div className="text-2xl font-display font-bold text-foreground">
            Contact Sales
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold text-foreground">
              ${displayPrice === 0 ? "0" : displayPrice?.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm">
              {displayPrice === 0 ? "" : isAnnual ? "/yr" : "/mo"}
            </span>
          </div>
        )}
        {isAnnual && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
          <p className="text-xs text-primary mt-1">
            ${(plan.annualPrice! / 12).toFixed(2)}/mo billed annually
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isActive ? (
        <div className="space-y-2">
          {plan.id !== "free" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                data-ocid="subscriptions.manage_billing_button"
                onClick={() =>
                  window.open("https://billing.stripe.com/p/login", "_blank")
                }
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Manage Billing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                data-ocid={`subscriptions.cancel_button.${plan.id}`}
                onClick={onCancel}
              >
                <X className="h-3 w-3 mr-2" />
                Cancel Plan
              </Button>
            </>
          )}
          {plan.id === "free" && (
            <div className="text-center text-xs text-muted-foreground py-2">
              No billing required
            </div>
          )}
        </div>
      ) : plan.id === "enterprise" ? (
        <Button
          variant="outline"
          className="w-full"
          data-ocid="subscriptions.contact_sales_button"
          onClick={() => window.open("mailto:sales@payflow.app", "_blank")}
        >
          Contact Sales
        </Button>
      ) : isHigher ? (
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
          data-ocid={`subscriptions.upgrade_button.${plan.id}`}
          onClick={() => onUpgrade(plan)}
        >
          Upgrade to {plan.name}
        </Button>
      ) : isLower ? (
        <Button
          variant="outline"
          className="w-full"
          data-ocid={`subscriptions.downgrade_button.${plan.id}`}
          onClick={() => onDowngrade(plan)}
        >
          Downgrade to {plan.name}
        </Button>
      ) : null}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();
  const [isAnnual, setIsAnnual] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmDowngrade, setConfirmDowngrade] = useState<Plan | null>(null);

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubscription();
    },
    enabled: !!actor && !isFetching,
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ plan, annual }: { plan: Plan; annual: boolean }) => {
      if (!actor) throw new Error("Not connected");
      const interval = annual
        ? BillingInterval.annual
        : BillingInterval.monthly;
      const result = await actor.createSubscriptionCheckout(
        plan.tier,
        interval,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (err: Error) => {
      toast.error("Checkout failed", { description: err.message });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.cancelSubscription();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Subscription cancelled", {
        description:
          "You'll retain access until the end of your billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setCancelOpen(false);
    },
    onError: (err: Error) => {
      toast.error("Cancellation failed", { description: err.message });
    },
  });

  function handleUpgrade(plan: Plan) {
    checkoutMutation.mutate({ plan, annual: isAnnual });
  }

  function handleDowngrade(plan: Plan) {
    setConfirmDowngrade(plan);
  }

  function handleDowngradeConfirm() {
    if (!confirmDowngrade) return;
    checkoutMutation.mutate({ plan: confirmDowngrade, annual: isAnnual });
    setConfirmDowngrade(null);
  }

  const currentPeriodEndMs = subscription?.currentPeriodEnd
    ? Number(subscription.currentPeriodEnd) / 1_000_000
    : null;
  const periodEndDate = currentPeriodEndMs
    ? new Date(currentPeriodEndMs).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8 pb-10" data-ocid="subscriptions.page">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="h-6 w-6 text-accent" />
          <h1 className="font-display font-bold text-3xl text-foreground">
            PayFlow Subscriptions
          </h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that's right for you. Upgrade or downgrade any time.
        </p>

        {/* Active subscription info */}
        {subscription &&
          subscription.status === SubscriptionStatus.active &&
          periodEndDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Current period ends{" "}
              <span className="text-foreground font-medium">
                {periodEndDate}
              </span>
            </p>
          )}
      </div>

      {/* Billing Toggle */}
      <div
        className="flex items-center justify-center"
        data-ocid="subscriptions.billing_toggle"
      >
        <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-smooth",
              !isAnnual
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            data-ocid="subscriptions.monthly_tab"
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-smooth",
              isAnnual
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            data-ocid="subscriptions.annual_tab"
          >
            Annual
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PLANS.map((p) => (
            <Skeleton
              key={p.id}
              className="h-96 rounded-xl"
              data-ocid="subscriptions.loading_state"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              currentSub={subscription ?? null}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
              onCancel={() => setCancelOpen(true)}
            />
          ))}
        </div>
      )}

      {/* FAQ / Info strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          {
            title: "Instant Activation",
            body: "Your plan activates the moment payment clears.",
          },
          {
            title: "Cancel Anytime",
            body: "No long-term contracts. Cancel from your plan card.",
          },
          {
            title: "Secure Billing",
            body: "Powered by Stripe. Card details never touch our servers.",
          },
        ].map(({ title, body }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border"
          >
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent data-ocid="subscriptions.cancel_dialog">
          <DialogHeader>
            <DialogTitle>Cancel your subscription?</DialogTitle>
            <DialogDescription>
              You'll keep access until the end of your current billing period
              {periodEndDate ? ` (${periodEndDate})` : ""}. After that, your
              account reverts to the Free plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              data-ocid="subscriptions.cancel_dialog_cancel_button"
            >
              Keep Plan
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              data-ocid="subscriptions.cancel_dialog_confirm_button"
            >
              {cancelMutation.isPending ? "Cancelling…" : "Yes, Cancel Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Confirmation Dialog */}
      <Dialog
        open={!!confirmDowngrade}
        onOpenChange={() => setConfirmDowngrade(null)}
      >
        <DialogContent data-ocid="subscriptions.downgrade_dialog">
          <DialogHeader>
            <DialogTitle>Downgrade to {confirmDowngrade?.name}?</DialogTitle>
            <DialogDescription>
              You'll lose access to features exclusive to your current plan at
              the end of the current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDowngrade(null)}
              data-ocid="subscriptions.downgrade_cancel_button"
            >
              Keep Current Plan
            </Button>
            <Button
              onClick={handleDowngradeConfirm}
              disabled={checkoutMutation.isPending}
              data-ocid="subscriptions.downgrade_confirm_button"
            >
              {checkoutMutation.isPending
                ? "Redirecting…"
                : `Downgrade to ${confirmDowngrade?.name}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
