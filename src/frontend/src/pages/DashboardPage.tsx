import type { Currency } from "@/backend.d";
import { AutoPayToggle } from "@/components/AutoPayToggle";
import { CurrencyBalancePill } from "@/components/CurrencyBalancePill";
import { DashboardCard } from "@/components/DashboardCard";
import { ReferralStatsCard } from "@/components/ReferralStatsCard";
import { Badge } from "@/components/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityFeed } from "@/hooks/useActivity";
import { useBalance } from "@/hooks/useBalance";
import { useInviteCode, useInviteStats } from "@/hooks/useInvite";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useGetProfile } from "@/hooks/useProfile";
import { useSavingsGoals } from "@/hooks/useSavings";
import { useTransactions } from "@/hooks/useTransactions";
import {
  ALL_CURRENCIES,
  formatCurrencyDisplay,
  getCurrencySymbol,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ActivityItem, CurrencyCode, Transaction } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Gift,
  Globe,
  Link,
  PiggyBank,
  Plus,
  QrCode,
  Receipt,
  Send,
  Share2,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 1000 * 60 * 60 * 24)
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (diff < 1000 * 60 * 60 * 48)
    return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isReferralBonus(tx: Transaction): boolean {
  return (
    tx.description?.toLowerCase().includes("referral") ||
    tx.description?.toLowerCase().includes("bonus") ||
    tx.counterparty?.toLowerCase().includes("referral") ||
    false
  );
}

const CURRENCY_LABELS: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function TxIcon({
  type,
  isReferral,
}: { type: Transaction["type"]; isReferral?: boolean }) {
  if (isReferral)
    return (
      <div className="rounded-full p-2 shrink-0 bg-primary/10">
        <Gift className="h-4 w-4 text-primary" />
      </div>
    );
  const map = {
    sent: {
      icon: ArrowUpRight,
      bg: "bg-destructive/10",
      color: "text-destructive",
    },
    received: {
      icon: ArrowDownLeft,
      bg: "bg-success/10",
      color: "text-success",
    },
    added: { icon: Plus, bg: "bg-primary/10", color: "text-primary" },
    withdrawn: { icon: ArrowUpRight, bg: "bg-accent/10", color: "text-accent" },
    request: { icon: Send, bg: "bg-muted", color: "text-muted-foreground" },
  };
  const { icon: Icon, bg, color } = map[type];
  return (
    <div className={cn("rounded-full p-2 shrink-0", bg)}>
      <Icon className={cn("h-4 w-4", color)} />
    </div>
  );
}

