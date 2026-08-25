import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBudgets,
  useSetBudget,
  useSpendingAnalytics,
  useSpendingTrend,
} from "@/hooks/useAnalytics";
import {
  formatCategoryBreakdownTable,
  formatCategoryPieData,
  formatCompact,
  formatCurrency,
  formatDailyBarData,
  formatMonthLabel,
  getCategoryColor,
} from "@/lib/charts";
import type { BudgetSetting, SpendingCategory } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Hash,
  PieChartIcon,
  Receipt,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORIES: SpendingCategory[] = [
  "food",
  "transport",
  "entertainment",
  "shopping",
  "health",
  "utilities",
  "travel",
  "transfers",
  "subscriptions",
  "other",
];

type DatePreset = "this_month" | "last_month" | "last_3" | "this_year";

function getBudgetColor(pct: number): string {
  if (pct >= 90) return "oklch(0.55 0.22 25)";
  if (pct >= 75) return "oklch(0.65 0.20 70)";
  return "oklch(0.65 0.18 150)";
}

function getBudgetBadgeClass(pct: number): string {
  if (pct >= 90)
    return "bg-destructive/10 text-destructive border-destructive/30";
  if (pct >= 75) return "bg-warning/10 text-warning border-warning/30";
  return "bg-success/10 text-success border-success/30";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Custom donut center label
function DonutCenter({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-10" fontSize="11" fill="var(--muted-foreground)">
        Total
      </tspan>
      <tspan
        x="50%"
        dy="22"
        fontSize="20"
        fontWeight="700"
        fill="var(--foreground)"
      >
        ${(total / 100).toFixed(0)}
      </tspan>
    </text>
  );
}

// Custom tooltip for bar chart
function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs space-y-1">
      <p className="text-muted-foreground font-medium">Day {label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name}: <span className="font-mono">${p.value.toFixed(0)}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [activePreset, setActivePreset] = useState<DatePreset>("this_month");

  const { data: summary, isLoading } = useSpendingAnalytics(month, year);
  const { data: trend = [] } = useSpendingTrend(month, year);
  const { data: budgets = [] } = useBudgets();
  const setBudget = useSetBudget();

  const isCurrentOrFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function applyPreset(preset: DatePreset) {
    setActivePreset(preset);
    const n = new Date();
    if (preset === "this_month") {
      setMonth(n.getMonth() + 1);
      setYear(n.getFullYear());
    } else if (preset === "last_month") {
      const d = new Date(n.getFullYear(), n.getMonth() - 1, 1);
      setMonth(d.getMonth() + 1);
      setYear(d.getFullYear());
    } else if (preset === "last_3") {
      const d = new Date(n.getFullYear(), n.getMonth() - 2, 1);
      setMonth(d.getMonth() + 1);
      setYear(d.getFullYear());
    } else {
      setMonth(1);
      setYear(n.getFullYear());
    }
  }

  const pieData = summary ? formatCategoryPieData(summary) : [];
  const barData = summary ? formatDailyBarData(summary) : [];
  const tableData = summary
    ? formatCategoryBreakdownTable(summary.categories, summary.totalSpentCents)
    : [];

  const avgTransaction =
    summary && summary.categories.reduce((s, c) => s + c.count, 0) > 0
      ? summary.totalSpentCents /
        summary.categories.reduce((s, c) => s + c.count, 0)
      : 0;
  const biggestPurchase = summary
    ? Math.max(...summary.dailySpend.map((d) => d.amountCents), 0)
    : 0;
  const totalTxCount = summary
    ? summary.categories.reduce((s, c) => s + c.count, 0)
    : 0;

  const presets: { id: DatePreset; label: string }[] = [
    { id: "this_month", label: "This Month" },
    { id: "last_month", label: "Last Month" },
    { id: "last_3", label: "Last 3 Months" },
    { id: "this_year", label: "This Year" },
  ];

  return (
    <div className="space-y-6 pb-8" data-ocid="analytics.page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">
              Spending Analytics
            </h1>
            <p className="text-muted-foreground text-sm">
              Understand where your money goes
            </p>
          </div>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            data-ocid="analytics.prev_month_button"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold min-w-[150px] text-center">
            {formatMonthLabel(month, year)}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            disabled={isCurrentOrFuture}
            className="p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            data-ocid="analytics.next_month_button"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Quick date presets ───────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap gap-2"
        data-ocid="analytics.presets_section"
      >
        {presets.map((p) => (
          <Button
            key={p.id}
            variant={activePreset === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset(p.id)}
            data-ocid={`analytics.preset_${p.id}`}
            className="h-8 text-xs rounded-full"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!isLoading &&
        summary &&
        summary.totalSpentCents === 0 &&
        summary.totalReceivedCents === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
            data-ocid="analytics.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <PieChartIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold">No activity yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Send or receive money to start seeing your spending analytics,
              category breakdowns, and trends here.
            </p>
            <div className="flex flex-col gap-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Send your first payment
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Set monthly budgets
                by category
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Track trends over
                time
              </div>
            </div>
          </motion.div>
        )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      {!isLoading &&
        summary &&
        (summary.totalSpentCents > 0 || summary.totalReceivedCents > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* ── Summary cards ──────────────────────────────────────────────── */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              data-ocid="analytics.summary_section"
            >
              {[
                {
                  label: "Total Spent",
                  value: formatCurrency(summary.totalSpentCents),
                  icon: TrendingDown,
                  iconBg: "bg-destructive/10",
                  iconColor: "text-destructive",
                  id: "analytics.total_spent_card",
                  sub: `${totalTxCount} transactions`,
                },
                {
                  label: "Avg. Transaction",
                  value: formatCurrency(avgTransaction),
                  icon: Receipt,
                  iconBg: "bg-accent/10",
                  iconColor: "text-accent",
                  id: "analytics.avg_tx_card",
                  sub: "per debit",
                },
                {
                  label: "Biggest Day",
                  value: formatCurrency(biggestPurchase),
                  icon: DollarSign,
                  iconBg: "bg-warning/10",
                  iconColor: "text-warning",
                  id: "analytics.biggest_card",
                  sub: "single day peak",
                },
                {
                  label: "Net Flow",
                  value:
                    (summary.netCents >= 0 ? "+" : "") +
                    formatCurrency(summary.netCents),
                  icon: summary.netCents >= 0 ? TrendingUp : TrendingDown,
                  iconBg:
                    summary.netCents >= 0
                      ? "bg-primary/10"
                      : "bg-destructive/10",
                  iconColor:
                    summary.netCents >= 0 ? "text-primary" : "text-destructive",
                  id: "analytics.net_card",
                  sub: "income vs spend",
                  valueColor:
                    summary.netCents >= 0 ? "text-primary" : "text-destructive",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card
                    data-ocid={card.id}
                    className="hover:shadow-elevated transition-smooth"
                  >
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${card.iconBg} shrink-0`}
                        >
                          <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {card.label}
                          </p>
                          <p
                            className={`text-lg font-bold font-display tabular-nums truncate ${card.valueColor ?? ""}`}
                          >
                            {card.value}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {card.sub}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* ── Received callout ───────────────────────────────────────────── */}
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <ArrowDownLeft className="h-4 w-4 text-primary shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-primary">
                  {formatCurrency(summary.totalReceivedCents)}
                </span>
                <span className="text-muted-foreground ml-1">
                  received this month
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-destructive shrink-0 ml-auto" />
              <div className="text-sm">
                <span className="font-semibold text-destructive">
                  {formatCurrency(summary.totalSpentCents)}
                </span>
                <span className="text-muted-foreground ml-1">spent</span>
              </div>
            </div>

            {/* ── Charts row ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut chart */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-primary" />
                      Spending by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pieData.length === 0 ? (
                      <div
                        className="h-48 flex items-center justify-center text-muted-foreground text-sm"
                        data-ocid="analytics.categories_empty_state"
                      >
                        No spending data for this month
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {pieData.map((entry) => (
                              <Cell key={entry.category} fill={entry.color} />
                            ))}
                          </Pie>
                          <DonutCenter total={summary.totalSpentCents} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0]
                                .payload as (typeof pieData)[0];
                              return (
                                <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs space-y-1">
                                  <p className="font-semibold">
                                    {d.emoji} {d.name}
                                  </p>
                                  <p className="font-mono font-bold">
                                    ${d.value.toFixed(2)}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {d.percentage}% of total
                                  </p>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    {/* Legend */}
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {pieData.map((d) => (
                        <div
                          key={d.category}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: d.color }}
                          />
                          <span className="text-muted-foreground truncate">
                            {d.emoji} {d.name}
                          </span>
                          <span className="ml-auto font-semibold tabular-nums text-foreground shrink-0">
                            {d.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Daily bar chart */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Daily Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={265}>
                      <BarChart
                        data={barData}
                        margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          tick={{
                            fontSize: 10,
                            fill: "var(--muted-foreground)",
                          }}
                          tickLine={false}
                          axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: "var(--muted-foreground)",
                          }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => `$${v}`}
                        />
                        <Tooltip content={<BarTooltip />} />
                        <Bar
                          dataKey="amount"
                          name="Spent"
                          radius={[4, 4, 0, 0]}
                          fill="oklch(0.52 0.16 195)"
                          opacity={0.85}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ── 6-month trend ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      6-Month Trend
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Last 6 months
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {trend.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Not enough data yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={trend}
                        margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 11,
                            fill: "var(--muted-foreground)",
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: "var(--muted-foreground)",
                          }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) => formatCompact(v)}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs space-y-1">
                                <p className="font-semibold">{label}</p>
                                {payload.map((p) => (
                                  <p key={p.name} style={{ color: p.color }}>
                                    {p.name}:{" "}
                                    <span className="font-mono font-bold">
                                      ${Number(p.value).toFixed(0)}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            );
                          }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        />
                        <Bar
                          dataKey="spent"
                          name="Spent"
                          radius={[3, 3, 0, 0]}
                          fill="oklch(0.55 0.22 25)"
                          opacity={0.8}
                        >
                          {trend.map((entry) => (
                            <Cell
                              key={entry.label}
                              fill={
                                entry.isCurrent
                                  ? "oklch(0.52 0.16 195)"
                                  : "oklch(0.55 0.22 25)"
                              }
                              opacity={entry.isCurrent ? 1 : 0.65}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="received"
                          name="Received"
                          radius={[3, 3, 0, 0]}
                          fill="oklch(0.65 0.18 150)"
                          opacity={0.7}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Category breakdown table ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tableData.length === 0 ? (
                    <p
                      className="text-sm text-muted-foreground py-4 text-center"
                      data-ocid="analytics.breakdown_empty_state"
                    >
                      No transactions this month
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tableData.map((row, i) => (
                        <div
                          key={row.label}
                          className="flex items-center gap-3 group"
                          data-ocid={`analytics.category_row.${i + 1}`}
                        >
                          <span className="text-base w-6 shrink-0 text-center">
                            {row.emoji}
                          </span>
                          <span className="text-sm flex-none w-32 min-w-0 truncate font-medium">
                            {row.label}
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-smooth"
                              style={{
                                width: `${row.percentage}%`,
                                background: row.color,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold tabular-nums w-20 text-right shrink-0">
                            ${row.amountDollars.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              {row.percentage}%
                            </Badge>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline">
                              {row.count} txn{row.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Budget vs Actual ────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Budget vs. Actual
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Monthly limits
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIES.filter(
                      (cat) => cat !== "other" && cat !== "transfers",
                    ).map((cat, i) => {
                      const budget = budgets.find((b) => b.category === cat);
                      const spent =
                        summary.categories.find((c) => c.category === cat)
                          ?.totalCents ?? 0;
                      const limit = budget?.limitCents ?? 0;
                      const pct =
                        limit > 0
                          ? Math.min(Math.round((spent / limit) * 100), 100)
                          : 0;
                      const over = limit > 0 && spent > limit;
                      const budgetColor = getBudgetColor(pct);
                      const badgeClass = getBudgetBadgeClass(pct);

                      return (
                        <div
                          key={cat}
                          className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-2.5 hover:bg-muted/50 transition-colors"
                          data-ocid={`analytics.budget_item.${i + 1}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: getCategoryColor(cat) }}
                              />
                              <span className="text-sm font-semibold capitalize truncate">
                                {cat}
                              </span>
                            </div>
                            {limit > 0 ? (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${badgeClass}`}
                              >
                                {over ? "Over!" : `${pct}%`}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setBudget.mutate({
                                    category: cat,
                                    limitCents: 20000,
                                    spentCents: spent,
                                    alertAt: 80,
                                  } as BudgetSetting)
                                }
                                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                data-ocid={`analytics.set_budget_button.${i + 1}`}
                              >
                                + Set limit
                              </button>
                            )}
                          </div>

                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            {limit > 0 ? (
                              <div
                                className="h-full rounded-full transition-smooth"
                                style={{
                                  width: `${pct}%`,
                                  background: budgetColor,
                                }}
                              />
                            ) : (
                              <div
                                className="h-full rounded-full bg-muted-foreground/20"
                                style={{ width: "0%" }}
                              />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatCurrency(spent)} spent
                            </span>
                            {limit > 0 ? (
                              <span className="text-muted-foreground font-mono">
                                of {formatCurrency(limit)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50 italic">
                                no limit set
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Top recipients ──────────────────────────────────────────────── */}
            {summary.topCounterparties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Top Recipients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="space-y-1"
                      data-ocid="analytics.top_recipients_list"
                    >
                      {summary.topCounterparties.slice(0, 5).map((cp, i) => (
                        <div
                          key={cp.name}
                          className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors group"
                          data-ocid={`analytics.recipient.${i + 1}`}
                        >
                          {/* Rank */}
                          <span className="text-xs text-muted-foreground font-mono w-4 text-right shrink-0">
                            {i + 1}
                          </span>
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
                            style={{
                              background: `hsl(${(i * 60 + 200) % 360}, 60%, 55%)`,
                            }}
                          >
                            {getInitials(cp.name)}
                          </div>
                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {cp.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cp.count} transaction{cp.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {/* Amount */}
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold tabular-nums text-foreground">
                              {formatCurrency(cp.totalCents)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              total sent
                            </p>
                          </div>
                          {/* Relative bar */}
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block shrink-0">
                            <div
                              className="h-full rounded-full bg-primary transition-smooth"
                              style={{
                                width: `${Math.round((cp.totalCents / summary.topCounterparties[0].totalCents) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      {summary.topCounterparties.length === 0 && (
                        <p
                          className="text-sm text-muted-foreground py-4 text-center"
                          data-ocid="analytics.recipients_empty_state"
                        >
                          No outgoing transfers this month
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Insights strip ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Wallet,
                    color: "text-primary",
                    bg: "bg-primary/8",
                    label: "Savings Rate",
                    value:
                      summary.totalReceivedCents > 0
                        ? `${Math.max(0, Math.round(((summary.totalReceivedCents - summary.totalSpentCents) / summary.totalReceivedCents) * 100))}%`
                        : "—",
                    sub: "of income saved",
                  },
                  {
                    icon: Hash,
                    color: "text-accent",
                    bg: "bg-accent/10",
                    label: "Categories Used",
                    value: String(
                      summary.categories.filter((c) => c.totalCents > 0).length,
                    ),
                    sub: `of ${CATEGORIES.length} total`,
                  },
                  {
                    icon: Receipt,
                    color: "text-success",
                    bg: "bg-success/10",
                    label: "Largest Category",
                    value: tableData[0]?.label ?? "—",
                    sub: tableData[0]
                      ? `${tableData[0].percentage}% of spend`
                      : "no data",
                  },
                ].map((ins, i) => (
                  <div
                    key={ins.label}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
                    data-ocid={`analytics.insight.${i + 1}`}
                  >
                    <div className={`p-2 rounded-lg ${ins.bg} shrink-0`}>
                      <ins.icon className={`h-4 w-4 ${ins.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {ins.label}
                      </p>
                      <p className="text-base font-bold font-display truncate">
                        {ins.value}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {ins.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
    </div>
  );
}
