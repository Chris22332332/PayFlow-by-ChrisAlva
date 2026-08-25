import type { Currency } from "@/backend.d";
import { Badge } from "@/components/StatusBadge";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useAddTxAttachment,
  useSetTransactionCategory,
  useSetTransactionNote,
  useSetTransactionTags,
  useToggleTxHidden,
  useTxMetadata,
} from "@/hooks/useTxMetadata";
import { formatCurrencyDisplay } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { SpendingCategory, Transaction } from "@/types";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  Paperclip,
  RefreshCw,
  Tag,
  Upload,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface TransactionDetailProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TYPE_LABELS: Record<Transaction["type"], string> = {
  sent: "Money Sent",
  received: "Money Received",
  added: "Funds Added",
  withdrawn: "Funds Withdrawn",
  request: "Payment Request",
};

const STATUS_VARIANT: Record<
  Transaction["status"],
  "success" | "warning" | "destructive"
> = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
};

const CATEGORY_OPTIONS: {
  value: SpendingCategory;
  label: string;
  emoji: string;
}[] = [
  { value: "food", label: "Food & Dining", emoji: "🍕" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "entertainment", label: "Entertainment", emoji: "🎮" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "utilities", label: "Utilities", emoji: "⚡" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "transfers", label: "Transfers", emoji: "💸" },
  { value: "subscriptions", label: "Subscriptions", emoji: "🔄" },
  { value: "other", label: "Other", emoji: "📦" },
];

const DISPUTE_REASONS = [
  "I did not authorize this transaction",
  "Amount is incorrect",
  "Goods/services not received",
  "Duplicate charge",
  "Subscription not cancelled",
  "Other",
];

const COMMON_TAGS = [
  "business",
  "personal",
  "reimbursable",
  "tax-deductible",
  "recurring",
  "one-time",
  "gift",
  "urgent",
];

