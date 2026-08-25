import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  type DepositHistoryEntry,
  useCreateSavingsGoal,
  useDeleteGoal,
  useDepositHistory,
  useDepositToGoal,
  useLockGoal,
  useRoundUpSettings,
  useSavingsGoals,
  useToggleRoundUp,
  useUpdateGoal,
  useWithdrawFromGoal,
} from "@/hooks/useSavings";
import type { SavingsCategory, SavingsGoal } from "@/types";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Lock,
  LockOpen,
  PiggyBank,
  Plus,
  RefreshCw,
  Repeat,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  SavingsCategory,
  { emoji: string; label: string; color: string }
> = {
  emergency: { emoji: "🛡️", label: "Emergency Fund", color: "text-destructive" },
  travel: { emoji: "✈️", label: "Travel", color: "text-primary" },
  home: { emoji: "🏠", label: "Home", color: "text-accent" },
  vehicle: { emoji: "🚗", label: "Vehicle", color: "text-muted-foreground" },
  education: { emoji: "📚", label: "Education", color: "text-primary" },
  retirement: { emoji: "👴", label: "Retirement", color: "text-accent" },
  investment: { emoji: "📈", label: "Investment", color: "text-primary" },
  wedding: { emoji: "💍", label: "Wedding", color: "text-destructive" },
  gadget: { emoji: "💻", label: "Gadget", color: "text-muted-foreground" },
  other: { emoji: "🎯", label: "Other", color: "text-muted-foreground" },
};

const CATEGORIES = Object.keys(CATEGORY_META) as SavingsCategory[];

