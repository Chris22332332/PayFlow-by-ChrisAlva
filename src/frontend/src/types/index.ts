export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
  createdAt: number;
  // Extended fields
  userId?: string;
  bio?: string;
  photoUrl?: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  label: string;
  last4: string;
  isDefault: boolean;
  brand?: string;
}

export interface Transaction {
  id: string;
  type: "sent" | "received" | "added" | "withdrawn" | "request";
  /** Total amount in cents (base_amount + tax_amount) */
  amount: number;
  /** Base amount before tax, in cents */
  base_amount: number;
  currency: CurrencyCode;
  /** Tax rate in basis points (2000 = 20%) */
  tax_rate: number;
  /** Tax amount in cents */
  tax_amount: number;
  /** Original currency for cross-currency transactions */
  original_currency: CurrencyCode | null;
  /** Original amount in cents before FX conversion */
  original_amount: number | null;
  description: string;
  counterparty?: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  referenceId?: string;
  paymentMethodLast4?: string;
  requestId?: string;
}

export interface MoneyRequest {
  id: string;
  from: string;
  to: string;
  amount: number;
  note?: string;
  status: "pending" | "approved" | "declined";
  createdAt: number;
}

export interface WalletState {
  balance: number;
  profile: UserProfile | null;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setBalance: (balance: number) => void;
  setTransactions: (txns: Transaction[]) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setIsLoading: (loading: boolean) => void;
}

// ── Subscription types ──────────────────────────────────────────────────────

export type SubscriptionTier =
  | "free"
  | "plus"
  | "pro"
  | "business"
  | "enterprise";

export type BillingInterval = "monthly" | "annual";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "cancelled"
  | "expired";

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodEnd: number; // ms timestamp
  stripeSubscriptionId?: string;
}

// ── Phone verification types ────────────────────────────────────────────────

export type PhoneVerificationState = "unverified" | "pending" | "verified";

export interface PhoneVerificationStatus {
  phone?: string;
  state: PhoneVerificationState;
}

// ── AutoPay config ──────────────────────────────────────────────────────────

export interface AutoPayConfig {
  autoChargeOnSend: boolean;
  autoDepositOnReceive: boolean;
  defaultPayoutMethodId?: string;
}

// ── Referral types ──────────────────────────────────────────────────────────

export interface ReferralRewardRecord {
  inviteCode: string;
  amount: number; // cents
  paidAt: number; // ms timestamp
}

export interface ReferralRewardSummary {
  totalEarned: number; // cents
  pendingRewards: number; // cents
  paidRewards: ReferralRewardRecord[];
}

// ── Analytics / Spending types ──────────────────────────────────────────────

export type SpendingCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "health"
  | "utilities"
  | "travel"
  | "transfers"
  | "subscriptions"
  | "other";

export interface CategoryBreakdown {
  category: SpendingCategory;
  totalCents: number;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  month: number; // 1-12
  year: number;
  totalSpentCents: number;
  totalReceivedCents: number;
  netCents: number;
  categories: CategoryBreakdown[];
  dailySpend: Array<{ day: number; amountCents: number }>;
  topCounterparties: Array<{ name: string; totalCents: number; count: number }>;
}

export interface BudgetSetting {
  category: SpendingCategory;
  limitCents: number;
  spentCents: number;
  alertAt: number; // 0-100 percentage
}

// ── Notifications ───────────────────────────────────────────────────────────

export type NotifType =
  | "payment_received"
  | "payment_sent"
  | "money_request"
  | "request_approved"
  | "request_declined"
  | "referral_reward"
  | "security_alert"
  | "subscription_update"
  | "budget_alert"
  | "savings_milestone"
  | "system";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  actionUrl?: string;
  metadata?: Record<string, string | number | boolean>;
}

// ── Savings types ───────────────────────────────────────────────────────────

export type SavingsCategory =
  | "emergency"
  | "travel"
  | "home"
  | "vehicle"
  | "education"
  | "retirement"
  | "investment"
  | "wedding"
  | "gadget"
  | "other";

export interface SavingsGoal {
  id: string;
  name: string;
  category: SavingsCategory;
  targetCents: number;
  savedCents: number;
  currency: CurrencyCode;
  deadline?: number; // ms timestamp
  autoDepositCents?: number; // recurring deposit amount
  autoDepositInterval?: "weekly" | "monthly";
  isLocked: boolean;
  createdAt: number;
  emoji?: string;
}

// ── Card controls ────────────────────────────────────────────────────────────

export interface CardControl {
  paymentMethodId: string;
  isFrozen: boolean;
  onlinePaymentsEnabled: boolean;
  internationalEnabled: boolean;
  contactlessEnabled: boolean;
  atmWithdrawalsEnabled: boolean;
  dailyLimitCents: number;
  isVirtual: boolean;
  reportedLostAt?: number;
}

// ── Activity feed ────────────────────────────────────────────────────────────

export type ActivityType =
  | "payment"
  | "request"
  | "savings_deposit"
  | "savings_withdraw"
  | "referral"
  | "subscription"
  | "profile_update"
  | "security";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  amountCents?: number;
  currency?: CurrencyCode;
  counterpartyName?: string;
  counterpartyAvatar?: string;
  isPublic: boolean;
  reactions: Array<{ emoji: string; count: number; reacted: boolean }>;
  timestamp: number;
  linkedTxId?: string;
}

// ── Trusted contacts ─────────────────────────────────────────────────────────

export interface TrustedContact {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  addedAt: number;
  lastTransactionAt?: number;
  notes?: string;
}

// ── Transaction metadata ─────────────────────────────────────────────────────

export interface TxMetadata {
  txId: string;
  tags: string[];
  note: string;
  category?: SpendingCategory;
  isHidden: boolean;
  attachments: string[]; // URLs
}
