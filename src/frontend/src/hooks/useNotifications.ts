import type { AppNotification, NotifType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Local notification store ─────────────────────────────────────────────────

const NOTIFS_KEY = "payflow_notifications_v2";

function genId() {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ts(offsetMs: number) {
  return Date.now() - offsetMs;
}

const MIN = 60 * 1000;
const HR = 60 * MIN;
const DAY = 24 * HR;

const SEED_NOTIFICATIONS: Omit<AppNotification, "id">[] = [
  // ── Today ────────────────────────────────────────────────────────────────
  {
    type: "payment_received",
    title: "Payment received — $240.00",
    body: "@alexchen sent you $240.00 for 'Rent split March'.",
    read: false,
    createdAt: ts(2 * MIN),
    actionUrl: "/transfers",
    metadata: { amount: 24000, currency: "USD" },
  },
  {
    type: "security_alert",
    title: "New sign-in from Chrome on Windows",
    body: "A new device signed in to your account from New York, US. If this wasn't you, secure your account now.",
    read: false,
    createdAt: ts(18 * MIN),
    actionUrl: "/settings",
  },
  {
    type: "referral_reward",
    title: "Referral bonus — $5.00 credited!",
    body: "Your friend @marisol joined via your invite and made their first payment. Your $5 bonus is in your wallet.",
    read: false,
    createdAt: ts(45 * MIN),
    actionUrl: "/dashboard",
    metadata: { amount: 500 },
  },
  {
    type: "budget_alert",
    title: "Budget alert: Dining & Food",
    body: "You've reached 90% of your monthly dining budget ($180 of $200). Consider reducing spend.",
    read: false,
    createdAt: ts(2 * HR),
    actionUrl: "/analytics",
    metadata: { pct: 90 },
  },
  {
    type: "payment_sent",
    title: "Payment sent — $35.50",
    body: "You sent $35.50 to @david_m for 'Movie tickets'.",
    read: true,
    createdAt: ts(3 * HR),
    actionUrl: "/transfers",
    metadata: { amount: 3550 },
  },
  {
    type: "savings_milestone",
    title: "Savings milestone reached! 🏆",
    body: "Your 'Vacation Fund' goal hit 50% — $1,250 saved of $2,500. Keep it up!",
    read: false,
    createdAt: ts(5 * HR),
    actionUrl: "/dashboard",
    metadata: { goalPct: 50 },
  },
  // ── Yesterday ────────────────────────────────────────────────────────────
  {
    type: "money_request",
    title: "Money request from @sarah_k",
    body: "@sarah_k is requesting $62.00 for 'Grocery run — split 4 ways'.",
    read: true,
    createdAt: ts(DAY + 1 * HR),
    actionUrl: "/transfers",
    metadata: { amount: 6200 },
  },
  {
    type: "subscription_update",
    title: "PayFlow Pro renewed",
    body: "Your PayFlow Pro subscription ($9.99/mo) has been renewed. Your next billing date is June 1.",
    read: true,
    createdAt: ts(DAY + 4 * HR),
    actionUrl: "/subscriptions",
  },
  {
    type: "payment_received",
    title: "Payment received — $100.00",
    body: "@priya_r sent you $100.00 for 'Concert tickets'.",
    read: true,
    createdAt: ts(DAY + 6 * HR),
    actionUrl: "/transfers",
    metadata: { amount: 10000 },
  },
  {
    type: "security_alert",
    title: "Password changed successfully",
    body: "Your PayFlow account password was updated. Contact support if you did not make this change.",
    read: true,
    createdAt: ts(DAY + 8 * HR),
    actionUrl: "/settings",
  },
  // ── Last week ────────────────────────────────────────────────────────────
  {
    type: "system",
    title: "PayFlow maintenance complete",
    body: "Scheduled maintenance has ended. All services are fully operational. Thanks for your patience.",
    read: true,
    createdAt: ts(3 * DAY + 2 * HR),
  },
  {
    type: "budget_alert",
    title: "Monthly spending report ready",
    body: "Your April spending report is available. You spent $1,840 across 7 categories. View your breakdown.",
    read: true,
    createdAt: ts(4 * DAY),
    actionUrl: "/analytics",
  },
  {
    type: "payment_sent",
    title: "Payment sent — $550.00",
    body: "You sent $550.00 to @landlord_jane for 'April rent'. Funds delivered.",
    read: true,
    createdAt: ts(5 * DAY + 3 * HR),
    actionUrl: "/transfers",
    metadata: { amount: 55000 },
  },
  {
    type: "referral_reward",
    title: "Referral bonus — $5.00 credited!",
    body: "@kevin_t joined via your link and completed their first transfer. $5 added to your wallet.",
    read: true,
    createdAt: ts(6 * DAY),
    actionUrl: "/dashboard",
    metadata: { amount: 500 },
  },
  // ── Older ────────────────────────────────────────────────────────────────
  {
    type: "system",
    title: "Welcome to PayFlow!",
    body: "Your account is all set. Add a payment method and start sending or requesting money in seconds.",
    read: true,
    createdAt: ts(14 * DAY),
    actionUrl: "/payment-methods",
  },
  {
    type: "subscription_update",
    title: "Free trial ending in 3 days",
    body: "Your PayFlow Pro trial ends soon. Upgrade now to keep premium features like instant transfers and analytics.",
    read: true,
    createdAt: ts(10 * DAY + 5 * HR),
    actionUrl: "/subscriptions",
  },
  {
    type: "savings_milestone",
    title: "First savings goal created!",
    body: "You set up your 'Emergency Fund' goal for $5,000. Auto-deposits of $200/mo are now active.",
    read: true,
    createdAt: ts(12 * DAY),
    actionUrl: "/dashboard",
  },
];

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch {
    // ignore
  }
  const seed: AppNotification[] = SEED_NOTIFICATIONS.map((n) => ({
    ...n,
    id: genId(),
  }));
  saveNotifications(seed);
  return seed;
}

function saveNotifications(notifs: AppNotification[]) {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
}

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: () => loadNotifications(),
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { data = [] } = useNotifications();
  return data.filter((n) => !n.read).length;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const notifs = loadNotifications();
      const updated = notifs.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      saveNotifications(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const notifs = loadNotifications();
      const updated = notifs.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      saveNotifications([]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useAddNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      notif: Omit<AppNotification, "id" | "createdAt" | "read">,
    ) => {
      const notifs = loadNotifications();
      const newNotif: AppNotification = {
        ...notif,
        id: genId(),
        createdAt: Date.now(),
        read: false,
      };
      saveNotifications([newNotif, ...notifs]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ── Filter helpers ────────────────────────────────────────────────────────────

export type NotifFilterTab =
  | "all"
  | "payments"
  | "security"
  | "alerts"
  | "promotions"
  | "system";

const FILTER_MAP: Record<NotifFilterTab, NotifType[]> = {
  all: [],
  payments: [
    "payment_received",
    "payment_sent",
    "money_request",
    "request_approved",
    "request_declined",
  ],
  security: ["security_alert"],
  alerts: ["budget_alert", "savings_milestone"],
  promotions: ["referral_reward", "subscription_update"],
  system: ["system"],
};

export function filterNotifications(
  notifs: AppNotification[],
  tab: NotifFilterTab,
): AppNotification[] {
  if (tab === "all") return notifs;
  return notifs.filter((n) => FILTER_MAP[tab].includes(n.type));
}

// ── Date grouping ─────────────────────────────────────────────────────────────

export type DateGroup = "Today" | "Yesterday" | "Last Week" | "Older";

export function getDateGroup(createdAt: number): DateGroup {
  const now = Date.now();
  const diff = now - createdAt;
  if (diff < 24 * 60 * 60 * 1000) return "Today";
  if (diff < 48 * 60 * 60 * 1000) return "Yesterday";
  if (diff < 7 * 24 * 60 * 60 * 1000) return "Last Week";
  return "Older";
}

export function groupNotificationsByDate(
  notifs: AppNotification[],
): Array<{ group: DateGroup; items: AppNotification[] }> {
  const order: DateGroup[] = ["Today", "Yesterday", "Last Week", "Older"];
  const map = new Map<DateGroup, AppNotification[]>();
  for (const g of order) map.set(g, []);
  for (const n of notifs) {
    map.get(getDateGroup(n.createdAt))!.push(n);
  }
  return order
    .filter((g) => map.get(g)!.length > 0)
    .map((g) => ({ group: g, items: map.get(g)! }));
}

// ── Relative time ─────────────────────────────────────────────────────────────

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