function fmtDollars(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDollarsFull(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function daysRemaining(deadline?: number) {
  if (!deadline) return null;
  const diff = deadline - Date.now();
  if (diff < 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function progressColor(pct: number) {
  if (pct >= 100) return "bg-primary";
  if (pct >= 75) return "bg-[oklch(0.65_0.18_150)]";
  if (pct >= 25) return "bg-[oklch(0.72_0.18_85)]";
  return "bg-destructive";
}

function progressRingColor(pct: number) {
  if (pct >= 100) return "#5eb8d4";
  if (pct >= 75) return "#4aba8a";
  if (pct >= 25) return "#d4a017";
  return "#e05555";
}

// ── Circular progress ────────────────────────────────────────────────────────

function CircularProgress({ pct, size = 56 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        className="text-border opacity-50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={progressRingColor(pct)}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}

// ── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  index,
  onOpenDetail,
}: {
  goal: SavingsGoal;
  index: number;
  onOpenDetail: (g: SavingsGoal) => void;
}) {
  const deposit = useDepositToGoal();
  const withdraw = useWithdrawFromGoal();
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  const pct =
    goal.targetCents > 0
      ? Math.min(Math.round((goal.savedCents / goal.targetCents) * 100), 100)
      : 0;
  const completed = pct >= 100;
  const days = daysRemaining(goal.deadline);
  const meta = CATEGORY_META[goal.category];

  function handleAction() {
    const cents = Math.round(Number.parseFloat(amount) * 100);
    if (!cents || cents <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (activeTab === "deposit") {
      deposit.mutate(
        { goalId: goal.id, amountCents: cents, note: "Manual deposit" },
        {
          onSuccess: () => {
            toast.success(`Deposited ${fmtDollarsFull(cents)} to ${goal.name}`);
            setAmount("");
          },
        },
      );
    } else {
      if (goal.isLocked) {
        toast.error("Goal is locked — unlock it first");
        return;
      }
      withdraw.mutate(
        { goalId: goal.id, amountCents: cents },
        {
          onSuccess: () => {
            toast.success(
              `Withdrew ${fmtDollarsFull(cents)} from ${goal.name}`,
            );
            setAmount("");
          },
        },
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Card
        className="relative overflow-hidden hover:shadow-elevated transition-smooth group border-border"
        data-ocid={`savings.goal_card.${index + 1}`}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 transition-all"
          style={{ background: progressRingColor(pct), opacity: 0.7 }}
        />

        {/* Completed glow */}
        {completed && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        )}

        <CardContent className="pt-5 pb-4 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <CircularProgress pct={pct} size={52} />
                <span className="absolute inset-0 flex items-center justify-center text-lg">
                  {goal.emoji ?? meta.emoji}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-sm truncate max-w-[140px]">
                    {goal.name}
                  </h3>
                  {goal.isLocked && (
                    <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  {completed && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Done
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{meta.label}</p>
                {days !== null && days > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {days}d left
                  </p>
                )}
                {days === 0 && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="h-3 w-3" /> Deadline passed
                  </p>
                )}
              </div>
            </div>

            {/* Amounts + detail button */}
            <div className="flex items-start gap-1.5">
              <div className="text-right">
                <p className="font-bold text-base font-display leading-tight">
                  {fmtDollars(goal.savedCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {fmtDollars(goal.targetCents)}
                </p>
                <p
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: progressRingColor(pct) }}
                >
                  {pct}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenDetail(goal)}
                className="opacity-0 group-hover:opacity-100 transition-all mt-0.5 p-1 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="View goal details"
                data-ocid={`savings.goal_detail_button.${index + 1}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Auto-deposit badge */}
          {goal.autoDepositCents && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5">
              <Repeat className="h-3 w-3 flex-shrink-0 text-primary" />
              <span>
                Auto {fmtDollarsFull(goal.autoDepositCents)} /{" "}
                {goal.autoDepositInterval}
              </span>
            </div>
          )}

          {/* Quick action */}
          <div className="flex items-center gap-1.5">
            {/* Tab toggle */}
            <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 mr-1">
              <button
                type="button"
                onClick={() => setActiveTab("deposit")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "deposit" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                data-ocid={`savings.deposit_tab.${index + 1}`}
              >
                <ArrowDownLeft className="h-3 w-3" /> Add
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("withdraw")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "withdraw" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"} ${goal.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                data-ocid={`savings.withdraw_tab.${index + 1}`}
                disabled={goal.isLocked}
              >
                <ArrowUpRight className="h-3 w-3" /> Out
              </button>
            </div>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAction()}
              className="h-8 text-sm flex-1"
              data-ocid={`savings.amount_input.${index + 1}`}
            />
            <Button
              size="sm"
              onClick={handleAction}
              disabled={deposit.isPending || withdraw.isPending}
              className="h-8 px-3 text-xs"
              variant={activeTab === "withdraw" ? "outline" : "default"}
              data-ocid={`savings.action_button.${index + 1}`}
            >
              {activeTab === "deposit" ? "Deposit" : "Withdraw"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Goal Detail Modal ────────────────────────────────────────────────────────

function GoalDetailModal({
  goal,
  onClose,
}: {
  goal: SavingsGoal;
  onClose: () => void;
}) {
  const updateGoal = useUpdateGoal();
  const lockGoal = useLockGoal();
  const deleteGoal = useDeleteGoal();
  const deposit = useDepositToGoal();
  const withdraw = useWithdrawFromGoal();
  const { data: history = [] } = useDepositHistory(goal.id);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(
    (goal.targetCents / 100).toString(),
  );
  const [editAutoAmt, setEditAutoAmt] = useState(
    goal.autoDepositCents ? (goal.autoDepositCents / 100).toString() : "",
  );
  const [editAutoInterval, setEditAutoInterval] = useState<
    "weekly" | "monthly"
  >(goal.autoDepositInterval ?? "monthly");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [txAmount, setTxAmount] = useState("");
  const [txNote, setTxNote] = useState("");

  const pct =
    goal.targetCents > 0
      ? Math.min(Math.round((goal.savedCents / goal.targetCents) * 100), 100)
      : 0;

  function handleSaveEdit() {
    updateGoal.mutate(
      {
        goalId: goal.id,
        updates: {
          name: editName,
          targetCents: Math.round(Number.parseFloat(editTarget) * 100),
          autoDepositCents: editAutoAmt
            ? Math.round(Number.parseFloat(editAutoAmt) * 100)
            : undefined,
          autoDepositInterval: editAutoAmt ? editAutoInterval : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Goal updated");
          setEditing(false);
        },
      },
    );
  }

  function handleDelete() {
    deleteGoal.mutate(goal.id, {
      onSuccess: () => {
        toast.success("Goal deleted");
        onClose();
      },
    });
  }

  function handleDeposit() {
    const cents = Math.round(Number.parseFloat(txAmount) * 100);
    if (!cents || cents <= 0) return;
    deposit.mutate(
      { goalId: goal.id, amountCents: cents, note: txNote || undefined },
      {
        onSuccess: () => {
          toast.success(`Deposited ${fmtDollarsFull(cents)}`);
          setTxAmount("");
          setTxNote("");
        },
      },
    );
  }

  function handleWithdraw() {
    if (goal.isLocked) {
      toast.error("Goal is locked");
      return;
    }
    const cents = Math.round(Number.parseFloat(txAmount) * 100);
    if (!cents || cents <= 0) return;
    withdraw.mutate(
      { goalId: goal.id, amountCents: cents },
      {
        onSuccess: () => {
          toast.success(`Withdrew ${fmtDollarsFull(cents)}`);
          setTxAmount("");
        },
      },
    );
  }

  return (
    <DialogContent
      className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      data-ocid="savings.goal_detail_dialog"
    >
      <DialogHeader className="shrink-0">
        <DialogTitle className="flex items-center gap-3">
          <span className="text-2xl">
            {goal.emoji ?? CATEGORY_META[goal.category].emoji}
          </span>
          <div>
            <span className="text-base font-semibold">{goal.name}</span>
            <p className="text-xs text-muted-foreground font-normal">
              {CATEGORY_META[goal.category].label}
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-5 pb-4">
          {/* Hero stats */}
          <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
            <CircularProgress pct={pct} size={72} />
            <div className="flex-1">
              <p className="text-2xl font-bold font-display">
                {fmtDollarsFull(goal.savedCents)}
              </p>
              <p className="text-sm text-muted-foreground">
                of {fmtDollarsFull(goal.targetCents)} goal
              </p>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progressColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pct}% complete ·{" "}
                {fmtDollarsFull(goal.targetCents - goal.savedCents)} remaining
              </p>
            </div>
          </div>

          {/* Edit mode */}
          {editing ? (
            <div className="space-y-3 p-4 border border-border rounded-xl">
              <p className="text-sm font-semibold">Edit Goal</p>
              <div className="space-y-1">
                <Label className="text-xs">Goal Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  data-ocid="savings.edit_name_input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target Amount ($)</Label>
                <Input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  data-ocid="savings.edit_target_input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Auto-deposit ($)</Label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={editAutoAmt}
                    onChange={(e) => setEditAutoAmt(e.target.value)}
                    data-ocid="savings.edit_auto_input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Select
                    value={editAutoInterval}
                    onValueChange={(v) =>
                      setEditAutoInterval(v as "weekly" | "monthly")
                    }
                  >
                    <SelectTrigger data-ocid="savings.edit_interval_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                  data-ocid="savings.edit_cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateGoal.isPending}
                  className="flex-1"
                  data-ocid="savings.edit_save_button"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                className="flex-1 gap-1.5"
                data-ocid="savings.edit_button"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Goal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  lockGoal.mutate(
                    { goalId: goal.id, locked: !goal.isLocked },
                    {
                      onSuccess: () =>
                        toast.success(
                          goal.isLocked ? "Goal unlocked" : "Goal locked",
                        ),
                    },
                  )
                }
                className={`flex-1 gap-1.5 ${goal.isLocked ? "border-primary text-primary" : ""}`}
                data-ocid="savings.lock_toggle"
              >
                {goal.isLocked ? (
                  <>
                    <LockOpen className="h-3.5 w-3.5" /> Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Lock
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Lock info */}
          {goal.isLocked && (
            <div className="flex items-start gap-2.5 p-3 bg-primary/8 border border-primary/20 rounded-lg text-sm text-primary">
              <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                This goal is locked. Withdrawals are disabled until you unlock
                it.
              </p>
            </div>
          )}

          {/* Quick deposit/withdraw */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Transaction
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount ($)"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="flex-1"
                data-ocid="savings.detail_amount_input"
              />
              <Input
                placeholder="Note (optional)"
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                className="flex-1"
                data-ocid="savings.detail_note_input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleDeposit}
                disabled={deposit.isPending}
                className="flex-1 gap-1.5"
                data-ocid="savings.detail_deposit_button"
              >
                <ArrowDownLeft className="h-3.5 w-3.5" /> Deposit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleWithdraw}
                disabled={withdraw.isPending || goal.isLocked}
                className="flex-1 gap-1.5"
                data-ocid="savings.detail_withdraw_button"
              >
                <ArrowUpRight className="h-3.5 w-3.5" /> Withdraw
              </Button>
            </div>
          </div>

          {/* Auto-deposit settings */}
          {goal.autoDepositCents && (
            <div className="p-3 bg-muted/30 rounded-xl border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                Auto-Deposit Active
              </div>
              <p className="text-sm text-muted-foreground">
                {fmtDollarsFull(goal.autoDepositCents)} automatically added{" "}
                {goal.autoDepositInterval}
              </p>
            </div>
          )}

          {/* Deadline */}
          {goal.deadline && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              Target date:{" "}
              {new Date(goal.deadline).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {daysRemaining(goal.deadline) !== null && (
                <span
                  className={`ml-auto text-xs font-medium ${(daysRemaining(goal.deadline) ?? 0) < 30 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {daysRemaining(goal.deadline) === 0
                    ? "Overdue"
                    : `${daysRemaining(goal.deadline)}d remaining`}
                </span>
              )}
            </div>
          )}

          <Separator />

          {/* Deposit history */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transaction History
            </p>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 8).map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Delete */}
          {confirmDelete ? (
            <div className="space-y-2 p-3 bg-destructive/8 border border-destructive/20 rounded-xl">
              <p className="text-sm font-medium text-destructive">
                Delete this goal?
              </p>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. Any saved amount will be released
                back to your wallet.
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1"
                  data-ocid="savings.delete_cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteGoal.isPending}
                  className="flex-1"
                  data-ocid="savings.delete_confirm_button"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Goal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              data-ocid="savings.delete_button"
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete Goal
            </Button>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

function HistoryRow({ entry }: { entry: DepositHistoryEntry }) {
  const isWithdraw = entry.type === "withdraw";
  const isAuto = entry.type === "auto" || entry.type === "roundup";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isWithdraw ? "bg-destructive/10" : "bg-primary/10"}`}
      >
        {isWithdraw ? (
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        ) : isAuto ? (
          <RefreshCw className="h-4 w-4 text-primary" />
        ) : (
          <ArrowDownLeft className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {entry.note ?? (isWithdraw ? "Withdrawal" : "Deposit")}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(entry.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {isAuto && (
            <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              Auto
            </span>
          )}
        </p>
      </div>
      <span
        className={`text-sm font-semibold font-display ${isWithdraw ? "text-destructive" : "text-primary"}`}
      >
        {isWithdraw ? "-" : "+"}
        {fmtDollarsFull(entry.amountCents)}
      </span>
    </div>
  );
}

// ── Round-Up Section ─────────────────────────────────────────────────────────

function RoundUpSection() {
  const { data: settings } = useRoundUpSettings();
  const toggle = useToggleRoundUp();

  if (!settings) return null;

  return (
    <Card
      className="border-border overflow-hidden"
      data-ocid="savings.roundup_section"
    >
      <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary to-accent/60" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          Round-Up Savings
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {settings.enabled ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) => {
                toggle.mutate(v, {
                  onSuccess: () =>
                    toast.success(
                      v
                        ? "Round-up savings enabled! 🎉"
                        : "Round-up savings disabled",
                    ),
                });
              }}
              data-ocid="savings.roundup_toggle"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Automatically round up every P2P transfer to the nearest $5 and save
          the difference into your Emergency Fund.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/40 rounded-xl text-center">
            <p className="text-2xl font-bold font-display text-primary">
              {fmtDollarsFull(settings.totalRoundedUpCents)}
            </p>
            <p className="text-xs text-muted-foreground">
              Total Saved via Round-ups
            </p>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl text-center">
            <p className="text-2xl font-bold font-display">
              {settings.transactions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Transactions Rounded
            </p>
          </div>
        </div>

        {/* Recent round-up history */}
        {settings.transactions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Round-Ups
            </p>
            {settings.transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">
                      {fmtDollarsFull(tx.originalCents)} →{" "}
                      {fmtDollarsFull(tx.roundedCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">
                  +{fmtDollarsFull(tx.savedCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Completed Goals ──────────────────────────────────────────────────────────

function CompletedGoalsSection({ goals }: { goals: SavingsGoal[] }) {
  if (goals.length === 0) return null;
  return (
    <div className="space-y-3" data-ocid="savings.completed_section">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="font-semibold text-sm">Completed Goals</h2>
        <Badge variant="secondary" className="text-xs">
          {goals.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              className="border-primary/20 bg-primary/5 relative overflow-hidden"
              data-ocid={`savings.completed_card.${i + 1}`}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-60" />
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {goal.emoji ?? CATEGORY_META[goal.category].emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">
                        {goal.name}
                      </p>
                      <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_META[goal.category].label}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm font-display text-primary">
                      {fmtDollars(goal.savedCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">100% ✓</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateGoal }: { onCreateGoal: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6 space-y-5"
      data-ocid="savings.empty_state"
    >
      {/* Animated piggybank */}
      <div className="relative mx-auto w-28 h-28">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2.8,
            ease: "easeInOut",
          }}
          className="text-7xl text-center leading-none"
        >
          🐷
        </motion.div>
        {(["coin1", "coin2", "coin3"] as const).map((key, i) => (
          <motion.div
            key={key}
            className="absolute text-sm"
            style={{ top: `${20 + i * 15}%`, right: `${5 + i * 8}%` }}
            animate={{ opacity: [0, 1, 0], y: [0, -12, -24], x: [0, 4, 8] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.8,
              delay: i * 0.5,
            }}
          >
            💰
          </motion.div>
        ))}
      </div>
      <div className="space-y-2 max-w-sm mx-auto">
        <h3 className="text-xl font-bold font-display">Start saving today</h3>
        <p className="text-muted-foreground text-sm">
          Set a goal, track your progress, and reach your dreams one deposit at
          a time. Your first goal is just one click away.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onCreateGoal}
          size="lg"
          className="gap-2 px-6"
          data-ocid="savings.create_first_goal_button"
        >
          <Plus className="h-5 w-5" /> Create First Goal
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2 px-6"
          data-ocid="savings.learn_more_button"
        >
          <TrendingUp className="h-4 w-4" /> See How It Works
        </Button>
      </div>
      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {(
          [
            "🛡️ Emergency Fund",
            "✈️ Vacation",
            "🏠 Home Down Payment",
            "💍 Wedding",
          ] as const
        ).map((label) => (
          <button
            type="button"
            key={label}
            onClick={onCreateGoal}
            className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:bg-muted transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Create Goal Modal ─────────────────────────────────────────────────────────

interface CreateForm {
  name: string;
  category: SavingsCategory;
  targetCents: string;
  deadline: string;
  autoEnabled: boolean;
  autoDepositCents: string;
  autoDepositInterval: "weekly" | "monthly";
}

const DEFAULT_FORM: CreateForm = {
  name: "",
  category: "other",
  targetCents: "",
  deadline: "",
  autoEnabled: false,
  autoDepositCents: "",
  autoDepositInterval: "monthly",
};

function CreateGoalModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createGoal = useCreateSavingsGoal();
  const [form, setForm] = useState<CreateForm>(DEFAULT_FORM);

  function set<K extends keyof CreateForm>(key: K, val: CreateForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleCreate() {
    if (!form.name.trim() || !form.targetCents) {
      toast.error("Please fill in goal name and target amount");
      return;
    }
    const targetCents = Math.round(Number.parseFloat(form.targetCents) * 100);
    if (Number.isNaN(targetCents) || targetCents <= 0) {
      toast.error("Target amount must be greater than $0");
      return;
    }
    const meta = CATEGORY_META[form.category];
    createGoal.mutate(
      {
        name: form.name.trim(),
        category: form.category,
        targetCents,
        currency: "USD",
        isLocked: false,
        emoji: meta.emoji,
        deadline: form.deadline ? new Date(form.deadline).getTime() : undefined,
        autoDepositCents:
          form.autoEnabled && form.autoDepositCents
            ? Math.round(Number.parseFloat(form.autoDepositCents) * 100)
            : undefined,
        autoDepositInterval:
          form.autoEnabled && form.autoDepositCents
            ? form.autoDepositInterval
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${meta.emoji} "${form.name}" goal created!`);
          setForm(DEFAULT_FORM);
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-ocid="savings.create_dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> New Savings Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Goal Name</Label>
            <Input
              placeholder="e.g. Europe Vacation 2025"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              data-ocid="savings.goal_name_input"
            />
          </div>

          {/* Category + Target */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as SavingsCategory)}
              >
                <SelectTrigger data-ocid="savings.category_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Target Amount ($)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="1,000"
                value={form.targetCents}
                onChange={(e) => set("targetCents", e.target.value)}
                data-ocid="savings.target_input"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Target Date{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              data-ocid="savings.deadline_input"
            />
          </div>

          {/* Auto-deposit */}
          <div className="space-y-3 p-3 border border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5 text-primary" /> Auto-Deposit
                </p>
                <p className="text-xs text-muted-foreground">
                  Automatically add funds on a schedule
                </p>
              </div>
              <Switch
                checked={form.autoEnabled}
                onCheckedChange={(v) => set("autoEnabled", v)}
                data-ocid="savings.auto_deposit_toggle"
              />
            </div>
            <AnimatePresence>
              {form.autoEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-2 overflow-hidden"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={form.autoDepositCents}
                      onChange={(e) => set("autoDepositCents", e.target.value)}
                      data-ocid="savings.auto_amount_input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Frequency</Label>
                    <Select
                      value={form.autoDepositInterval}
                      onValueChange={(v) =>
                        set("autoDepositInterval", v as "weekly" | "monthly")
                      }
                    >
                      <SelectTrigger data-ocid="savings.auto_interval_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Preview */}
          {form.name && form.targetCents && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl text-sm">
              <span className="text-xl">
                {CATEGORY_META[form.category].emoji}
              </span>
              <div>
                <p className="font-medium">{form.name}</p>
                <p className="text-xs text-muted-foreground">
                  Goal:{" "}
                  {fmtDollars(
                    Math.round(Number.parseFloat(form.targetCents) * 100) || 0,
                  )}
                  {form.autoEnabled &&
                    form.autoDepositCents &&
                    ` · Auto ${fmtDollars(Math.round(Number.parseFloat(form.autoDepositCents) * 100) || 0)}/${form.autoDepositInterval}`}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="savings.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createGoal.isPending}
              className="flex-1"
              data-ocid="savings.submit_button"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SavingsPage() {
  const { data: goals = [], isLoading } = useSavingsGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [detailGoal, setDetailGoal] = useState<SavingsGoal | null>(null);

  const activeGoals = goals.filter((g) => g.savedCents < g.targetCents);
  const completedGoals = goals.filter((g) => g.savedCents >= g.targetCents);
  const totalSaved = goals.reduce((s, g) => s + g.savedCents, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetCents, 0);
  const overallPct =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const totalAutoMonthly = goals
    .filter((g) => g.autoDepositCents && g.autoDepositInterval === "monthly")
    .reduce((s, g) => s + (g.autoDepositCents ?? 0), 0);

  return (
    <div className="space-y-8 pb-8" data-ocid="savings.page">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            Savings Goals
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build your future, one goal at a time
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="gap-2 shrink-0"
          data-ocid="savings.create_goal_button"
        >
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {/* Hero balance widget */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className="relative overflow-hidden border-border"
          data-ocid="savings.balance_widget"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-accent/60" />

          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Total saved */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Total Savings Balance
                </p>
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-4xl font-bold font-display">
                    {fmtDollarsFull(totalSaved)}
                  </span>
                  {totalTarget > 0 && (
                    <span className="text-muted-foreground text-sm mb-1">
                      of {fmtDollars(totalTarget)} across {goals.length} goal
                      {goals.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {/* Overall progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden max-w-sm">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallPct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {overallPct}% of total savings targets reached
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-4 sm:gap-6 shrink-0">
                {[
                  {
                    label: "Active Goals",
                    value: activeGoals.length,
                    icon: Target,
                  },
                  {
                    label: "Completed",
                    value: completedGoals.length,
                    icon: CheckCircle2,
                  },
                  {
                    label: "Auto / mo",
                    value: fmtDollars(totalAutoMonthly),
                    icon: Repeat,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg font-bold font-display leading-tight">
                      {value}
                    </p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["sk1", "sk2", "sk3", "sk4"] as const).map((skKey) => (
            <Card key={skKey}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-10 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState onCreateGoal={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-8">
          {/* Active goals grid */}
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="font-semibold text-sm">Active Goals</h2>
                <Badge variant="secondary" className="text-xs">
                  {activeGoals.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map((goal, i) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    index={i}
                    onOpenDetail={setDetailGoal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed goals */}
          <CompletedGoalsSection goals={completedGoals} />

          {/* Round-up savings */}
          <RoundUpSection />
        </div>
      )}

      {/* Create Goal modal */}
      <CreateGoalModal open={showCreate} onClose={() => setShowCreate(false)} />

      {/* Goal detail modal */}
      <Dialog
        open={!!detailGoal}
        onOpenChange={(v) => !v && setDetailGoal(null)}
      >
        {detailGoal && (
          <GoalDetailModal
            goal={detailGoal}
            onClose={() => setDetailGoal(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