/** Mini bar chart using divs for 7-day spending */
function SpendingMiniChart({ transactions }: { transactions: Transaction[] }) {
  const days = useMemo(() => {
    const result: number[] = Array(7).fill(0);
    const now = Date.now();
    for (const tx of transactions) {
      if (tx.type !== "sent" && tx.type !== "withdrawn") continue;
      const daysAgo = Math.floor((now - tx.timestamp) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) result[6 - daysAgo] += tx.amount;
    }
    return result;
  }, [transactions]);

  const max = Math.max(...days, 1);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const startDay = (today - 6 + 7) % 7;

  return (
    <div className="flex items-end gap-1 h-10">
      {days.map((val, i) => {
        const dayIdx = (startDay + i) % 7;
        const isToday = i === 6;
        const height = max > 0 ? Math.max((val / max) * 100, 6) : 6;
        return (
          <div
            key={dayLabels[dayIdx] + String(i)}
            className="flex-1 flex flex-col items-center gap-0.5"
          >
            <div
              className={cn(
                "w-full rounded-sm transition-all duration-500",
                isToday ? "bg-primary" : "bg-primary/30",
              )}
              style={{ height: `${height}%` }}
            />
            <span className="text-[9px] text-muted-foreground font-mono">
              {dayLabels[dayIdx].charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Savings progress mini bar */
function SavingsProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          pct >= 100 ? "bg-success" : pct >= 60 ? "bg-primary" : "bg-accent",
        )}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

/** Gamification streak ring */
function StreakRing({ streak }: { streak: number }) {
  const max = 30;
  const pct = Math.min(streak / max, 1);
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 56 56"
        aria-label={`${streak}-day streak`}
        role="img"
      >
        <title>{streak}-day streak</title>
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="4"
          className="stroke-muted"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="4"
          className="stroke-accent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-sm leading-none">
          {streak}
        </span>
        <span className="text-[9px] text-muted-foreground">days</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    balance,
    multiCurrencyBalances,
    isMultiCurrencyLoading,
    addFunds,
    isLoading: balanceLoading,
  } = useBalance();
  const { transactions, isLoading: txLoading } = useTransactions();
  const { inviteUrl, isLoading: inviteLoading } = useInviteCode();
  const { stats: inviteStats, isLoading: statsLoading } = useInviteStats();
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: savingsGoals = [], isLoading: savingsLoading } =
    useSavingsGoals();
  const { data: activityItems = [], isLoading: activityLoading } =
    useActivityFeed();
  const unreadCount = useUnreadCount();
  const navigate = useNavigate();

  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [addAmountInput, setAddAmountInput] = useState("");
  const [depositCurrency, setDepositCurrency] = useState<CurrencyCode>("USD");
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>("USD");
  const [copied, setCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [notifBannerDismissed, setNotifBannerDismissed] = useState(false);
  const rewardToastFired = useRef(false);

  // Determine displayed balance
  const displayedBalance = useMemo(() => {
    if (activeCurrency === "USD")
      return (
        multiCurrencyBalances.find((b) => b.currency === "USD")?.amount ??
        balance
      );
    return (
      multiCurrencyBalances.find((b) => b.currency === activeCurrency)
        ?.amount ?? 0
    );
  }, [activeCurrency, multiCurrencyBalances, balance]);

  // Spending snapshot
  const spentThisMonth = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((tx) => {
        if (tx.type !== "sent" && tx.type !== "withdrawn") return false;
        const d = new Date(tx.timestamp);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const spentLastMonth = useMemo(() => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return transactions
      .filter((tx) => {
        if (tx.type !== "sent" && tx.type !== "withdrawn") return false;
        const d = new Date(tx.timestamp);
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const spendingChangePct =
    spentLastMonth > 0
      ? Math.round(((spentThisMonth - spentLastMonth) / spentLastMonth) * 100)
      : 0;

  // Gamification: count consecutive days with any activity
  const streak = useMemo(() => {
    if (transactions.length === 0) return 3; // demo streak
    const days = new Set(
      transactions.map((tx) => {
        const d = new Date(tx.timestamp);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    );
    let s = 0;
    const now = new Date();
    while (true) {
      const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (!days.has(key)) break;
      s++;
      now.setDate(now.getDate() - 1);
    }
    return Math.max(s, 3);
  }, [transactions]);

  const pendingRequests = useMemo(
    () =>
      transactions.filter(
        (tx) => tx.type === "request" && tx.status === "pending",
      ),
    [transactions],
  );

  const addAmountCents = Math.round(
    Number.parseFloat(addAmountInput || "0") * 100,
  );
  const currencySymbol = getCurrencySymbol(depositCurrency as Currency);

  useEffect(() => {
    if (rewardToastFired.current) return;
    const stored = sessionStorage.getItem("payflow_last_reward_check");
    const now = Date.now();
    if (!stored || now - Number(stored) > 1000 * 60 * 30) {
      sessionStorage.setItem("payflow_last_reward_check", String(now));
    }
    rewardToastFired.current = true;
  }, []);

  const handleCopyInvite = async () => {
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

  const handleShareInvite = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on PayFlow",
          text: "I'm using PayFlow to send money instantly. Join me!",
          url: inviteUrl,
        });
      } catch {
        /* cancelled */
      }
    } else {
      handleCopyInvite();
    }
  };

  const handleCopyUserId = async () => {
    const userId = profile?.userId;
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setIdCopied(true);
      toast.success("User ID copied!");
      setTimeout(() => setIdCopied(false), 2000);
    } catch {
      toast.error("Failed to copy ID.");
    }
  };

  const handleAddMoney = async () => {
    if (!addAmountCents || addAmountCents <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      await addFunds.mutateAsync({
        amount: addAmountCents,
        currency: depositCurrency as Currency,
      });
      toast.success(
        `${formatCurrencyDisplay(addAmountCents, depositCurrency as Currency)} added to your wallet`,
      );
      setAddMoneyOpen(false);
      setAddAmountInput("");
    } catch {
      toast.error("Failed to add funds. Please try again.");
    }
  };

  // ── Quick action grid items ────────────────────────────────────────────────
  const quickActions = [
    {
      label: "Send",
      icon: Send,
      ocid: "dashboard.send_button",
      color: "text-primary",
      bg: "bg-primary/10",
      action: () => navigate({ to: "/transfers" }),
    },
    {
      label: "Request",
      icon: ArrowDownLeft,
      ocid: "dashboard.request_button",
      color: "text-accent",
      bg: "bg-accent/10",
      action: () => navigate({ to: "/transfers" }),
    },
    {
      label: "Add Funds",
      icon: Plus,
      ocid: "dashboard.add_money_button",
      color: "text-success",
      bg: "bg-success/10",
      action: () => setAddMoneyOpen(true),
    },
    {
      label: "Withdraw",
      icon: ArrowUpRight,
      ocid: "dashboard.withdraw_button",
      color: "text-destructive",
      bg: "bg-destructive/10",
      action: () => navigate({ to: "/payment-methods" }),
    },
    {
      label: "Pay Bill",
      icon: Receipt,
      ocid: "dashboard.pay_bill_button",
      color: "text-warning",
      bg: "bg-warning/10",
      action: () => navigate({ to: "/payment-methods" }),
    },
    {
      label: "Savings",
      icon: PiggyBank,
      ocid: "dashboard.savings_button",
      color: "text-primary",
      bg: "bg-primary/10",
      action: () => navigate({ to: "/savings" }),
    },
  ];

  return (
    <div className="space-y-4 pb-8" data-ocid="dashboard.page">
      {/* ── Notification Banner ── */}
      {unreadCount > 0 && !notifBannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center justify-between gap-3 rounded-xl bg-warning/10 border border-warning/30 px-4 py-2.5"
          data-ocid="dashboard.notif_banner"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="h-4 w-4 text-warning shrink-0" />
            <span className="text-sm font-medium text-foreground">
              You have{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/notifications" })}
                className="font-semibold text-warning underline underline-offset-2 hover:text-warning/80"
                data-ocid="dashboard.notif_banner.link"
              >
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </button>
            </span>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification banner"
            onClick={() => setNotifBannerDismissed(true)}
            className="p-1 rounded-lg hover:bg-muted/60 transition-colors shrink-0"
            data-ocid="dashboard.notif_banner.close_button"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}

      {/* ── Pending requests alert ── */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 rounded-xl bg-accent/10 border border-accent/30 px-4 py-2.5"
          data-ocid="dashboard.pending_requests_banner"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm font-medium">
              <span className="font-semibold text-accent">
                {pendingRequests.length}
              </span>{" "}
              pending money request{pendingRequests.length > 1 ? "s" : ""}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-3 border-accent/30 text-accent hover:bg-accent/10"
            onClick={() => navigate({ to: "/transfers" })}
            data-ocid="dashboard.pending_requests.review_button"
          >
            Review
          </Button>
        </motion.div>
      )}

      {/* ── Hero Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 md:p-8"
        data-ocid="dashboard.balance_card"
      >
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-accent/8 blur-2xl pointer-events-none" />

        <div className="relative">
          {/* User ID + hide toggle */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {profileLoading ? (
              <Skeleton className="h-6 w-36 rounded-full" />
            ) : (
              <button
                type="button"
                onClick={handleCopyUserId}
                disabled={!profile?.userId}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                data-ocid="dashboard.user_id_badge"
              >
                <span>ID: {profile?.userId ?? "—"}</span>
                {idCopied ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
            <button
              type="button"
              aria-label={balanceHidden ? "Show balance" : "Hide balance"}
              onClick={() => setBalanceHidden((h) => !h)}
              className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
              data-ocid="dashboard.balance_toggle"
            >
              {balanceHidden ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-1">Total balance</p>
          <div className="flex items-baseline gap-3 mb-1">
            {balanceLoading ? (
              <Spinner size="lg" className="text-primary" />
            ) : (
              <>
                <span className="font-display font-bold text-5xl md:text-6xl tracking-tight select-none">
                  {balanceHidden
                    ? "••••••"
                    : formatCurrencyDisplay(
                        displayedBalance,
                        activeCurrency as Currency,
                      )}
                </span>
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono">
                  {activeCurrency}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm mb-4">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-success font-medium">+1.2%</span>
            <span className="text-muted-foreground">this week</span>
          </div>

          {/* Currency selector pills */}
          <div className="mb-6">
            {isMultiCurrencyLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {ALL_CURRENCIES.map((c) => {
                  const isActive = activeCurrency === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActiveCurrency(c as CurrencyCode)}
                      data-ocid={`dashboard.currency_pill.${c.toLowerCase()}`}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                        isActive
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                      )}
                    >
                      <span className="font-mono">{getCurrencySymbol(c)}</span>
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick action 2x3 grid */}
          <div
            className="grid grid-cols-3 sm:grid-cols-6 gap-2"
            data-ocid="dashboard.quick_actions"
          >
            {quickActions.map(
              ({ label, icon: Icon, ocid, color, bg, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  data-ocid={ocid}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-center transition-smooth hover:scale-105 active:scale-95",
                    "bg-muted/40 hover:bg-muted/70 border border-border",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      bg,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground leading-tight">
                    {label}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 3-column grid: Spending + Savings + Gamification ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spending Snapshot */}
        <DashboardCard
          title="Spending"
          subtitle="This month vs last"
          icon={<ShoppingCart className="h-4 w-4 text-accent" />}
          accent="accent"
          delay={0.1}
          data-ocid="dashboard.spending_card"
          headerAction={
            <button
              type="button"
              onClick={() => navigate({ to: "/analytics" })}
              className="text-xs text-primary hover:underline"
              data-ocid="dashboard.spending.view_link"
            >
              Analytics
            </button>
          }
        >
          {txLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-3 w-36 rounded-lg" />
            </div>
          ) : (
            <>
              <p className="font-display font-bold text-2xl text-foreground mb-0.5">
                {formatCurrencyDisplay(spentThisMonth, "USD" as Currency)}
              </p>
              <div className="flex items-center gap-1 text-xs mb-3">
                {spendingChangePct > 0 ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive font-semibold">
                      +{spendingChangePct}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-success" />
                    <span className="text-success font-semibold">
                      {spendingChangePct}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">vs last month</span>
              </div>
              <SpendingMiniChart transactions={transactions} />
            </>
          )}
        </DashboardCard>

        {/* Savings Progress */}
        <DashboardCard
          title="Savings Goals"
          subtitle={`${savingsGoals.length} active goals`}
          icon={<Target className="h-4 w-4 text-primary" />}
          accent="primary"
          delay={0.15}
          data-ocid="dashboard.savings_card"
          headerAction={
            <button
              type="button"
              onClick={() => navigate({ to: "/savings" })}
              className="text-xs text-primary hover:underline"
              data-ocid="dashboard.savings.view_link"
            >
              View all
            </button>
          }
        >
          {savingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : savingsGoals.length === 0 ? (
            <div
              className="text-center py-4"
              data-ocid="dashboard.savings.empty_state"
            >
              <PiggyBank className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">
                No savings goals yet
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs"
                onClick={() => navigate({ to: "/savings" })}
                data-ocid="dashboard.savings.create_button"
              >
                Create goal
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {savingsGoals.slice(0, 3).map((goal, i) => {
                const pct =
                  goal.targetCents > 0
                    ? Math.round((goal.savedCents / goal.targetCents) * 100)
                    : 0;
                return (
                  <div
                    key={goal.id}
                    data-ocid={`dashboard.savings.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <span>{goal.emoji}</span>
                        <span className="truncate max-w-[120px]">
                          {goal.name}
                        </span>
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <SavingsProgressBar pct={pct} />
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>

        {/* Gamification */}
        <DashboardCard
          title="Daily Streak"
          subtitle="Keep your momentum"
          icon={<Flame className="h-4 w-4 text-accent" />}
          accent="accent"
          delay={0.2}
          data-ocid="dashboard.streak_card"
        >
          <div className="flex items-center gap-4 mb-3">
            <StreakRing streak={streak} />
            <div>
              <p className="font-display font-bold text-lg">
                {streak} day streak
              </p>
              <p className="text-xs text-muted-foreground">🔥 Keep it up!</p>
            </div>
          </div>
          {/* Next badge */}
          <div className="rounded-xl bg-muted/40 border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold">Next Badge</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1.5">
              {transactions.length < 5
                ? `${5 - transactions.length} more transfers to earn Power Sender`
                : transactions.length < 20
                  ? `${20 - transactions.length} more to earn Money Master`
                  : "Unlock Elite Sender at 50 transfers"}
            </p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{
                  width: `${Math.min((transactions.length / 20) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* ── Cards + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* My Cards */}
        <DashboardCard
          title="My Cards"
          delay={0.22}
          className="lg:col-span-2"
          data-ocid="dashboard.cards_section"
          headerAction={
            <button
              type="button"
              onClick={() => navigate({ to: "/payment-methods" })}
              className="text-xs text-primary hover:underline"
              data-ocid="dashboard.view_cards_link"
            >
              View all
            </button>
          }
        >
          <div className="relative rounded-xl overflow-hidden p-4 h-36 mb-3 bg-gradient-to-br from-primary to-primary/70">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-primary-foreground font-display font-semibold text-sm">
                  PayFlow Visa
                </span>
                <CreditCard className="h-5 w-5 text-primary-foreground/80" />
              </div>
              <div>
                <p className="font-mono text-primary-foreground/70 text-xs mb-1">
                  •••• •••• •••• 5678
                </p>
                <p className="font-display font-bold text-primary-foreground text-base">
                  {formatCurrencyDisplay(412090, "USD" as Currency)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-muted/60 border border-border p-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                •••• 9012
              </p>
              <p className="font-display font-semibold text-sm mt-0.5">
                {formatCurrencyDisplay(85340, "USD" as Currency)}
              </p>
            </div>
            <Badge variant="outline">Savings</Badge>
          </div>
        </DashboardCard>

        {/* Recent Transactions */}
        <DashboardCard
          title="Recent Transactions"
          delay={0.25}
          className="lg:col-span-3"
          data-ocid="dashboard.activity_section"
          headerAction={
            <button
              type="button"
              onClick={() => navigate({ to: "/transfers" })}
              className="text-xs text-primary hover:underline"
              data-ocid="dashboard.view_all_link"
            >
              View all
            </button>
          }
        >
          {txLoading ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="dashboard.activity.loading_state"
            >
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div
              className="text-center py-8"
              data-ocid="dashboard.activity.empty_state"
            >
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 5).map((tx, i) => {
                const referral = isReferralBonus(tx);
                return (
                  <div
                    key={tx.id}
                    data-ocid={`dashboard.activity.item.${i + 1}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-smooth cursor-pointer"
                  >
                    <TxIcon type={tx.type} isReferral={referral} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">
                          {referral
                            ? "Referral Bonus"
                            : tx.type.charAt(0).toUpperCase() +
                              tx.type.slice(1)}
                        </p>
                        {referral && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 shrink-0">
                            <Gift className="h-2.5 w-2.5" />
                            Reward
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.counterparty ?? tx.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "text-sm font-semibold font-mono",
                          tx.type === "received" ||
                            tx.type === "added" ||
                            referral
                            ? "text-success"
                            : "text-foreground",
                        )}
                      >
                        {tx.type === "received" ||
                        tx.type === "added" ||
                        referral
                          ? "+"
                          : "-"}
                        {formatCurrencyDisplay(
                          tx.amount,
                          tx.currency as Currency,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* ── Activity Feed Preview ── */}
      <DashboardCard
        title="Activity Feed"
        subtitle="What's happening in your network"
        icon={<Zap className="h-4 w-4 text-primary" />}
        accent="primary"
        delay={0.28}
        data-ocid="dashboard.activity_feed_card"
        headerAction={
          <button
            type="button"
            onClick={() => navigate({ to: "/activity" })}
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
            data-ocid="dashboard.activity_feed.view_link"
          >
            View all <ChevronRight className="h-3 w-3" />
          </button>
        }
      >
        {activityLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-2/3 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="h-4 w-14 rounded" />
              </div>
            ))}
          </div>
        ) : activityItems.length === 0 ? (
          <div
            className="text-center py-6"
            data-ocid="dashboard.activity_feed.empty_state"
          >
            <Zap className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              No activity yet — start sending money!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activityItems.slice(0, 5).map((item: ActivityItem, i) => (
              <div
                key={item.id}
                data-ocid={`dashboard.activity_feed.item.${i + 1}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-smooth"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">
                    {(item.counterpartyName ?? item.title)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.counterpartyName ?? item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                {item.amountCents != null && (
                  <p
                    className={cn(
                      "text-sm font-semibold font-mono shrink-0",
                      item.type === "payment"
                        ? "text-success"
                        : "text-foreground",
                    )}
                  >
                    {formatCurrencyDisplay(
                      item.amountCents,
                      (item.currency ?? "USD") as Currency,
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* ── Scheduled Payments ── */}
      <DashboardCard
        title="Scheduled Payments"
        subtitle="Upcoming recurring transfers"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        delay={0.3}
        data-ocid="dashboard.scheduled_card"
        headerAction={
          <button
            type="button"
            onClick={() => navigate({ to: "/transfers" })}
            className="text-xs text-primary hover:underline"
            data-ocid="dashboard.scheduled.manage_link"
          >
            Manage
          </button>
        }
      >
        <div
          className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center"
          data-ocid="dashboard.scheduled.empty_state"
        >
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium mb-1">No scheduled payments</p>
          <p className="text-xs text-muted-foreground mb-3">
            Automate recurring payments to friends or bills
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => navigate({ to: "/transfers" })}
            data-ocid="dashboard.scheduled.create_button"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Schedule a Payment
          </Button>
        </div>
      </DashboardCard>

      {/* ── Payment Automation ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
        data-ocid="dashboard.autopay_section"
      >
        <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base leading-tight">
              Payment Automation
            </h2>
            <p className="text-xs text-muted-foreground">
              Auto-charge and auto-deposit for hands-free payments
            </p>
          </div>
        </div>
        <AutoPayToggle />
      </motion.div>

      {/* ── Referral Rewards ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <ReferralStatsCard />
      </motion.div>

      {/* ── Invite Friends ── */}
      <DashboardCard
        title="Invite Friends"
        subtitle="Share your link — they sign up and can send you money instantly"
        icon={<Users className="h-4 w-4 text-primary" />}
        accent="primary"
        delay={0.38}
        data-ocid="dashboard.invite_section"
      >
        {inviteLoading ? (
          <div
            className="h-11 rounded-xl bg-muted/40 animate-pulse mb-3"
            data-ocid="dashboard.invite.loading_state"
          />
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2.5">
              <Link className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span
                className="font-mono text-xs text-foreground truncate"
                data-ocid="dashboard.invite.url_display"
              >
                {inviteUrl || "Generating link…"}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 h-10 px-3"
              onClick={handleCopyInvite}
              disabled={!inviteUrl}
              data-ocid="dashboard.invite.copy_button"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs">Copy</span>
              )}
            </Button>
            <Button
              size="sm"
              className="shrink-0 h-10 px-3 bg-primary hover:bg-primary/90"
              onClick={handleShareInvite}
              disabled={!inviteUrl}
              data-ocid="dashboard.invite.share_button"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        )}

        {statsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-5 rounded-lg" />
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium mb-2">
              <span className="text-primary font-semibold font-mono">
                {inviteStats
                  ? Number(inviteStats.redemptionCount).toString()
                  : "0"}
              </span>{" "}
              {Number(inviteStats?.redemptionCount ?? 0) === 1
                ? "person has"
                : "people have"}{" "}
              joined via your link
            </p>
            {!inviteStats || inviteStats.redeemerUsernames.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="dashboard.invite.empty_state"
              >
                No one has joined yet — share your link to get started!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {inviteStats.redeemerUsernames.map((username, i) => (
                  <span
                    key={username}
                    data-ocid={`dashboard.invite.redeemer.${i + 1}`}
                    className="inline-flex items-center bg-muted/60 rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    @{username}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardCard>

      {/* ── Add Money Modal ── */}
      <Modal
        open={addMoneyOpen}
        onOpenChange={(open) => {
          setAddMoneyOpen(open);
          if (!open) setAddAmountInput("");
        }}
        title="Add funds to wallet"
        description="Choose a currency and enter the amount to deposit."
        data-ocid="dashboard.add_money.dialog"
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="deposit-currency">Currency</Label>
            <Select
              value={depositCurrency}
              onValueChange={(v) => setDepositCurrency(v as CurrencyCode)}
            >
              <SelectTrigger
                id="deposit-currency"
                data-ocid="dashboard.add_money.currency_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="font-mono mr-1.5">
                      {getCurrencySymbol(c)}
                    </span>
                    {c} — {CURRENCY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                {currencySymbol}
              </span>
              <Input
                id="add-amount"
                type="number"
                placeholder="0.00"
                className="pl-8"
                value={addAmountInput}
                onChange={(e) => setAddAmountInput(e.target.value)}
                data-ocid="dashboard.add_money.amount_input"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAddMoneyOpen(false);
                setAddAmountInput("");
              }}
              data-ocid="dashboard.add_money.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={
                !addAmountInput || addAmountCents <= 0 || addFunds.isPending
              }
              onClick={handleAddMoney}
              data-ocid="dashboard.add_money.confirm_button"
            >
              {addFunds.isPending ? "Processing..." : "Add funds"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
