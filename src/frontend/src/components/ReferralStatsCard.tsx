import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInviteCode, useReferralRewards } from "@/hooks/useInvite";
import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, Gift, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatRewardDate(nsBigint: bigint): string {
  const ms = Number(nsBigint / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReferralStatsCard() {
  const { rewards, isLoading } = useReferralRewards();
  const { inviteUrl, isLoading: linkLoading } = useInviteCode();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const totalEarnedCents = Number(rewards.totalEarned);
  const pendingCount = Number(rewards.pendingRewards);

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-5"
      data-ocid="referral_stats.card"
    >
      {/* Teal gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent rounded-2xl" />
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base leading-tight">
                Referral Rewards
              </h2>
              <p className="text-xs text-muted-foreground">
                Earn $5 for every friend who sends their first payment
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {isLoading ? (
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-14 w-32 rounded-xl" />
            <Skeleton className="h-14 w-24 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 min-w-[7rem]">
              <p className="text-xs text-primary/70 font-medium mb-0.5">
                Total Earned
              </p>
              <p
                className="font-display font-bold text-xl text-primary"
                data-ocid="referral_stats.total_earned"
              >
                {formatCents(totalEarnedCents)}
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-2.5 min-w-[7rem]">
                <p className="text-xs text-accent/70 font-medium mb-0.5">
                  Pending
                </p>
                <p
                  className="font-display font-bold text-xl text-accent"
                  data-ocid="referral_stats.pending_count"
                >
                  {pendingCount}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent paid rewards */}
        {isLoading ? (
          <div className="space-y-2 mb-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </div>
        ) : rewards.paidRewards.length > 0 ? (
          <div
            className="space-y-1.5 mb-4"
            data-ocid="referral_stats.rewards_list"
          >
            {rewards.paidRewards.slice(0, 5).map((reward, i) => (
              <div
                key={`${reward.inviteCode}-${i}`}
                data-ocid={`referral_stats.reward.item.${i + 1}`}
                className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2"
              >
                <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-success" />
                </div>
                <span className="flex-1 text-sm font-medium text-success">
                  {formatCents(Number(reward.amount))}
                </span>
                <span className="text-xs text-muted-foreground">
                  Referral Bonus
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {formatRewardDate(reward.paidAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-3 rounded-xl bg-muted/30"
            data-ocid="referral_stats.empty_state"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>No rewards yet — invite friends to start earning</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-9 bg-primary hover:bg-primary/90 font-display font-semibold text-xs"
            onClick={() => navigate({ to: "/profile" })}
            data-ocid="referral_stats.invite_button"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Invite Friends
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3 border-border"
            onClick={handleCopyLink}
            disabled={linkLoading || !inviteUrl}
            data-ocid="referral_stats.copy_link_button"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
