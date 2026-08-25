import type { CurrencyCode, SavingsCategory, SavingsGoal } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Local savings store ──────────────────────────────────────────────────────

const SAVINGS_KEY = "payflow_savings_v1";
const ROUNDUP_KEY = "payflow_roundup_v1";
const DEPOSIT_HISTORY_KEY = "payflow_deposit_history_v1";

export interface DepositHistoryEntry {
  id: string;
  goalId: string;
  amountCents: number;
  type: "deposit" | "withdraw" | "roundup" | "auto";
  timestamp: number;
  note?: string;
}

export interface RoundUpSettings {
  enabled: boolean;
  totalRoundedUpCents: number;
  transactions: Array<{
    id: string;
    originalCents: number;
    roundedCents: number;
    savedCents: number;
    timestamp: number;
  }>;
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(SAVINGS_KEY);
    if (raw) return JSON.parse(raw) as SavingsGoal[];
  } catch {
    // ignore
  }
  const seed: SavingsGoal[] = [
    {
      id: "goal_emergency_001",
      name: "Emergency Fund",
      category: "emergency" as SavingsCategory,
      targetCents: 1_000_000,
      savedCents: 450_000,
      currency: "USD" as CurrencyCode,
      isLocked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
      emoji: "🛡️",
    },
    {
      id: "goal_europe_002",
      name: "Europe Trip 2025",
      category: "travel" as SavingsCategory,
      targetCents: 500_000,
      savedCents: 125_000,
      currency: "USD" as CurrencyCode,
      deadline: Date.now() + 1000 * 60 * 60 * 24 * 180,
      autoDepositCents: 10_000,
      autoDepositInterval: "monthly",
      isLocked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      emoji: "✈️",
    },
    {
      id: "goal_macbook_003",
      name: "New MacBook Pro",
      category: "gadget" as SavingsCategory,
      targetCents: 299_900,
      savedCents: 299_900,
      currency: "USD" as CurrencyCode,
      isLocked: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
      emoji: "💻",
    },
    {
      id: "goal_house_004",
      name: "House Down Payment",
      category: "home" as SavingsCategory,
      targetCents: 5_000_000,
      savedCents: 875_000,
      currency: "USD" as CurrencyCode,
      deadline: Date.now() + 1000 * 60 * 60 * 24 * 730,
      autoDepositCents: 50_000,
      autoDepositInterval: "monthly",
      isLocked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
      emoji: "🏠",
    },
    {
      id: "goal_wedding_005",
      name: "Dream Wedding",
      category: "wedding" as SavingsCategory,
      targetCents: 2_500_000,
      savedCents: 600_000,
      currency: "USD" as CurrencyCode,
      deadline: Date.now() + 1000 * 60 * 60 * 24 * 365,
      isLocked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
      emoji: "💍",
    },
  ];
  saveGoals(seed);
  // Seed deposit history
  const histSeed: DepositHistoryEntry[] = [
    {
      id: genId(),
      goalId: "goal_emergency_001",
      amountCents: 50000,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
      note: "Weekly contribution",
    },
    {
      id: genId(),
      goalId: "goal_emergency_001",
      amountCents: 100000,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30,
      note: "Monthly boost",
    },
    {
      id: genId(),
      goalId: "goal_emergency_001",
      amountCents: 300000,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 90,
      note: "Initial deposit",
    },
    {
      id: genId(),
      goalId: "goal_europe_002",
      amountCents: 10000,
      type: "auto",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      note: "Auto-deposit",
    },
    {
      id: genId(),
      goalId: "goal_europe_002",
      amountCents: 10000,
      type: "auto",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 33,
      note: "Auto-deposit",
    },
    {
      id: genId(),
      goalId: "goal_europe_002",
      amountCents: 105000,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 60,
      note: "Initial deposit",
    },
    {
      id: genId(),
      goalId: "goal_macbook_003",
      amountCents: 299900,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 100,
      note: "Saved up!",
    },
    {
      id: genId(),
      goalId: "goal_house_004",
      amountCents: 50000,
      type: "auto",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
      note: "Auto-deposit",
    },
    {
      id: genId(),
      goalId: "goal_house_004",
      amountCents: 825000,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 60,
      note: "Initial deposit",
    },
    {
      id: genId(),
      goalId: "goal_wedding_005",
      amountCents: 600000,
      type: "deposit",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30,
      note: "Wedding fund started",
    },
  ];
  localStorage.setItem(DEPOSIT_HISTORY_KEY, JSON.stringify(histSeed));
  return seed;
}

function saveGoals(goals: SavingsGoal[]) {
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(goals));
}

