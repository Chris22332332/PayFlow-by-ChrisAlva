import type { CardControl } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Local card controls store ────────────────────────────────────────────────

const CONTROLS_KEY = "payflow_card_controls_v1";
const VIRTUAL_CARDS_KEY = "payflow_virtual_cards_v1";

export interface VirtualCard {
  id: string;
  basePmId: string;
  pan: string; // last 4 visible, rest masked
  cvv: string; // masked
  expiry: string;
  createdAt: number;
  isActive: boolean;
}

function loadAllControls(): Record<string, CardControl> {
  try {
    const raw = localStorage.getItem(CONTROLS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CardControl>) : {};
  } catch {
    return {};
  }
}

function saveAllControls(data: Record<string, CardControl>) {
  localStorage.setItem(CONTROLS_KEY, JSON.stringify(data));
}

function loadVirtualCards(): VirtualCard[] {
  try {
    const raw = localStorage.getItem(VIRTUAL_CARDS_KEY);
    return raw ? (JSON.parse(raw) as VirtualCard[]) : [];
  } catch {
    return [];
  }
}

function saveVirtualCards(cards: VirtualCard[]) {
  localStorage.setItem(VIRTUAL_CARDS_KEY, JSON.stringify(cards));
}

function generatePan(): string {
  // Generate a realistic-looking virtual card PAN (last 4 only visible)
  const last4 = String(Math.floor(1000 + Math.random() * 9000));
  return last4;
}

function generateCvv(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

function generateExpiry(): string {
  const now = new Date();
  const year = now.getFullYear() + 3;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${month}/${String(year).slice(-2)}`;
}

export function defaultControl(paymentMethodId: string): CardControl {
  return {
    paymentMethodId,
    isFrozen: false,
    onlinePaymentsEnabled: true,
    internationalEnabled: true,
    contactlessEnabled: true,
    atmWithdrawalsEnabled: true,
    dailyLimitCents: 500_000,
    isVirtual: false,
  };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useCardControls(pmId: string) {
  return useQuery<CardControl>({
    queryKey: ["card_controls", pmId],
    queryFn: () => {
      const all = loadAllControls();
      return all[pmId] ?? defaultControl(pmId);
    },
  });
}

export function useFreezeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pmId: string) => {
      const all = loadAllControls();
      all[pmId] = { ...(all[pmId] ?? defaultControl(pmId)), isFrozen: true };
      saveAllControls(all);
    },
    onSuccess: (_data, pmId) => {
      qc.invalidateQueries({ queryKey: ["card_controls", pmId] });
      qc.invalidateQueries({ queryKey: ["card_controls"] });
    },
  });
}

export function useUnfreezeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pmId: string) => {
      const all = loadAllControls();
      all[pmId] = { ...(all[pmId] ?? defaultControl(pmId)), isFrozen: false };
      saveAllControls(all);
    },
    onSuccess: (_data, pmId) => {
      qc.invalidateQueries({ queryKey: ["card_controls", pmId] });
      qc.invalidateQueries({ queryKey: ["card_controls"] });
    },
  });
}

export function useSetCardControls() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      control: Partial<CardControl> & { paymentMethodId: string },
    ) => {
      const all = loadAllControls();
      const existing =
        all[control.paymentMethodId] ?? defaultControl(control.paymentMethodId);
      all[control.paymentMethodId] = { ...existing, ...control };
      saveAllControls(all);
    },
    onSuccess: (_data, control) => {
      qc.invalidateQueries({
        queryKey: ["card_controls", control.paymentMethodId],
      });
    },
  });
}

export function useVirtualCards(basePmId: string) {
  return useQuery<VirtualCard[]>({
    queryKey: ["virtual_cards", basePmId],
    queryFn: () => {
      return loadVirtualCards().filter((c) => c.basePmId === basePmId);
    },
  });
}

export function useGenerateVirtualCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (basePmId: string): Promise<VirtualCard> => {
      const cards = loadVirtualCards();
      const newCard: VirtualCard = {
        id: `vc_${basePmId}_${Date.now()}`,
        basePmId,
        pan: generatePan(),
        cvv: generateCvv(),
        expiry: generateExpiry(),
        createdAt: Date.now(),
        isActive: true,
      };
      cards.push(newCard);
      saveVirtualCards(cards);

      // Also store controls for this virtual card
      const all = loadAllControls();
      all[newCard.id] = {
        ...defaultControl(newCard.id),
        isVirtual: true,
        atmWithdrawalsEnabled: false,
      };
      saveAllControls(all);

      return newCard;
    },
    onSuccess: (_data, basePmId) => {
      qc.invalidateQueries({ queryKey: ["virtual_cards", basePmId] });
      qc.invalidateQueries({ queryKey: ["card_controls"] });
    },
  });
}

export function useDeleteVirtualCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      basePmId,
    }: {
      cardId: string;
      basePmId: string;
    }) => {
      const cards = loadVirtualCards().filter((c) => c.id !== cardId);
      saveVirtualCards(cards);
      // Remove controls
      const all = loadAllControls();
      delete all[cardId];
      saveAllControls(all);
      return basePmId;
    },
    onSuccess: (_data, { basePmId }) => {
      qc.invalidateQueries({ queryKey: ["virtual_cards", basePmId] });
      qc.invalidateQueries({ queryKey: ["card_controls"] });
    },
  });
}

export function useRegenerateVirtualCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      basePmId,
    }: {
      cardId: string;
      basePmId: string;
    }) => {
      const cards = loadVirtualCards();
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        cards[idx] = {
          ...cards[idx],
          pan: generatePan(),
          cvv: generateCvv(),
          expiry: generateExpiry(),
        };
        saveVirtualCards(cards);
      }
      return basePmId;
    },
    onSuccess: (_data, { basePmId }) => {
      qc.invalidateQueries({ queryKey: ["virtual_cards", basePmId] });
    },
  });
}

export function useReportLostStolen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pmId: string) => {
      const all = loadAllControls();
      all[pmId] = {
        ...(all[pmId] ?? defaultControl(pmId)),
        isFrozen: true,
        reportedLostAt: Date.now(),
      };
      saveAllControls(all);
    },
    onSuccess: (_data, pmId) => {
      qc.invalidateQueries({ queryKey: ["card_controls", pmId] });
    },
  });
}
