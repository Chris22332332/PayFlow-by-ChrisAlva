import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CurrencyAmount {
    currency: Currency;
    amount: Amount;
}
export interface ReferralRewardRecord {
    inviteCode: string;
    amount: bigint;
    paidAt: bigint;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PaymentMethod {
    id: bigint;
    token: string;
    last4: string;
    stripe_payment_method_id?: string;
    verification_status: VerificationStatus;
    displayLabel: string;
    isDefault: boolean;
    pmType: PaymentMethodType;
    expiry: string;
    account_holder_name?: string;
}
export type TxId = bigint;
export interface StripePaymentResult {
    amount_charged: Amount;
    error_message?: string;
    currency: Currency;
    charge_id?: string;
    success: boolean;
}
export interface AnalyticsSummary {
    totalSpent: bigint;
    avgTransaction: bigint;
    byCategory: Array<CategoryBreakdown>;
    biggestPurchase: bigint;
    monthOverMonth: bigint;
}
export interface Transaction {
    id: TxId;
    status: TxStatus;
    requestId?: TxId;
    tax_amount: Amount;
    original_amount?: Amount;
    note: string;
    counterparty?: Principal;
    currency: Currency;
    original_currency?: Currency;
    timestamp: Timestamp;
    tax_rate: bigint;
    txType: TxType;
    base_amount: Amount;
    amount: Amount;
}
export interface Subscription {
    status: SubscriptionStatus;
    interval: BillingInterval;
    stripeSubscriptionId?: string;
    tier: SubscriptionTier;
    currentPeriodEnd: bigint;
}
export interface TxMetadata {
    note?: string;
    tags: Array<string>;
    txId: TxId;
}
export interface StripeSetupIntent {
    payment_method_id?: string;
    client_secret: string;
}
export interface CategoryBreakdown {
    total: bigint;
    count: bigint;
    category: SpendingCategory;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface MoneyRequest {
    id: TxId;
    status: TxStatus;
    requester: Principal;
    note: string;
    currency: Currency;
    timestamp: Timestamp;
    payer: Principal;
    amount: Amount;
}
export interface FxRate {
    rate: number;
    to_currency: Currency;
    from_currency: Currency;
    fetched_at: Timestamp;
}
export interface ActivityItem {
    id: bigint;
    note?: string;
    actionType: ActivityType;
    actorUsername: string;
    currency?: Currency;
    timestamp: Timestamp;
    actorPrincipal: Principal;
    isPublic: boolean;
    amount?: bigint;
    reactions: Array<ReactionEntry>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface SavingsGoal {
    id: bigint;
    isCompleted: boolean;
    name: string;
    createdAt: Timestamp;
    targetAmount: bigint;
    targetDate?: Timestamp;
    category: SavingsCategory;
    isLocked: boolean;
    currentAmount: bigint;
    autoDepositInterval?: string;
    autoDepositAmount?: bigint;
}
export interface TrustedContact {
    id: bigint;
    accessLevel: string;
    relationship: string;
    name: string;
    email?: string;
    addedAt: Timestamp;
    phone?: string;
}
export interface AutoPayConfig {
    defaultPayoutMethodId?: string;
    autoDepositOnReceive: boolean;
    autoChargeOnSend: boolean;
}
export interface CardControl {
    isFrozen: boolean;
    internationalEnabled: boolean;
    paymentMethodId: string;
    hasVirtualCard: boolean;
    onlineEnabled: boolean;
    virtualCardLast4?: string;
    virtualCardExpiry?: string;
    maxTransactionLimit?: bigint;
}
export interface DeviceSession {
    os: string;
    session_id: string;
    device_name: string;
    last_active: Timestamp;
    is_current: boolean;
    ip_address: string;
}
export interface InviteStats {
    redeemerUsernames: Array<string>;
    redemptionCount: bigint;
    code: string;
}
export interface ReferralRewardSummary {
    pendingRewards: bigint;
    totalEarned: bigint;
    paidRewards: Array<ReferralRewardRecord>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Amount = bigint;
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface ReactionEntry {
    by: Array<Principal>;
    emoji: string;
}
export interface Notification {
    id: bigint;
    title: string;
    notifType: NotifType;
    body: string;
    isRead: boolean;
    timestamp: Timestamp;
    relatedTxId?: TxId;
}
export interface UserSettings {
    primary_currency: Currency;
    data_sharing: boolean;
    per_tx_limit: Amount;
    decimal_places: bigint;
    notification_promotions: boolean;
    notification_p2p_requests: boolean;
    number_format: NumberFormat;
    monthly_limit: Amount;
    notification_email_receipts: boolean;
    tx_history_visibility: TxHistoryVisibility;
    notification_payment_alerts: boolean;
    daily_limit: Amount;
}
export interface UserProfile {
    bio?: string;
    username: string;
    displayName: string;
    userId: string;
    photoUrl?: string;
    email: string;
    phone: string;
}
export interface BudgetSetting {
    limitCents: bigint;
    alertThreshold: bigint;
    category: SpendingCategory;
}
export enum ActivityType {
    JoinedViaInvite = "JoinedViaInvite",
    Sent = "Sent",
    Achievement = "Achievement",
    Received = "Received",
    SavingsGoal = "SavingsGoal"
}
export enum BillingInterval {
    annual = "annual",
    monthly = "monthly"
}
export enum Currency {
    AUD = "AUD",
    CAD = "CAD",
    EUR = "EUR",
    GBP = "GBP",
    JPY = "JPY",
    USD = "USD"
}
export enum NotifType {
    System = "System",
    Security = "Security",
    Promo = "Promo",
    Alert = "Alert",
    Payment = "Payment"
}
export enum NumberFormat {
    Period = "Period",
    Comma = "Comma"
}
export enum PaymentMethodType {
    bank = "bank",
    card = "card"
}
export enum SavingsCategory {
    Car = "Car",
    Home = "Home",
    Custom = "Custom",
    Vacation = "Vacation",
    Emergency = "Emergency"
}
export enum SpendingCategory {
    Food = "Food",
    Bills = "Bills",
    Entertainment = "Entertainment",
    Shopping = "Shopping",
    Other = "Other",
    Transfers = "Transfers",
    Transport = "Transport"
}
export enum SubscriptionStatus {
    active = "active",
    cancelled = "cancelled",
    expired = "expired",
    trialing = "trialing"
}
export enum SubscriptionTier {
    pro = "pro",
    enterprise = "enterprise",
    free = "free",
    plus = "plus",
    business = "business"
}
export enum TxHistoryVisibility {
    FriendsOnly = "FriendsOnly",
    Private = "Private",
    Public = "Public"
}
export enum TxStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    rejected = "rejected"
}
export enum TxType {
    request = "request",
    sent = "sent",
    deposit = "deposit",
    withdrawal = "withdrawal",
    received = "received"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VerificationStatus {
    Failed = "Failed",
    Unverified = "Unverified",
    Verified = "Verified",
    Pending = "Pending"
}
export interface backendInterface {
    acceptMoneyRequest(requestId: TxId): Promise<void>;
    addFunds(amount: Amount): Promise<void>;
    addPaymentMethod(token: string, last4: string, expiry: string, pmType: PaymentMethodType, displayLabel: string): Promise<void>;
    addReaction(activityId: bigint, emoji: string): Promise<boolean>;
    addTrustedContact(name: string, relationship: string, phone: string | null, email: string | null, accessLevel: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    autoDepositOnReceive(txId: TxId): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    cancelSubscription(): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    chargeCard(stripePaymentMethodId: string, amount: Amount, currency: Currency): Promise<StripePaymentResult>;
    confirmStripePaymentMethod(stripePaymentMethodId: string, displayLabel: string, pmType: PaymentMethodType, last4: string, expiry: string, holderName: string | null): Promise<PaymentMethod>;
    convertCurrency(amount: Amount, from: Currency, to: Currency): Promise<CurrencyAmount>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createInviteCode(): Promise<string>;
    createSavingsGoal(name: string, category: SavingsCategory, targetAmount: bigint, targetDate: Timestamp | null): Promise<void>;
    createStripeSetupIntent(): Promise<StripeSetupIntent>;
    createSubscriptionCheckout(tier: SubscriptionTier, interval: BillingInterval): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteGoal(goalId: bigint): Promise<void>;
    depositToGoal(goalId: bigint, amount: bigint): Promise<void>;
    exportTransactionsCsv(): Promise<string>;
    findUser(field: {
        __kind__: "username";
        username: string;
    } | {
        __kind__: "email";
        email: string;
    } | {
        __kind__: "phone";
        phone: string;
    }): Promise<Principal | null>;
    findUserByIdOrUsername(identifier: string): Promise<UserProfile | null>;
    freezeCard(pmId: string): Promise<void>;
    fxTransform(input: TransformationInput): Promise<TransformationOutput>;
    generateVirtualCard(pmId: string): Promise<CardControl>;
    getActivityFeed(limit: bigint, offset: bigint): Promise<Array<ActivityItem>>;
    getAutoPayConfig(): Promise<AutoPayConfig>;
    getBalance(): Promise<Amount>;
    getBudgets(): Promise<Array<BudgetSetting>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCardControls(pmId: string): Promise<CardControl>;
    getCurrencySymbol(currency: Currency): Promise<string>;
    getDeviceSessions(): Promise<Array<DeviceSession>>;
    getExchangeRate(from: Currency, to: Currency): Promise<FxRate>;
    getInviteCode(): Promise<string>;
    getInviteStats(): Promise<InviteStats>;
    getMultiCurrencyBalances(): Promise<Array<[Currency, Amount]>>;
    getNotifications(): Promise<Array<Notification>>;
    getPendingRequests(): Promise<Array<MoneyRequest>>;
    getReferralRewards(): Promise<ReferralRewardSummary>;
    getSavingsGoals(): Promise<Array<SavingsGoal>>;
    getSpendingAnalytics(month: bigint, year: bigint): Promise<AnalyticsSummary>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubscription(): Promise<Subscription | null>;
    getSubscriptionStatus(): Promise<SubscriptionStatus>;
    getTransactionHistory(filter: TxType | null): Promise<Array<Transaction>>;
    getTransactionMetadata(txId: TxId): Promise<TxMetadata>;
    getTrustedContacts(): Promise<Array<TrustedContact>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSettings(): Promise<UserSettings>;
    initiateWithdrawal(stripePaymentMethodId: string, amount: Amount, currency: Currency): Promise<StripePaymentResult>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isTwilioConfigured(): Promise<boolean>;
    listPaymentMethods(): Promise<Array<PaymentMethod>>;
    lockGoal(goalId: bigint): Promise<void>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(id: bigint): Promise<boolean>;
    redeemInviteCode(code: string): Promise<boolean>;
    rejectMoneyRequest(requestId: TxId): Promise<void>;
    removePaymentMethod(id: bigint): Promise<void>;
    removeReaction(activityId: bigint, emoji: string): Promise<boolean>;
    removeTrustedContact(id: bigint): Promise<boolean>;
    reportCardLostStolen(pmId: string): Promise<void>;
    requestMoney(payer: Principal, amount: Amount, note: string): Promise<void>;
    requestPhoneVerification(phone: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    revokeAllSessions(): Promise<void>;
    revokeDeviceSession(sessionId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMoney(recipient: Principal, amount: Amount, note: string): Promise<void>;
    setBudget(category: SpendingCategory, limitCents: bigint, alertThreshold: bigint): Promise<void>;
    setCardControls(pmId: string, onlineEnabled: boolean, internationalEnabled: boolean, maxTxLimit: bigint | null): Promise<void>;
    setDefaultPaymentMethod(id: bigint): Promise<void>;
    setGoalAutoDeposit(goalId: bigint, amount: bigint, interval: string): Promise<void>;
    setStripeConfiguration(secretKey: string): Promise<void>;
    setTransactionCategory(txId: TxId, category: SpendingCategory): Promise<void>;
    setTransactionNote(txId: TxId, note: string): Promise<void>;
    setTransactionTags(txId: TxId, tags: Array<string>): Promise<void>;
    setTwilioConfig(accountSid: string, authToken: string, fromNumber: string): Promise<void>;
    togglePaymentVisibility(actId: bigint, isPublic: boolean): Promise<boolean>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    twilioTransform(input: TransformationInput): Promise<TransformationOutput>;
    unfreezeCard(pmId: string): Promise<void>;
    unlinkPhone(): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateAutoPayConfig(config: AutoPayConfig): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateProfilePhoto(photoUrl: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTrustedContact(id: bigint, name: string, relationship: string, phone: string | null, email: string | null, accessLevel: string): Promise<boolean>;
    updateUserSettings(updated: UserSettings): Promise<void>;
    upsertSubscription(sub: Subscription): Promise<void>;
    validateInviteCode(code: string): Promise<boolean>;
    verifyPhone(code: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    withdrawFromGoal(goalId: bigint, amount: bigint): Promise<void>;
    withdrawFunds(amount: Amount): Promise<void>;
}