function loadDepositHistory(): DepositHistoryEntry[] {
  try {
    const raw = localStorage.getItem(DEPOSIT_HISTORY_KEY);
    if (raw) return JSON.parse(raw) as DepositHistoryEntry[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveDepositHistory(entries: DepositHistoryEntry[]) {
  localStorage.setItem(DEPOSIT_HISTORY_KEY, JSON.stringify(entries));
}

function loadRoundUp(): RoundUpSettings {
  try {
    const raw = localStorage.getItem(ROUNDUP_KEY);
    if (raw) return JSON.parse(raw) as RoundUpSettings;
  } catch {
    /* ignore */
  }
  return {
    enabled: false,
    totalRoundedUpCents: 2340,
    transactions: [
      {
        id: genId(),
        originalCents: 1823,
        roundedCents: 2000,
        savedCents: 177,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
      },
      {
        id: genId(),
        originalCents: 3412,
        roundedCents: 3500,
        savedCents: 88,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      },
      {
        id: genId(),
        originalCents: 847,
        roundedCents: 1000,
        savedCents: 153,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
      },
      {
        id: genId(),
        originalCents: 2275,
        roundedCents: 2500,
        savedCents: 225,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
      },
    ],
  };
}

function saveRoundUp(settings: RoundUpSettings) {
  localStorage.setItem(ROUNDUP_KEY, JSON.stringify(settings));
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSavingsGoals() {
  return useQuery<SavingsGoal[]>({
    queryKey: ["savings"],
    queryFn: () => loadGoals(),
  });
}

export function useDepositHistory(goalId?: string) {
  return useQuery<DepositHistoryEntry[]>({
    queryKey: ["savings_history", goalId],
    queryFn: () => {
      const all = loadDepositHistory();
      return goalId ? all.filter((e) => e.goalId === goalId) : all;
    },
  });
}

export function useRoundUpSettings() {
  return useQuery<RoundUpSettings>({
    queryKey: ["roundup"],
    queryFn: () => loadRoundUp(),
  });
}

export function useToggleRoundUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const settings = loadRoundUp();
      const updated = { ...settings, enabled };
      saveRoundUp(updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roundup"] }),
  });
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Omit<SavingsGoal, "id" | "savedCents" | "createdAt">,
    ) => {
      const goals = loadGoals();
      const newGoal: SavingsGoal = {
        ...input,
        id: `goal_${genId()}`,
        savedCents: 0,
        createdAt: Date.now(),
      };
      saveGoals([...goals, newGoal]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings"] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      updates,
    }: { goalId: string; updates: Partial<SavingsGoal> }) => {
      const goals = loadGoals();
      const updated = goals.map((g) =>
        g.id === goalId ? { ...g, ...updates } : g,
      );
      saveGoals(updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings"] }),
  });
}

export function useDepositToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      amountCents,
      note,
    }: { goalId: string; amountCents: number; note?: string }) => {
      const goals = loadGoals();
      const updated = goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              savedCents: Math.min(g.savedCents + amountCents, g.targetCents),
            }
          : g,
      );
      saveGoals(updated);
      const history = loadDepositHistory();
      const entry: DepositHistoryEntry = {
        id: genId(),
        goalId,
        amountCents,
        type: "deposit",
        timestamp: Date.now(),
        note,
      };
      saveDepositHistory([entry, ...history]);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["savings"] });
      qc.invalidateQueries({ queryKey: ["savings_history", vars.goalId] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useWithdrawFromGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      amountCents,
    }: { goalId: string; amountCents: number }) => {
      const goals = loadGoals();
      const updated = goals.map((g) =>
        g.id === goalId && !g.isLocked
          ? { ...g, savedCents: Math.max(g.savedCents - amountCents, 0) }
          : g,
      );
      saveGoals(updated);
      const history = loadDepositHistory();
      const entry: DepositHistoryEntry = {
        id: genId(),
        goalId,
        amountCents,
        type: "withdraw",
        timestamp: Date.now(),
      };
      saveDepositHistory([entry, ...history]);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["savings"] });
      qc.invalidateQueries({ queryKey: ["savings_history", vars.goalId] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useSetGoalAutoDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      amountCents,
      interval,
    }: {
      goalId: string;
      amountCents: number;
      interval: "weekly" | "monthly";
    }) => {
      const goals = loadGoals();
      const updated = goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              autoDepositCents: amountCents,
              autoDepositInterval: interval,
            }
          : g,
      );
      saveGoals(updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings"] }),
  });
}

export function useLockGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      locked,
    }: { goalId: string; locked: boolean }) => {
      const goals = loadGoals();
      const updated = goals.map((g) =>
        g.id === goalId ? { ...g, isLocked: locked } : g,
      );
      saveGoals(updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings"] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const goals = loadGoals();
      saveGoals(goals.filter((g) => g.id !== goalId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings"] });
      qc.invalidateQueries({ queryKey: ["savings_history"] });
    },
  });
}
