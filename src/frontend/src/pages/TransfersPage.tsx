import type { Currency } from "@/backend.d";
import { FxRateDisplay } from "@/components/FxRateDisplay";
import { SendMoneyModal } from "@/components/SendMoneyModal";
import { Badge } from "@/components/StatusBadge";
import { TransactionDetail } from "@/components/TransactionDetail";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBalance } from "@/hooks/useBalance";
import { useTransactions } from "@/hooks/useTransactions";
import {
  DEFAULT_FILTERS,
  type FilterPreset,
  type TxFilters,
  useAllTxMetadata,
  useBulkAddTags,
  useBulkSelection,
  useDeleteFilterPreset,
  useFilterPresets,
  useSaveFilterPreset,
  useSoftDeleteTx,
} from "@/hooks/useTxMetadata";
import {
  ALL_CURRENCIES,
  formatCurrencyDisplay,
  getCurrencySymbol,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { CurrencyCode, SpendingCategory, Transaction } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookmarkPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  Search,
  Send,
  SlidersHorizontal,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const CATEGORY_EMOJI: Record<SpendingCategory, string> = {
  food: "🍕",
  transport: "🚗",
  entertainment: "🎮",
  shopping: "🛍️",
  health: "💊",
  utilities: "⚡",
  travel: "✈️",
  transfers: "💸",
  subscriptions: "🔄",
  other: "📦",
};

const TAG_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-accent/10 text-accent-foreground border-accent/20",
  "bg-success/10 text-success border-success/20",
  "bg-warning/10 text-warning-foreground border-warning/20",
];

function tagColor(tag: string) {
  const idx = tag.charCodeAt(0) % TAG_COLORS.length;
  return TAG_COLORS[idx];
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_VARIANT: Record<
  Transaction["status"],
  "success" | "warning" | "destructive"
> = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
};

interface TxRowProps {
  tx: Transaction;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  tags: string[];
  category?: SpendingCategory;
  note?: string;
}

