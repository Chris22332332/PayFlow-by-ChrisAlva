import type { SpendingCategory, TxMetadata } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Transaction metadata store ───────────────────────────────────────────────

const META_KEY = "payflow_tx_metadata_v1";
const FILTER_PRESETS_KEY = "payflow_filter_presets_v1";
const BULK_SELECTION_KEY = "payflow_bulk_selection_v1";

export interface FilterPreset {
  id: string;
  name: string;
  filters: TxFilters;
  createdAt: number;
}

export interface TxFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  types: string[];
  status: string;
  currencies: string[];
  tags: string[];
}

export const DEFAULT_FILTERS: TxFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  types: [],
  status: "all",
  currencies: [],
  tags: [],
};

function loadAllMeta(): Record<string, TxMetadata> {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TxMetadata>) : {};
  } catch {
    return {};
  }
}

function saveAllMeta(data: Record<string, TxMetadata>) {
  localStorage.setItem(META_KEY, JSON.stringify(data));
}

function defaultMeta(txId: string): TxMetadata {
  return {
    txId,
    tags: [],
    note: "",
    isHidden: false,
    attachments: [],
  };
}

// ── Single transaction metadata ──────────────────────────────────────────────

export function useTxMetadata(txId: string) {
  return useQuery<TxMetadata>({
    queryKey: ["tx_metadata", txId],
    queryFn: () => {
      const all = loadAllMeta();
      return all[txId] ?? defaultMeta(txId);
    },
  });
}

export function useAllTxMetadata() {
  return useQuery<Record<string, TxMetadata>>({
    queryKey: ["tx_metadata_all"],
    queryFn: () => loadAllMeta(),
  });
}

export function useSetTransactionTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ txId, tags }: { txId: string; tags: string[] }) => {
      const all = loadAllMeta();
      const existing = all[txId] ?? defaultMeta(txId);
      all[txId] = { ...existing, tags };
      saveAllMeta(all);
    },
    onSuccess: (_data, { txId }) => {
      qc.invalidateQueries({ queryKey: ["tx_metadata", txId] });
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
    },
  });
}

export function useSetTransactionNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      txId,
      note,
      category,
    }: {
      txId: string;
      note: string;
      category?: SpendingCategory;
    }) => {
      const all = loadAllMeta();
      const existing = all[txId] ?? defaultMeta(txId);
      all[txId] = { ...existing, note, ...(category ? { category } : {}) };
      saveAllMeta(all);
    },
    onSuccess: (_data, { txId }) => {
      qc.invalidateQueries({ queryKey: ["tx_metadata", txId] });
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useSetTransactionCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      txId,
      category,
    }: {
      txId: string;
      category: SpendingCategory;
    }) => {
      const all = loadAllMeta();
      const existing = all[txId] ?? defaultMeta(txId);
      all[txId] = { ...existing, category };
      saveAllMeta(all);
    },
    onSuccess: (_data, { txId }) => {
      qc.invalidateQueries({ queryKey: ["tx_metadata", txId] });
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useToggleTxHidden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ txId, hidden }: { txId: string; hidden: boolean }) => {
      const all = loadAllMeta();
      const existing = all[txId] ?? defaultMeta(txId);
      all[txId] = { ...existing, isHidden: hidden };
      saveAllMeta(all);
    },
    onSuccess: (_data, { txId }) => {
      qc.invalidateQueries({ queryKey: ["tx_metadata", txId] });
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
    },
  });
}

export function useAddTxAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ txId, url }: { txId: string; url: string }) => {
      const all = loadAllMeta();
      const existing = all[txId] ?? defaultMeta(txId);
      all[txId] = {
        ...existing,
        attachments: [...existing.attachments, url],
      };
      saveAllMeta(all);
    },
    onSuccess: (_data, { txId }) => {
      qc.invalidateQueries({ queryKey: ["tx_metadata", txId] });
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
    },
  });
}

export function useSoftDeleteTx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      txIds,
      deleted,
    }: {
      txIds: string[];
      deleted: boolean;
    }) => {
      const all = loadAllMeta();
      for (const txId of txIds) {
        const existing = all[txId] ?? defaultMeta(txId);
        all[txId] = { ...existing, isHidden: deleted };
      }
      saveAllMeta(all);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
    },
  });
}

export function useBulkAddTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      txIds,
      tags,
    }: {
      txIds: string[];
      tags: string[];
    }) => {
      const all = loadAllMeta();
      for (const txId of txIds) {
        const existing = all[txId] ?? defaultMeta(txId);
        const merged = Array.from(new Set([...existing.tags, ...tags]));
        all[txId] = { ...existing, tags: merged };
      }
      saveAllMeta(all);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tx_metadata_all"] });
    },
  });
}

// ── Filter presets ────────────────────────────────────────────────────────────

function loadPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(FILTER_PRESETS_KEY);
    return raw ? (JSON.parse(raw) as FilterPreset[]) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: FilterPreset[]) {
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
}

export function useFilterPresets() {
  return useQuery<FilterPreset[]>({
    queryKey: ["filter_presets"],
    queryFn: loadPresets,
  });
}

export function useSaveFilterPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      filters,
    }: {
      name: string;
      filters: TxFilters;
    }) => {
      const presets = loadPresets();
      const newPreset: FilterPreset = {
        id: `preset_${Date.now()}`,
        name,
        filters,
        createdAt: Date.now(),
      };
      savePresets([...presets, newPreset]);
      return newPreset;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["filter_presets"] });
    },
  });
}

export function useDeleteFilterPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const presets = loadPresets().filter((p) => p.id !== id);
      savePresets(presets);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["filter_presets"] });
    },
  });
}

// ── Bulk selection (ephemeral, localStorage for cross-tab) ────────────────────

export function useBulkSelection() {
  const qc = useQueryClient();

  const query = useQuery<string[]>({
    queryKey: [BULK_SELECTION_KEY],
    queryFn: () => {
      try {
        const raw = localStorage.getItem(BULK_SELECTION_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    },
  });

  const toggle = useMutation({
    mutationFn: async (txId: string) => {
      const current: string[] = JSON.parse(
        localStorage.getItem(BULK_SELECTION_KEY) ?? "[]",
      );
      const next = current.includes(txId)
        ? current.filter((id) => id !== txId)
        : [...current, txId];
      localStorage.setItem(BULK_SELECTION_KEY, JSON.stringify(next));
      return next;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BULK_SELECTION_KEY] }),
  });

  const selectAll = useMutation({
    mutationFn: async (txIds: string[]) => {
      localStorage.setItem(BULK_SELECTION_KEY, JSON.stringify(txIds));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BULK_SELECTION_KEY] }),
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      localStorage.setItem(BULK_SELECTION_KEY, "[]");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [BULK_SELECTION_KEY] }),
  });

  return {
    selected: query.data ?? [],
    toggle: toggle.mutate,
    selectAll: selectAll.mutate,
    clearAll: clearAll.mutate,
  };
}
