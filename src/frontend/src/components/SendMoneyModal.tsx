import type { Currency } from "@/backend.d";
import { TaxBreakdown } from "@/components/TaxBreakdown";
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
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { UserProfile } from "@/hooks/useTransfer";
import { useSendMoney } from "@/hooks/useTransfer";
import {
  ALL_CURRENCIES,
  formatCurrencyDisplay,
  getCurrencySymbol,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RecipientSearch } from "./RecipientSearch";

type Step = "recipient" | "amount" | "review" | "confirm";

interface SendMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const TAX_RATE_BP = 2000; // 20% VAT — illustrative

function calcTax(cents: number) {
  const base = Math.round(cents / 1.2);
  const tax = cents - base;
  return { base, tax };
}

export function SendMoneyModal({
  open,
  onOpenChange,
  onSuccess,
}: SendMoneyModalProps) {
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [note, setNote] = useState("");
  const [txSuccess, setTxSuccess] = useState(false);

  const sendMoney = useSendMoney();
  const { methods } = usePaymentMethods();
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];

  const amountCents = Math.round(Number.parseFloat(amount || "0") * 100);
  const { base: baseAmount, tax: taxAmount } = calcTax(amountCents);

  const resetMutation = sendMoney.reset;

  // Reset state when closed
  // biome-ignore lint/correctness/useExhaustiveDependencies: only want to run when open changes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("recipient");
        setRecipient(null);
        setAmount("");
        setCurrency("USD");
        setNote("");
        setTxSuccess(false);
        resetMutation();
      }, 300);
    }
  }, [open]);

  function handleClose() {
    onOpenChange(false);
  }

  function goBack() {
    if (step === "amount") setStep("recipient");
    else if (step === "review") setStep("amount");
    else if (step === "confirm") setStep("review");
    else handleClose();
  }

  async function handleConfirm() {
    if (!recipient || amountCents <= 0) return;
    try {
      await sendMoney.mutateAsync({
        recipientPrincipal: recipient.userId,
        amountCents,
        currency,
        note,
      });
      setTxSuccess(true);
      setStep("confirm");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Transfer failed. Please retry.",
      );
    }
  }

  const stepLabel: Record<Step, string> = {
    recipient: "Step 1 of 4 — Recipient",
    amount: "Step 2 of 4 — Amount",
    review: "Step 3 of 4 — Review",
    confirm: "Step 4 of 4 — Complete",
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      data-ocid="send_money.dialog"
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="relative z-10 w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card">
          {step !== "recipient" && !txSuccess ? (
            <button
              type="button"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
              data-ocid="send_money.back_button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold font-display">
              {txSuccess ? "Transfer complete" : "Send Money"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {txSuccess ? "Your funds are on the way" : stepLabel[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
            data-ocid="send_money.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress bar */}
        {!txSuccess && (
          <div className="h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width:
                  step === "recipient"
                    ? "25%"
                    : step === "amount"
                      ? "50%"
                      : step === "review"
                        ? "75%"
                        : "100%",
              }}
            />
          </div>
        )}

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1 — RECIPIENT */}
            {step === "recipient" && (
              <motion.div
                key="recipient"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Search by username, user ID, email, or phone number.
                </p>
                <RecipientSearch selected={recipient} onSelect={setRecipient} />
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!recipient}
                  onClick={() => setStep("amount")}
                  data-ocid="send_money.recipient_next_button"
                >
                  Continue
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleClose}
                  data-ocid="send_money.cancel_button"
                >
                  Cancel
                </Button>
              </motion.div>
            )}

            {/* STEP 2 — AMOUNT */}
            {step === "amount" && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                {recipient && <RecipientChip profile={recipient} />}
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(v) => setCurrency(v as CurrencyCode)}
                  >
                    <SelectTrigger data-ocid="send_money.currency_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className="font-mono mr-1">
                            {getCurrencySymbol(c)}
                          </span>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sm-amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                      {getCurrencySymbol(currency as Currency)}
                    </span>
                    <Input
                      id="sm-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      data-ocid="send_money.amount_input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sm-note">
                    Note{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional, emoji welcome 🎉)
                    </span>
                  </Label>
                  <Input
                    id="sm-note"
                    placeholder="What's it for?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    data-ocid="send_money.note_input"
                  />
                </div>

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={amountCents <= 0}
                  onClick={() => setStep("review")}
                  data-ocid="send_money.amount_next_button"
                >
                  Review transfer
                </Button>
              </motion.div>
            )}

            {/* STEP 3 — REVIEW */}
            {step === "review" && recipient && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <RecipientChip profile={recipient} />

                <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                  <ReviewRow
                    label="Amount"
                    value={formatCurrencyDisplay(
                      amountCents,
                      currency as Currency,
                    )}
                    mono
                    highlight
                  />
                  <ReviewRow label="Currency" value={currency} />
                  {note && <ReviewRow label="Note" value={note} />}
                </div>

                <TaxBreakdown
                  baseAmount={baseAmount}
                  taxAmount={taxAmount}
                  taxRate={TAX_RATE_BP}
                  totalAmount={amountCents}
                  currency={currency}
                />

                {defaultMethod && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-xl border border-border">
                    <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">
                      {defaultMethod.label} ·· {defaultMethod.last4}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      Auto-charge
                    </span>
                  </div>
                )}

                {sendMoney.isError && (
                  <div
                    className="text-sm text-destructive bg-destructive/10 rounded-xl p-3"
                    data-ocid="send_money.error_state"
                  >
                    {sendMoney.error instanceof Error
                      ? sendMoney.error.message
                      : "Payment failed. Please try a different method."}
                  </div>
                )}

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleConfirm}
                  disabled={sendMoney.isPending}
                  data-ocid="send_money.confirm_button"
                >
                  {sendMoney.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Confirm &amp; Send
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* STEP 4 — SUCCESS */}
            {step === "confirm" && txSuccess && (
              <motion.div
                key="confirm-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-4"
                data-ocid="send_money.success_state"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-success" />
                </motion.div>
                <div className="text-center">
                  <p className="text-xl font-bold font-display">Money sent!</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatCurrencyDisplay(amountCents, currency as Currency)}{" "}
                    sent to {recipient?.displayName}
                  </p>
                </div>
                <div className="w-full bg-muted/40 rounded-xl p-4 space-y-2">
                  <ReviewRow
                    label="To"
                    value={`${recipient?.displayName} (@${recipient?.username})`}
                  />
                  <ReviewRow
                    label="Amount"
                    value={formatCurrencyDisplay(
                      amountCents,
                      currency as Currency,
                    )}
                    mono
                    highlight
                  />
                  {note && <ReviewRow label="Note" value={note} />}
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleClose}
                  data-ocid="send_money.done_button"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function RecipientChip({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
      {profile.photoUrl ? (
        <img
          src={profile.photoUrl}
          alt={profile.displayName}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
          {profile.displayName
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{profile.displayName}</p>
        <p className="text-xs text-muted-foreground truncate">
          @{profile.username} ·{" "}
          <span className="font-mono">
            #{profile.userId.slice(-8).toUpperCase()}
          </span>
        </p>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium truncate",
          mono && "font-mono",
          highlight && "text-primary font-bold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