function TxRow({
  tx,
  index,
  selected,
  onSelect,
  onClick,
  tags,
  category,
  note,
}: TxRowProps) {
  const isCredit = tx.type === "received" || tx.type === "added";
  const hasFx = tx.original_currency && tx.original_currency !== tx.currency;
  const catEmoji = category ? CATEGORY_EMOJI[category] : null;

  const ocid = `transfers.item.${index + 1}`;
  return (
    <button
      type="button"
      data-ocid={ocid}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth cursor-pointer group w-full text-left",
        selected
          ? "bg-primary/5 border border-primary/20"
          : "hover:bg-muted/40 border border-transparent",
      )}
      onClick={onClick}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === " ") onSelect();
        }}
        className="shrink-0"
        aria-label="Select transaction"
      >
        <Checkbox
          checked={selected}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          data-ocid={`transfers.checkbox.${index + 1}`}
        />
      </button>

      <div
        className={cn(
          "rounded-full p-2.5 shrink-0",
          isCredit ? "bg-success/10" : "bg-muted",
        )}
      >
        {catEmoji ? (
          <span className="text-base leading-none">{catEmoji}</span>
        ) : isCredit ? (
          <ArrowDownLeft className="h-4 w-4 text-success" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground truncate">
          {tx.counterparty ? `${tx.counterparty} · ` : ""}
          {formatDate(tx.timestamp)}
        </p>
        {note && (
          <p className="text-xs text-muted-foreground italic truncate mt-0.5 max-w-[200px]">
            "{note}"
          </p>
        )}
        {hasFx && tx.original_currency && tx.original_amount != null && (
          <p className="fx-rate mt-0.5">
            Originally {getCurrencySymbol(tx.original_currency as Currency)}{" "}
            {(tx.original_amount / 100).toFixed(2)} {tx.original_currency}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "inline-flex items-center text-[10px] rounded-full border px-1.5 py-0",
                  tagColor(tag),
                )}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        <p
          className={cn(
            "text-sm font-semibold font-mono",
            isCredit ? "text-success" : "text-foreground",
          )}
        >
          {isCredit ? "+" : "-"}
          {formatCurrencyDisplay(tx.amount, tx.currency as Currency)}
        </p>
        <Badge variant={STATUS_VARIANT[tx.status]} className="text-[10px]">
          {tx.status}
        </Badge>
      </div>
    </button>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: TxFilters;
  onChange: (f: TxFilters) => void;
  onClose: () => void;
  onSavePreset: () => void;
  presets: FilterPreset[];
  onLoadPreset: (p: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
}

function FilterPanel({
  filters,
  onChange,
  onClose,
  onSavePreset,
  presets,
  onLoadPreset,
  onDeletePreset,
}: FilterPanelProps) {
  const set = <K extends keyof TxFilters>(key: K, val: TxFilters[K]) =>
    onChange({ ...filters, [key]: val });

  const toggleType = (t: string) => {
    const cur = filters.types;
    set("types", cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);
  };

  const toggleCurrency = (c: string) => {
    const cur = filters.currencies;
    set(
      "currencies",
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
    );
  };

  const TX_TYPES = ["sent", "received", "request", "added", "withdrawn"];
  const STATUSES = ["all", "completed", "pending", "failed"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-2xl p-4 shadow-lg space-y-4"
      data-ocid="transfers.filter_panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4" /> Advanced Filters
        </h3>
        <div className="flex items-center gap-1">
          {presets.length > 0 && (
            <Select
              onValueChange={(id) => {
                const p = presets.find((x) => x.id === id);
                if (p) onLoadPreset(p);
              }}
            >
              <SelectTrigger
                className="h-7 text-xs w-36 bg-muted/40 border-transparent"
                data-ocid="transfers.preset_select"
              >
                <SelectValue placeholder="Load preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={onSavePreset}
            data-ocid="transfers.save_preset_button"
          >
            <BookmarkPlus className="h-3.5 w-3.5" /> Save
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            data-ocid="transfers.close_filter_button"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From date</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set("dateFrom", e.target.value)}
            className="h-8 text-sm bg-muted/40 border-transparent"
            data-ocid="transfers.filter.date_from_input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To date</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set("dateTo", e.target.value)}
            className="h-8 text-sm bg-muted/40 border-transparent"
            data-ocid="transfers.filter.date_to_input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Min amount ($)
          </Label>
          <Input
            type="number"
            value={filters.amountMin}
            onChange={(e) => set("amountMin", e.target.value)}
            placeholder="0"
            className="h-8 text-sm bg-muted/40 border-transparent"
            data-ocid="transfers.filter.amount_min_input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Max amount ($)
          </Label>
          <Input
            type="number"
            value={filters.amountMax}
            onChange={(e) => set("amountMax", e.target.value)}
            placeholder="∞"
            className="h-8 text-sm bg-muted/40 border-transparent"
            data-ocid="transfers.filter.amount_max_input"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Transaction type
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {TX_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              data-ocid={`transfers.filter.type_${t}`}
              className={cn(
                "text-xs rounded-full px-2.5 py-0.5 border capitalize transition-colors",
                filters.types.includes(t)
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", s)}
              data-ocid={`transfers.filter.status_${s}`}
              className={cn(
                "text-xs rounded-full px-2.5 py-0.5 border capitalize transition-colors",
                filters.status === s
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Currency</Label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCurrency(c)}
              data-ocid={`transfers.filter.currency_${c}`}
              className={cn(
                "text-xs rounded-full px-2.5 py-0.5 border font-mono transition-colors",
                filters.currencies.includes(c)
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onChange(DEFAULT_FILTERS)}
          data-ocid="transfers.filter.reset_button"
        >
          Reset all
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={onClose}
          data-ocid="transfers.filter.apply_button"
        >
          Apply
        </Button>
      </div>

      {presets.length > 0 && (
        <div className="space-y-1 border-t border-border pt-3">
          <Label className="text-xs text-muted-foreground">Saved presets</Label>
          {presets.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={() => onLoadPreset(p)}
                className="text-xs text-foreground hover:text-primary transition-colors text-left"
              >
                {p.name}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onDeletePreset(p.id)}
                data-ocid="transfers.preset.delete_button"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Bulk actions bar ──────────────────────────────────────────────────────────

interface BulkBarProps {
  selected: string[];
  allIds: string[];
  onSelectAll: () => void;
  onClearAll: () => void;
  onBulkExport: () => void;
  onBulkTag: () => void;
  onBulkDelete: () => void;
}

function BulkBar({
  selected,
  allIds,
  onSelectAll,
  onClearAll,
  onBulkExport,
  onBulkTag,
  onBulkDelete,
}: BulkBarProps) {
  const isAllSelected = selected.length === allIds.length && allIds.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-sm"
      data-ocid="transfers.bulk_bar"
    >
      <span className="font-medium text-primary">
        {selected.length} selected
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={isAllSelected ? onClearAll : onSelectAll}
        data-ocid="transfers.bulk.select_all_button"
      >
        {isAllSelected ? "Deselect all" : "Select all"}
      </Button>
      <div className="flex-1" />
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs"
        onClick={onBulkExport}
        data-ocid="transfers.bulk.export_button"
      >
        <Download className="h-3 w-3" /> Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs"
        onClick={onBulkTag}
        data-ocid="transfers.bulk.tag_button"
      >
        <Tag className="h-3 w-3" /> Tag
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={onBulkDelete}
        data-ocid="transfers.bulk.delete_button"
      >
        <Trash2 className="h-3 w-3" /> Delete
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onClearAll}
        data-ocid="transfers.bulk.clear_button"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}

// ── Export PDF helper (simulated) ─────────────────────────────────────────────

function exportPdf(transactions: Transaction[]) {
  const lines = [
    "PayFlow — Transaction Statement",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Date,Description,Type,Amount,Currency,Status",
    ...transactions.map((tx) =>
      [
        new Date(tx.timestamp).toLocaleDateString(),
        `"${tx.description}"`,
        tx.type,
        (tx.amount / 100).toFixed(2),
        tx.currency,
        tx.status,
      ].join(","),
    ),
  ].join("\n");
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payflow-statement-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TransfersPage() {
  const { transactions, isLoading, requestMoney, exportCsv } =
    useTransactions();
  const { multiCurrencyBalances, sendMoneyWithFx } = useBalance();
  const { data: allMeta } = useAllTxMetadata();
  const { selected, toggle, selectAll, clearAll } = useBulkSelection();
  const softDelete = useSoftDeleteTx();
  const bulkAddTags = useBulkAddTags();
  const savePreset = useSaveFilterPreset();
  const deletePreset = useDeleteFilterPreset();
  const { data: presets = [] } = useFilterPresets();

  const [filters, setFilters] = useState<TxFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [page, setPage] = useState(1);
  const [presetNameModal, setPresetNameModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [bulkTagModal, setBulkTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Legacy quick-send state
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sourceCurrency] = useState<CurrencyCode>("USD");
  const [recipientCurrency] = useState<CurrencyCode>("USD");

  const [requestFrom, setRequestFrom] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");

  const sendAmountCents = Math.round(
    Number.parseFloat(sendAmount || "0") * 100,
  );
  const isCrossCurrency = sourceCurrency !== recipientCurrency;
  const availableSourceCurrencies: CurrencyCode[] = multiCurrencyBalances
    .filter((b) => b.amount > 0)
    .map((b) => b.currency as CurrencyCode);
  void availableSourceCurrencies;

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      const meta = allMeta?.[tx.id];
      if (meta?.isHidden) return false;

      // type filter
      if (filters.types.length > 0 && !filters.types.includes(tx.type))
        return false;

      // status filter
      if (filters.status !== "all" && tx.status !== filters.status)
        return false;

      // currency filter
      if (
        filters.currencies.length > 0 &&
        !filters.currencies.includes(tx.currency)
      )
        return false;

      // date range
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        if (tx.timestamp < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime() + 86400000;
        if (tx.timestamp > to) return false;
      }

      // amount range (in dollars)
      if (filters.amountMin) {
        if (tx.amount / 100 < Number.parseFloat(filters.amountMin))
          return false;
      }
      if (filters.amountMax) {
        if (tx.amount / 100 > Number.parseFloat(filters.amountMax))
          return false;
      }

      // tags filter
      if (filters.tags.length > 0) {
        const txTags = meta?.tags ?? [];
        if (!filters.tags.some((tag) => txTags.includes(tag))) return false;
      }

      // search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCp = (tx.counterparty ?? "").toLowerCase().includes(q);
        const matchNote = (meta?.note ?? "").toLowerCase().includes(q);
        if (!matchDesc && !matchCp && !matchNote) return false;
      }

      return true;
    });
  }, [transactions, filters, allMeta]);

  // Active filter pills
  const activeFilters: Array<{
    label: string;
    key: keyof TxFilters;
    value?: string;
  }> = [];
  if (filters.search)
    activeFilters.push({ label: `"${filters.search}"`, key: "search" });
  if (filters.dateFrom)
    activeFilters.push({ label: `From ${filters.dateFrom}`, key: "dateFrom" });
  if (filters.dateTo)
    activeFilters.push({ label: `To ${filters.dateTo}`, key: "dateTo" });
  if (filters.amountMin)
    activeFilters.push({
      label: `Min $${filters.amountMin}`,
      key: "amountMin",
    });
  if (filters.amountMax)
    activeFilters.push({
      label: `Max $${filters.amountMax}`,
      key: "amountMax",
    });
  if (filters.status !== "all")
    activeFilters.push({ label: `Status: ${filters.status}`, key: "status" });
  for (const t of filters.types)
    activeFilters.push({ label: t, key: "types", value: t });
  for (const c of filters.currencies)
    activeFilters.push({ label: c, key: "currencies", value: c });

  const hasActiveFilters = activeFilters.length > 0;

  const removeFilter = (key: keyof TxFilters, value?: string) => {
    if (value) {
      const arr = filters[key] as string[];
      setFilters({ ...filters, [key]: arr.filter((x) => x !== value) });
    } else if (key === "status") {
      setFilters({ ...filters, status: "all" });
    } else {
      setFilters({ ...filters, [key]: DEFAULT_FILTERS[key] });
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTx.length / PAGE_SIZE));
  const pagedTx = filteredTx.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSendConfirm = async () => {
    if (!sendTo || !sendAmount) return;
    try {
      if (isCrossCurrency) {
        await sendMoneyWithFx.mutateAsync({
          recipient: sendTo,
          amount: sendAmountCents,
          fromCurrency: sourceCurrency as Currency,
          toCurrency: recipientCurrency as Currency,
          note: sendNote,
        });
      }
      toast.success(
        `${formatCurrencyDisplay(sendAmountCents, sourceCurrency as Currency)} sent to ${sendTo}`,
      );
      setConfirmSend(false);
      setSendTo("");
      setSendAmount("");
      setSendNote("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Transfer failed. Please try again.",
      );
    }
  };

  const handleRequestSubmit = async () => {
    if (!requestFrom || !requestAmount) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const amountCents = Math.round(Number.parseFloat(requestAmount) * 100);
    if (amountCents <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      await requestMoney.mutateAsync({
        payerIdentifier: requestFrom,
        amountCents,
        note: requestNote,
      });
      toast.success("Payment request sent!");
      setRequestOpen(false);
      setRequestFrom("");
      setRequestAmount("");
      setRequestNote("");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send request. Please try again.",
      );
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    await savePreset.mutateAsync({ name: presetName.trim(), filters });
    setPresetName("");
    setPresetNameModal(false);
    toast.success("Filter preset saved");
  };

  const handleBulkTag = async () => {
    if (!bulkTagInput.trim()) return;
    await bulkAddTags.mutateAsync({
      txIds: selected,
      tags: [bulkTagInput.trim()],
    });
    setBulkTagInput("");
    setBulkTagModal(false);
    toast.success(`Tag added to ${selected.length} transactions`);
  };

  const handleBulkDelete = async () => {
    await softDelete.mutateAsync({ txIds: selected, deleted: true });
    clearAll();
    setConfirmBulkDelete(false);
    toast.success(`${selected.length} transaction(s) hidden`);
  };

  const handleBulkExport = () => {
    const txs = transactions.filter((tx) => selected.includes(tx.id));
    exportPdf(txs);
    toast.success(`Exported ${txs.length} transactions`);
  };

  const isSending = sendMoneyWithFx.isPending;

  return (
    <div className="space-y-4" data-ocid="transfers.page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display font-bold text-2xl">Transfers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Send money, request payments, and track transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setRequestOpen(true)}
            data-ocid="transfers.request_button"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Request
          </Button>
          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setSendOpen(true)}
            data-ocid="transfers.send_button"
          >
            <Send className="h-4 w-4" />
            Send Money
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
        data-ocid="transfers.history_section"
      >
        <div className="p-4 border-b border-border space-y-3">
          {/* Top row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
              {(["all", "sent", "received"] as const).map((tab) => {
                const isActive =
                  tab === "all"
                    ? filters.types.length === 0
                    : filters.types.length === 1 &&
                      ((tab === "sent" &&
                        (filters.types[0] === "sent" ||
                          filters.types[0] === "withdrawn")) ||
                        (tab === "received" &&
                          (filters.types[0] === "received" ||
                            filters.types[0] === "added")));
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      if (tab === "all") setFilters({ ...filters, types: [] });
                      else if (tab === "sent")
                        setFilters({
                          ...filters,
                          types: ["sent", "withdrawn"],
                        });
                      else
                        setFilters({
                          ...filters,
                          types: ["received", "added"],
                        });
                      setPage(1);
                    }}
                    data-ocid={`transfers.${tab}_tab`}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-smooth",
                      isActive
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => setShowFilters(!showFilters)}
                data-ocid="transfers.filter_toggle_button"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-0.5 bg-primary/20 text-primary text-[10px] rounded-full px-1.5 py-0 font-bold">
                    {activeFilters.length}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showFilters && "rotate-180",
                  )}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => exportCsv.mutate()}
                disabled={exportCsv.isPending}
                data-ocid="transfers.export_csv_button"
              >
                {exportCsv.isPending ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => exportPdf(filteredTx)}
                data-ocid="transfers.export_pdf_button"
              >
                <FileText className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              placeholder="Search by description, counterparty, or note..."
              className="pl-9 bg-muted/40 border-transparent focus:border-ring"
              data-ocid="transfers.search_input"
            />
          </div>

          {/* Filter pills */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5"
                data-ocid="transfers.filter_pills"
              >
                {activeFilters.map((f, i) => (
                  <span
                    key={`${f.key}-${f.value ?? i}`}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                  >
                    {f.label}
                    <button
                      type="button"
                      onClick={() => removeFilter(f.key, f.value)}
                      className="hover:bg-primary/20 rounded-full transition-colors"
                      aria-label={`Remove filter ${f.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid="transfers.clear_all_filters_button"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <FilterPanel
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
                onClose={() => setShowFilters(false)}
                onSavePreset={() => setPresetNameModal(true)}
                presets={presets}
                onLoadPreset={(p) => {
                  setFilters(p.filters);
                  setPage(1);
                  toast.success(`Preset "${p.name}" applied`);
                }}
                onDeletePreset={(id) => {
                  deletePreset.mutate(id);
                  toast.success("Preset deleted");
                }}
              />
            )}
          </AnimatePresence>

          {/* Bulk actions bar */}
          <AnimatePresence>
            {selected.length > 0 && (
              <BulkBar
                selected={selected}
                allIds={pagedTx.map((tx) => tx.id)}
                onSelectAll={() => selectAll(pagedTx.map((tx) => tx.id))}
                onClearAll={clearAll}
                onBulkExport={handleBulkExport}
                onBulkTag={() => setBulkTagModal(true)}
                onBulkDelete={() => setConfirmBulkDelete(true)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Transaction list */}
        <div className="divide-y divide-border/50 px-2 py-2">
          {isLoading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="transfers.loading_state"
            >
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : pagedTx.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No transactions found"
              description="Transactions matching your filters will appear here."
              data-ocid="transfers.empty_state"
            />
          ) : (
            pagedTx.map((tx, i) => {
              const meta = allMeta?.[tx.id];
              return (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  index={(page - 1) * PAGE_SIZE + i}
                  selected={selected.includes(tx.id)}
                  onSelect={() => toggle(tx.id)}
                  onClick={() => setSelectedTx(tx)}
                  tags={meta?.tags ?? []}
                  category={meta?.category}
                  note={meta?.note}
                />
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredTx.length)} of{" "}
              {filteredTx.length} transactions
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                data-ocid="transfers.pagination_prev"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground px-1">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                data-ocid="transfers.pagination_next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Transaction detail drawer */}
      <TransactionDetail
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Send Money Modal */}
      <SendMoneyModal
        open={sendOpen}
        onOpenChange={setSendOpen}
        onSuccess={() => {}}
      />

      <ConfirmModal
        open={confirmSend}
        onOpenChange={setConfirmSend}
        title="Confirm transfer"
        description={
          isCrossCurrency
            ? `Sending ${formatCurrencyDisplay(sendAmountCents, sourceCurrency as Currency)} → ${recipientCurrency} to ${sendTo || "recipient"} at current FX rate. This action cannot be undone.`
            : `You are about to send ${formatCurrencyDisplay(sendAmountCents, sourceCurrency as Currency)} to ${sendTo || "recipient"}. This action cannot be undone.`
        }
        confirmLabel="Send money"
        onConfirm={handleSendConfirm}
        isLoading={isSending}
        data-ocid="transfers.send.confirm.dialog"
      />

      {/* Request Money Modal */}
      <Modal
        open={requestOpen}
        onOpenChange={(open) => {
          setRequestOpen(open);
          if (!open) {
            setRequestFrom("");
            setRequestAmount("");
            setRequestNote("");
          }
        }}
        title="Request money"
        description="Ask someone to send you money via PayFlow."
        data-ocid="transfers.request.dialog"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="request-from">From</Label>
            <Input
              id="request-from"
              placeholder="Username, email, or phone"
              value={requestFrom}
              onChange={(e) => setRequestFrom(e.target.value)}
              data-ocid="transfers.request.from_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="request-amount">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="request-amount"
                type="number"
                placeholder="0.00"
                className="pl-6"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                data-ocid="transfers.request.amount_input"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="request-note">Note (optional)</Label>
            <Input
              id="request-note"
              placeholder="What's it for?"
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              data-ocid="transfers.request.note_input"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRequestOpen(false)}
              data-ocid="transfers.request.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={
                !requestFrom || !requestAmount || requestMoney.isPending
              }
              onClick={handleRequestSubmit}
              data-ocid="transfers.request.submit_button"
            >
              {requestMoney.isPending ? "Sending..." : "Send request"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Save preset name modal */}
      <Modal
        open={presetNameModal}
        onOpenChange={setPresetNameModal}
        title="Save filter preset"
        description="Give this filter combination a name so you can reuse it."
        data-ocid="transfers.save_preset.dialog"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Preset name</Label>
            <Input
              placeholder="e.g. Large USD payments"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
              data-ocid="transfers.preset.name_input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPresetNameModal(false)}
              data-ocid="transfers.preset.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!presetName.trim() || savePreset.isPending}
              onClick={handleSavePreset}
              data-ocid="transfers.preset.save_button"
            >
              Save preset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk tag modal */}
      <Modal
        open={bulkTagModal}
        onOpenChange={setBulkTagModal}
        title="Tag selected transactions"
        description={`Add a tag to ${selected.length} selected transaction(s).`}
        data-ocid="transfers.bulk_tag.dialog"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Tag</Label>
            <Input
              placeholder="e.g. business, tax-deductible"
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBulkTag()}
              data-ocid="transfers.bulk_tag.input"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {["business", "personal", "tax-deductible", "reimbursable"].map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBulkTagInput(t)}
                  className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {t}
                </button>
              ),
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setBulkTagModal(false)}
              data-ocid="transfers.bulk_tag.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!bulkTagInput.trim() || bulkAddTags.isPending}
              onClick={handleBulkTag}
              data-ocid="transfers.bulk_tag.submit_button"
            >
              {bulkAddTags.isPending ? "Adding..." : "Add tag"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk delete confirm */}
      <ConfirmModal
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title={`Hide ${selected.length} transaction(s)?`}
        description="These transactions will be hidden from your history. You can restore them later."
        confirmLabel="Hide transactions"
        onConfirm={handleBulkDelete}
        isLoading={softDelete.isPending}
        data-ocid="transfers.bulk_delete.dialog"
      />

      {/* FX rate display for cross-currency send */}
      {isCrossCurrency && sendAmountCents > 0 && (
        <FxRateDisplay
          from={sourceCurrency as Currency}
          to={recipientCurrency as Currency}
          sourceAmount={sendAmountCents}
        />
      )}
    </div>
  );
}
