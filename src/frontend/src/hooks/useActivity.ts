import { TxType } from "@/backend";
import type { ActivityItem, ActivityType, CurrencyCode } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "./useBackend";

const VISIBILITY_KEY = "payflow_activity_visibility_v1";
const REACTIONS_KEY = "payflow_activity_reactions_v1";

function loadVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(VISIBILITY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveVisibility(data: Record<string, boolean>) {
  localStorage.setItem(VISIBILITY_KEY, JSON.stringify(data));
}

type ReactionMap = Record<
  string,
  Array<{ emoji: string; count: number; reacted: boolean }>
>;

function loadReactions(): ReactionMap {
  try {
    const raw = localStorage.getItem(REACTIONS_KEY);
    return raw ? (JSON.parse(raw) as ReactionMap) : {};
  } catch {
    return {};
  }
}

function saveReactions(data: ReactionMap) {
  localStorage.setItem(REACTIONS_KEY, JSON.stringify(data));
}

export const DEFAULT_REACTIONS = [
  { emoji: "❤️", count: 0, reacted: false },
  { emoji: "🔥", count: 0, reacted: false },
  { emoji: "👏", count: 0, reacted: false },
  { emoji: "😂", count: 0, reacted: false },
  { emoji: "👍", count: 0, reacted: false },
];

function mapTxTypeToActivity(txType: string): ActivityType {
  switch (txType) {
    case TxType.sent:
    case TxType.received:
      return "payment";
    case TxType.request:
      return "request";
    default:
      return "payment";
  }
}

// Rich mock activity items seeded for a great first-load experience
const MOCK_ITEMS: ActivityItem[] = [
  {
    id: "mock_1",
    type: "payment",
    title: "Alex Chen sent you money",
    description: "🍕 Pizza night!",
    amountCents: 2400,
    currency: "USD",
    counterpartyName: "Alex Chen",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 3, reacted: false },
      { emoji: "🔥", count: 1, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 2, reacted: false },
      { emoji: "👍", count: 5, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 3,
  },
  {
    id: "mock_2",
    type: "payment",
    title: "You sent Sarah Kim",
    description: "🎂 Happy birthday! Hope you love it!",
    amountCents: 5000,
    currency: "USD",
    counterpartyName: "Sarah Kim",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 8, reacted: true },
      { emoji: "🔥", count: 2, reacted: false },
      { emoji: "👏", count: 1, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 3, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 47,
  },
  {
    id: "mock_3",
    type: "payment",
    title: "Marcus Johnson sent you money",
    description: "Rent split — March",
    amountCents: 75000,
    currency: "USD",
    counterpartyName: "Marcus Johnson",
    isPublic: false,
    reactions: [
      { emoji: "❤️", count: 0, reacted: false },
      { emoji: "🔥", count: 0, reacted: false },
      { emoji: "👏", count: 1, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 2, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "mock_4",
    type: "payment",
    title: "You sent Jordan Rivera",
    description: "☕ Coffee run for everyone",
    amountCents: 1875,
    currency: "USD",
    counterpartyName: "Jordan Rivera",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 1, reacted: false },
      { emoji: "🔥", count: 0, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 1, reacted: false },
      { emoji: "👍", count: 4, reacted: true },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: "mock_5",
    type: "payment",
    title: "Taylor Brooks sent you money",
    description: "🎬 Movie tickets x3",
    amountCents: 4200,
    currency: "USD",
    counterpartyName: "Taylor Brooks",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 2, reacted: false },
      { emoji: "🔥", count: 3, reacted: true },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 1, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 14,
  },
  {
    id: "mock_6",
    type: "savings_deposit",
    title: "Saved to Emergency Fund",
    description: "🏦 Monthly auto-deposit",
    amountCents: 20000,
    currency: "USD",
    isPublic: false,
    reactions: [],
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "mock_7",
    type: "payment",
    title: "Chris Nguyen sent you money",
    description: "🍺 Friday drinks",
    amountCents: 3200,
    currency: "USD",
    counterpartyName: "Chris Nguyen",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 1, reacted: false },
      { emoji: "🔥", count: 5, reacted: false },
      { emoji: "👏", count: 2, reacted: false },
      { emoji: "😂", count: 4, reacted: true },
      { emoji: "👍", count: 0, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 30,
  },
  {
    id: "mock_8",
    type: "payment",
    title: "You sent Morgan Lee",
    description: "🏠 Utilities — April",
    amountCents: 12500,
    currency: "USD",
    counterpartyName: "Morgan Lee",
    isPublic: false,
    reactions: [
      { emoji: "❤️", count: 0, reacted: false },
      { emoji: "🔥", count: 0, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 1, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: "mock_9",
    type: "referral",
    title: "Referral bonus earned! 🎉",
    description: "Sam invited you — you got $5.00 credit",
    amountCents: 500,
    currency: "USD",
    isPublic: false,
    reactions: [],
    timestamp: Date.now() - 1000 * 60 * 60 * 52,
  },
  {
    id: "mock_10",
    type: "payment",
    title: "Riley Martinez sent you money",
    description: "🎮 Game night contribution",
    amountCents: 1500,
    currency: "USD",
    counterpartyName: "Riley Martinez",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 0, reacted: false },
      { emoji: "🔥", count: 2, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 3, reacted: false },
      { emoji: "👍", count: 1, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    id: "mock_11",
    type: "payment",
    title: "You sent Alex Chen",
    description: "🚕 Uber split — airport",
    amountCents: 3450,
    currency: "USD",
    counterpartyName: "Alex Chen",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 1, reacted: false },
      { emoji: "🔥", count: 0, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 2, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
  },
  {
    id: "mock_12",
    type: "payment",
    title: "Dana Williams sent you money",
    description: "🎁 For the gift fund",
    amountCents: 2000,
    currency: "USD",
    counterpartyName: "Dana Williams",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 6, reacted: false },
      { emoji: "🔥", count: 1, reacted: false },
      { emoji: "👏", count: 3, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 0, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
  },
  {
    id: "mock_13",
    type: "subscription",
    title: "PayFlow Pro subscription",
    description: "✅ Monthly renewal — Pro plan",
    amountCents: 999,
    currency: "USD",
    isPublic: false,
    reactions: [],
    timestamp: Date.now() - 1000 * 60 * 60 * 144,
  },
  {
    id: "mock_14",
    type: "payment",
    title: "You sent Casey Hall",
    description: "🍔 Lunch — the usual spot",
    amountCents: 2250,
    currency: "USD",
    counterpartyName: "Casey Hall",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 0, reacted: false },
      { emoji: "🔥", count: 1, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 0, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 168,
  },
  {
    id: "mock_15",
    type: "payment",
    title: "Jordan Rivera sent you money",
    description: "🏋️ Gym membership split",
    amountCents: 4000,
    currency: "USD",
    counterpartyName: "Jordan Rivera",
    isPublic: false,
    reactions: [
      { emoji: "❤️", count: 0, reacted: false },
      { emoji: "🔥", count: 0, reacted: false },
      { emoji: "👏", count: 2, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 1, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 192,
  },
  {
    id: "mock_16",
    type: "payment",
    title: "Taylor Brooks sent you money",
    description: "🍷 Wine & cheese night",
    amountCents: 6000,
    currency: "USD",
    counterpartyName: "Taylor Brooks",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 4, reacted: false },
      { emoji: "🔥", count: 2, reacted: false },
      { emoji: "👏", count: 1, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 3, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 216,
  },
  {
    id: "mock_17",
    type: "payment",
    title: "You sent Riley Martinez",
    description: "🎵 Concert tickets",
    amountCents: 18500,
    currency: "USD",
    counterpartyName: "Riley Martinez",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 2, reacted: false },
      { emoji: "🔥", count: 7, reacted: true },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 0, reacted: false },
      { emoji: "👍", count: 0, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 240,
  },
  {
    id: "mock_18",
    type: "savings_deposit",
    title: "Saved to Travel Fund",
    description: "✈️ Japan trip — almost there!",
    amountCents: 30000,
    currency: "USD",
    isPublic: false,
    reactions: [],
    timestamp: Date.now() - 1000 * 60 * 60 * 264,
  },
  {
    id: "mock_19",
    type: "payment",
    title: "Chris Nguyen sent you money",
    description: "🐶 Dog sitting — thanks again!",
    amountCents: 8000,
    currency: "USD",
    counterpartyName: "Chris Nguyen",
    isPublic: true,
    reactions: [
      { emoji: "❤️", count: 5, reacted: false },
      { emoji: "🔥", count: 0, reacted: false },
      { emoji: "👏", count: 0, reacted: false },
      { emoji: "😂", count: 1, reacted: false },
      { emoji: "👍", count: 2, reacted: false },
    ],
    timestamp: Date.now() - 1000 * 60 * 60 * 288,
  },
  {
    id: "mock_20",
    type: "referral",
    title: "You referred a friend! 🎉",
    description:
      "Dana joined PayFlow using your link — $5 bonus on first payment",
    amountCents: 500,
    currency: "USD",
    isPublic: false,
    reactions: [],
    timestamp: Date.now() - 1000 * 60 * 60 * 312,
  },
];

export function useActivityFeed() {
  const { actor, isFetching } = useBackend();

  return useQuery<ActivityItem[]>({
    queryKey: ["activity"],
    queryFn: async () => {
      const visibility = loadVisibility();
      const reactions = loadReactions();

      // Apply stored visibility/reactions to mock items
      const baseItems = MOCK_ITEMS.map((item) => ({
        ...item,
        isPublic:
          visibility[item.id] !== undefined
            ? visibility[item.id]
            : item.isPublic,
        reactions: reactions[item.id] ?? item.reactions,
      }));

      if (!actor || isFetching) return baseItems;

      try {
        const txs = await actor.getTransactionHistory(null);
        const liveItems: ActivityItem[] = txs.map((tx) => {
          const id = String(tx.id);
          const amountCents = Number(tx.amount);
          const isPublic =
            visibility[id] !== undefined
              ? visibility[id]
              : tx.txType === TxType.received;

          let title = "";
          let description = "";
          switch (tx.txType) {
            case TxType.sent:
              title = `You sent ${tx.counterparty?.toString() ?? "someone"}`;
              description = tx.note || "Payment sent";
              break;
            case TxType.received:
              title = `${tx.counterparty?.toString() ?? "Someone"} sent you money`;
              description = tx.note || "Payment received";
              break;
            case TxType.deposit:
              title = "Added funds";
              description = "Funds added to wallet";
              break;
            case TxType.withdrawal:
              title = "Withdrawal";
              description = "Funds withdrawn";
              break;
            case TxType.request:
              title = "Money request";
              description = tx.note || "Money requested";
              break;
            default:
              title = "Transaction";
              description = tx.note || "";
          }

          return {
            id,
            type: mapTxTypeToActivity(tx.txType),
            title,
            description,
            amountCents,
            currency: tx.currency as unknown as CurrencyCode,
            counterpartyName: tx.counterparty?.toString(),
            isPublic,
            reactions:
              reactions[id] ?? DEFAULT_REACTIONS.map((r) => ({ ...r })),
            timestamp: Number(tx.timestamp / 1_000_000n),
            linkedTxId: id,
          };
        });

        // Merge: live items first, then mock for padding
        const liveIds = new Set(liveItems.map((i) => i.id));
        const merged = [
          ...liveItems,
          ...baseItems.filter((i) => !liveIds.has(i.id)),
        ];
        return merged;
      } catch {
        return baseItems;
      }
    },
    enabled: true,
  });
}

export function useTogglePaymentVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityId,
      isPublic,
    }: {
      activityId: string;
      isPublic: boolean;
    }) => {
      const vis = loadVisibility();
      vis[activityId] = isPublic;
      saveVisibility(vis);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
  });
}

export function useAddReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityId,
      emoji,
    }: {
      activityId: string;
      emoji: string;
    }) => {
      const allReactions = loadReactions();
      const existing =
        allReactions[activityId] ??
        MOCK_ITEMS.find((i) => i.id === activityId)?.reactions ??
        DEFAULT_REACTIONS.map((r) => ({ ...r }));
      const updated = existing.map((r) =>
        r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r,
      );
      allReactions[activityId] = updated;
      saveReactions(allReactions);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
  });
}

export function useRemoveReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityId,
      emoji,
    }: {
      activityId: string;
      emoji: string;
    }) => {
      const allReactions = loadReactions();
      const existing =
        allReactions[activityId] ??
        MOCK_ITEMS.find((i) => i.id === activityId)?.reactions ??
        DEFAULT_REACTIONS.map((r) => ({ ...r }));
      const updated = existing.map((r) =>
        r.emoji === emoji
          ? { ...r, count: Math.max(0, r.count - 1), reacted: false }
          : r,
      );
      allReactions[activityId] = updated;
      saveReactions(allReactions);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity"] }),
  });
}