function formatDateFull(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function CounterpartyAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[@.\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
      {initials || <User className="h-5 w-5" />}
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  mono = false,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-right max-w-[60%] break-all",
          mono && "font-mono",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DisputeModal({
  tx,
  onClose,
}: {
  tx: Transaction;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Dispute submitted. We'll review within 3-5 business days.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close dispute"
      />
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
        data-ocid="dispute.dialog"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold">Dispute Transaction</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
            data-ocid="dispute.close_button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <p className="font-semibold">Dispute Submitted</p>
            <p className="text-sm text-muted-foreground">
              Reference:{" "}
              <span className="font-mono text-foreground">
                DSP-{tx.id.slice(-8).toUpperCase()}
              </span>
            </p>
            <Button
              onClick={onClose}
              className="mt-2"
              data-ocid="dispute.done_button"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-sm">
              <span className="text-muted-foreground">Transaction: </span>
              <span className="font-medium">
                {formatCurrencyDisplay(tx.amount, tx.currency as Currency)}
              </span>
              <span className="text-muted-foreground"> · {tx.description}</span>
            </div>
            <div className="space-y-1.5">
              <Label>Reason for dispute</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger data-ocid="dispute.reason_select">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {DISPUTE_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Additional details</Label>
              <textarea
                className="w-full text-sm bg-muted/40 border border-input rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                placeholder="Describe what happened..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                data-ocid="dispute.description_textarea"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-ocid="dispute.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={!reason || submitting}
                onClick={handleSubmit}
                data-ocid="dispute.submit_button"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export function TransactionDetail({
  transaction: tx,
  onClose,
}: TransactionDetailProps) {
  const isOpen = tx !== null;
  const { data: meta, isLoading: metaLoading } = useTxMetadata(tx?.id ?? "");
  const setNote = useSetTransactionNote();
  const setTags = useSetTransactionTags();
  const setCategory = useSetTransactionCategory();
  const toggleHidden = useToggleTxHidden();
  const addAttachment = useAddTxAttachment();

  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveNote = async () => {
    if (!tx) return;
    await setNote.mutateAsync({ txId: tx.id, note: noteVal });
    setEditingNote(false);
    toast.success("Note saved");
  };

  const handleAddTag = async (tag: string) => {
    if (!tx || !tag.trim()) return;
    const currentTags = meta?.tags ?? [];
    if (currentTags.includes(tag.trim())) return;
    await setTags.mutateAsync({
      txId: tx.id,
      tags: [...currentTags, tag.trim()],
    });
    setTagInput("");
    toast.success("Tag added");
  };

  const handleRemoveTag = async (tag: string) => {
    if (!tx) return;
    const currentTags = (meta?.tags ?? []).filter((t) => t !== tag);
    await setTags.mutateAsync({ txId: tx.id, tags: currentTags });
  };

  const handleCategoryChange = async (cat: SpendingCategory) => {
    if (!tx) return;
    await setCategory.mutateAsync({ txId: tx.id, category: cat });
    toast.success("Category updated");
  };

  const handleToggleHidden = async () => {
    if (!tx) return;
    await toggleHidden.mutateAsync({ txId: tx.id, hidden: !meta?.isHidden });
    toast.success(
      meta?.isHidden
        ? "Transaction visible in activity"
        : "Transaction hidden from activity",
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tx || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    // Simulate upload with a fake URL for now
    const fakeUrl = URL.createObjectURL(file);
    await addAttachment.mutateAsync({ txId: tx.id, url: fakeUrl });
    toast.success("Receipt attached");
    e.target.value = "";
  };

  const currentCategory = meta?.category;
  const categoryInfo = CATEGORY_OPTIONS.find(
    (c) => c.value === currentCategory,
  );
  const isCredit = tx ? tx.type === "received" || tx.type === "added" : false;

  return (
    <AnimatePresence>
      {isOpen && tx && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
            data-ocid="transaction_detail.panel"
          >
            {/* Header */}
            <div className="receipt-header px-5 pt-5 pb-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "rounded-full p-2 shrink-0",
                    isCredit ? "bg-success/10" : "bg-muted",
                  )}
                >
                  {isCredit ? (
                    <ArrowDownLeft className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="font-semibold text-sm">
                  {TYPE_LABELS[tx.type]}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleHidden}
                  className="rounded-full h-8 w-8"
                  title={
                    meta?.isHidden ? "Show in activity" : "Hide from activity"
                  }
                  data-ocid="transaction_detail.visibility_toggle"
                >
                  {meta?.isHidden ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full h-8 w-8"
                  data-ocid="transaction_detail.close_button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
              {/* Amount hero */}
              <div className="text-center py-4">
                <p
                  className="receipt-amount"
                  data-ocid="transaction_detail.amount"
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrencyDisplay(tx.amount, tx.currency as Currency)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <span className="badge-currency">{tx.currency}</span>
                  <Badge
                    variant={STATUS_VARIANT[tx.status]}
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                  {meta?.isHidden && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Counterparty */}
              {tx.counterparty && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                  <CounterpartyAvatar name={tx.counterparty} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {tx.counterparty}
                    </p>
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Category</span>
                  {categoryInfo && (
                    <span className="text-sm text-muted-foreground">
                      {categoryInfo.emoji} {categoryInfo.label}
                    </span>
                  )}
                </div>
                <Select
                  value={currentCategory ?? ""}
                  onValueChange={(v) =>
                    handleCategoryChange(v as SpendingCategory)
                  }
                >
                  <SelectTrigger
                    className="bg-muted/40 border-transparent"
                    data-ocid="transaction_detail.category_select"
                  >
                    <SelectValue placeholder="Set category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.emoji} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Note</span>
                  {!editingNote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setNoteVal(meta?.note ?? "");
                        setEditingNote(true);
                      }}
                      data-ocid="transaction_detail.edit_note_button"
                    >
                      {meta?.note ? "Edit" : "Add note"}
                    </Button>
                  )}
                </div>
                {editingNote ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full text-sm bg-muted/40 border border-input rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[72px]"
                      placeholder="Add a personal note..."
                      value={noteVal}
                      onChange={(e) => setNoteVal(e.target.value)}
                      data-ocid="transaction_detail.note_textarea"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingNote(false)}
                        data-ocid="transaction_detail.note_cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={setNote.isPending}
                        onClick={handleSaveNote}
                        data-ocid="transaction_detail.note_save_button"
                      >
                        {setNote.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground min-h-[32px] px-3 py-2 bg-muted/20 rounded-lg">
                    {meta?.note || (
                      <span className="italic">No note added</span>
                    )}
                  </p>
                )}
              </div>

              {/* Tags */}
              {!metaLoading && (
                <div className="space-y-2">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(meta?.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="rounded-full hover:bg-primary/20 transition-colors"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {(meta?.tags ?? []).length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
                        No tags yet
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      className="text-sm h-8 bg-muted/40 border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          handleAddTag(tagInput.trim());
                        }
                      }}
                      data-ocid="transaction_detail.tag_input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0"
                      disabled={!tagInput.trim()}
                      onClick={() => handleAddTag(tagInput.trim())}
                      data-ocid="transaction_detail.add_tag_button"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_TAGS.filter((t) => !(meta?.tags ?? []).includes(t))
                      .slice(0, 4)
                      .map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5 hover:border-primary/40 hover:text-primary transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Tax Breakdown */}
              {tx.tax_amount > 0 && (
                <TaxBreakdown
                  baseAmount={tx.base_amount}
                  taxAmount={tx.tax_amount}
                  taxRate={tx.tax_rate}
                  totalAmount={tx.amount}
                  currency={tx.currency}
                />
              )}

              <Separator />

              {/* Receipt details */}
              <div className="divide-y divide-border/50">
                <ReceiptRow
                  label="Date & Time"
                  value={formatDateFull(tx.timestamp)}
                />
                {tx.paymentMethodLast4 && (
                  <ReceiptRow
                    label="Payment method"
                    value={
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        •••• {tx.paymentMethodLast4}
                      </span>
                    }
                  />
                )}
                {tx.referenceId && (
                  <ReceiptRow
                    label="Reference"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        {tx.referenceId}
                      </span>
                    }
                    mono
                  />
                )}
                {tx.tax_amount > 0 && (
                  <>
                    <ReceiptRow
                      label="Tax rate"
                      value={`${(tx.tax_rate / 100).toFixed(0)}% VAT`}
                      muted
                    />
                    <ReceiptRow
                      label="Tax paid"
                      value={formatCurrencyDisplay(
                        tx.tax_amount,
                        tx.currency as Currency,
                      )}
                      mono
                    />
                  </>
                )}
              </div>

              {/* Cross-currency section */}
              {tx.original_currency && tx.original_amount != null && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        Currency Conversion
                      </span>
                    </div>
                    <div className="divide-y divide-border/50 bg-muted/20 rounded-xl px-3">
                      <ReceiptRow
                        label="Original amount"
                        value={formatCurrencyDisplay(
                          tx.original_amount,
                          tx.original_currency as Currency,
                        )}
                        mono
                      />
                      <ReceiptRow
                        label="Original currency"
                        value={
                          <span className="badge-currency">
                            {tx.original_currency}
                          </span>
                        }
                      />
                      <ReceiptRow
                        label="Converted to"
                        value={
                          <span className="badge-currency">{tx.currency}</span>
                        }
                      />
                      <ReceiptRow
                        label="Rate used"
                        value={
                          <span className="fx-rate">
                            1 {tx.original_currency} ={" "}
                            {(tx.amount / tx.original_amount).toFixed(4)}{" "}
                            {tx.currency}
                          </span>
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Bank/institution info */}
              {(tx.type === "added" || tx.type === "withdrawn") && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">
                        Processed via PayFlow wallet
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Attachments */}
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" /> Receipts & Attachments
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => fileRef.current?.click()}
                    data-ocid="transaction_detail.upload_button"
                  >
                    <Upload className="h-3 w-3" /> Upload
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {(meta?.attachments ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {meta!.attachments.map((url, i) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline underline-offset-2"
                      >
                        Receipt {i + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No receipts attached
                  </p>
                )}
              </div>

              {/* Public/Private toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Visible in activity feed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Show this transaction publicly
                  </p>
                </div>
                <Switch
                  checked={!meta?.isHidden}
                  onCheckedChange={(checked) => {
                    if (!tx) return;
                    toggleHidden.mutate({ txId: tx.id, hidden: !checked });
                  }}
                  data-ocid="transaction_detail.public_private_switch"
                />
              </div>

              {/* Dispute button for sent/failed */}
              {(tx.type === "sent" || tx.type === "withdrawn") &&
                tx.status !== "failed" && (
                  <>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/5"
                      onClick={() => setShowDispute(true)}
                      data-ocid="transaction_detail.dispute_button"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Dispute Transaction
                    </Button>
                  </>
                )}
            </div>
          </motion.div>

          {/* Dispute modal rendered above the panel */}
          <AnimatePresence>
            {showDispute && (
              <DisputeModal tx={tx} onClose={() => setShowDispute(false)} />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
