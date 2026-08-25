import type {
  AnalyticsSummary,
  CategoryBreakdown,
  SpendingCategory,
} from "@/types";

// ── Category color palette ────────────────────────────────────────────────────
// OKLCH colors that work well in both light and dark modes.

const CATEGORY_COLORS: Record<SpendingCategory, string> = {
  food: "oklch(0.72 0.18 150)",
  transport: "oklch(0.68 0.16 220)",
  entertainment: "oklch(0.70 0.20 300)",
  shopping: "oklch(0.74 0.18 60)",
  health: "oklch(0.72 0.18 175)",
  utilities: "oklch(0.65 0.14 250)",
  travel: "oklch(0.72 0.18 200)",
  transfers: "oklch(0.68 0.16 280)",
  subscriptions: "oklch(0.70 0.20 330)",
  other: "oklch(0.65 0.08 0)",
};

const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  food: "Food & Dining",
  transport: "Transport",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health: "Health & Wellness",
  utilities: "Utilities",
  travel: "Travel",
  transfers: "Transfers",
  subscriptions: "Subscriptions",
  other: "Other",
};

const CATEGORY_EMOJIS: Record<SpendingCategory, string> = {
  food: "🍔",
  transport: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  health: "💊",
  utilities: "⚡",
  travel: "✈️",
  transfers: "💸",
  subscriptions: "📱",
  other: "📦",
};

export function generateCategoryColors(
  categories: SpendingCategory[],
): Record<SpendingCategory, string> {
  const result: Partial<Record<SpendingCategory, string>> = {};
  for (const cat of categories) {
    result[cat] = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;
  }
  return result as Record<SpendingCategory, string>;
}

export function getCategoryColor(category: SpendingCategory): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
}

export function getCategoryLabel(category: SpendingCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryEmoji(category: SpendingCategory): string {
  return CATEGORY_EMOJIS[category] ?? "📦";
}

// ── Chart data types ─────────────────────────────────────────────────────────

export interface PieChartDatum {
  name: string;
  value: number;
  color: string;
  percentage: number;
  category: SpendingCategory;
  emoji: string;
}

export interface BarChartDatum {
  day: string;
  amount: number;
  amountFormatted: string;
}

export interface LineChartDatum {
  label: string;
  spent: number;
  received: number;
}

export interface CategoryTableRow {
  label: string;
  emoji: string;
  color: string;
  amountDollars: number;
  percentage: number;
  count: number;
}

// ── Formatter functions ───────────────────────────────────────────────────────

export function formatCategoryPieData(
  summary: AnalyticsSummary,
): PieChartDatum[] {
  return summary.categories
    .filter((c) => c.totalCents > 0)
    .map((c) => ({
      name: getCategoryLabel(c.category),
      value: Math.round(c.totalCents / 100),
      color: getCategoryColor(c.category),
      percentage: c.percentage,
      category: c.category,
      emoji: getCategoryEmoji(c.category),
    }));
}

export function formatDailyBarData(summary: AnalyticsSummary): BarChartDatum[] {
  return summary.dailySpend.map(({ day, amountCents }) => ({
    day: String(day),
    amount: Math.round(amountCents / 100),
    amountFormatted: `$${(amountCents / 100).toFixed(2)}`,
  }));
}

export function formatCategoryBreakdownTable(
  categories: CategoryBreakdown[],
  totalCents: number,
): CategoryTableRow[] {
  return categories.map((c) => ({
    label: getCategoryLabel(c.category),
    emoji: getCategoryEmoji(c.category),
    color: getCategoryColor(c.category),
    amountDollars: Math.round(c.totalCents) / 100,
    percentage:
      totalCents > 0 ? Math.round((c.totalCents / totalCents) * 100) : 0,
    count: c.count,
  }));
}

export function formatMonthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatCompact(dollars: number): string {
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${dollars.toFixed(0)}`;
}
