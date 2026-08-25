import { c as createLucideIcon, x as useSavingsGoals, r as reactExports, j as jsxRuntimeExports, y as PiggyBank, B as Button, z as Plus, m as motion, p as Card, q as CardContent, T as Target, D as CircleCheck, S as Skeleton, w as Badge, E as Dialog, o as TrendingUp, F as useDepositToGoal, G as useWithdrawFromGoal, L as Lock, I as Clock, J as TriangleAlert, k as ChevronRight, A as ArrowDownLeft, s as ArrowUpRight, K as Input, M as Sparkles, N as useRoundUpSettings, O as useToggleRoundUp, t as CardHeader, v as CardTitle, Z as Zap, Q as Switch, V as ue, X as useCreateSavingsGoal, Y as DialogContent, _ as DialogHeader, $ as DialogTitle, a0 as Label, a1 as Select, a2 as SelectTrigger, a3 as SelectValue, a4 as SelectContent, a5 as SelectItem, a6 as Calendar, a7 as AnimatePresence, a8 as useUpdateGoal, a9 as useLockGoal, aa as useDeleteGoal, ab as useDepositHistory, ac as Separator, ad as Trash2, ae as RefreshCw } from "./index-BQXzav6B.js";
import { S as ScrollArea } from "./scroll-area-ou4dmD_U.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
];
const LockOpen = createLucideIcon("lock-open", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 20h9", key: "t2du7b" }],
  [
    "path",
    {
      d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
      key: "1ykcvy"
    }
  ]
];
const PenLine = createLucideIcon("pen-line", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
  ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
  ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
  ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }]
];
const Repeat = createLucideIcon("repeat", __iconNode);
const CATEGORY_META = {
  emergency: { emoji: "🛡️", label: "Emergency Fund", color: "text-destructive" },
  travel: { emoji: "✈️", label: "Travel", color: "text-primary" },
  home: { emoji: "🏠", label: "Home", color: "text-accent" },
  vehicle: { emoji: "🚗", label: "Vehicle", color: "text-muted-foreground" },
  education: { emoji: "📚", label: "Education", color: "text-primary" },
  retirement: { emoji: "👴", label: "Retirement", color: "text-accent" },
  investment: { emoji: "📈", label: "Investment", color: "text-primary" },
  wedding: { emoji: "💍", label: "Wedding", color: "text-destructive" },
  gadget: { emoji: "💻", label: "Gadget", color: "text-muted-foreground" },
  other: { emoji: "🎯", label: "Other", color: "text-muted-foreground" }
};
const CATEGORIES = Object.keys(CATEGORY_META);
function fmtDollars(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtDollarsFull(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function daysRemaining(deadline) {
  if (!deadline) return null;
  const diff = deadline - Date.now();
  if (diff < 0) return 0;
  return Math.ceil(diff / (1e3 * 60 * 60 * 24));
}
function progressColor(pct) {
  if (pct >= 100) return "bg-primary";
  if (pct >= 75) return "bg-[oklch(0.65_0.18_150)]";
  if (pct >= 25) return "bg-[oklch(0.72_0.18_85)]";
  return "bg-destructive";
}
function progressRingColor(pct) {
  if (pct >= 100) return "#5eb8d4";
  if (pct >= 75) return "#4aba8a";
  if (pct >= 25) return "#d4a017";
  return "#e05555";
}
function CircularProgress({ pct, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct / 100 * circ;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, className: "-rotate-90", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 4,
        className: "text-border opacity-50"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: "none",
        stroke: progressRingColor(pct),
        strokeWidth: 4,
        strokeDasharray: circ,
        strokeDashoffset: offset,
        strokeLinecap: "round",
        style: {
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)"
        }
      }
    )
  ] });
}
function GoalCard({
  goal,
  index,
  onOpenDetail
}) {
  const deposit = useDepositToGoal();
  const withdraw = useWithdrawFromGoal();
  const [amount, setAmount] = reactExports.useState("");
  const [activeTab, setActiveTab] = reactExports.useState("deposit");
  const pct = goal.targetCents > 0 ? Math.min(Math.round(goal.savedCents / goal.targetCents * 100), 100) : 0;
  const completed = pct >= 100;
  const days = daysRemaining(goal.deadline);
  const meta = CATEGORY_META[goal.category];
  function handleAction() {
    const cents = Math.round(Number.parseFloat(amount) * 100);
    if (!cents || cents <= 0) {
      ue.error("Enter a valid amount");
      return;
    }
    if (activeTab === "deposit") {
      deposit.mutate(
        { goalId: goal.id, amountCents: cents, note: "Manual deposit" },
        {
          onSuccess: () => {
            ue.success(`Deposited ${fmtDollarsFull(cents)} to ${goal.name}`);
            setAmount("");
          }
        }
      );
    } else {
      if (goal.isLocked) {
        ue.error("Goal is locked — unlock it first");
        return;
      }
      withdraw.mutate(
        { goalId: goal.id, amountCents: cents },
        {
          onSuccess: () => {
            ue.success(
              `Withdrew ${fmtDollarsFull(cents)} from ${goal.name}`
            );
            setAmount("");
          }
        }
      );
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.06, duration: 0.35 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "relative overflow-hidden hover:shadow-elevated transition-smooth group border-border",
          "data-ocid": `savings.goal_card.${index + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute top-0 left-0 right-0 h-0.5 transition-all",
                style: { background: progressRingColor(pct), opacity: 0.7 }
              }
            ),
            completed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-primary/5 pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 pb-4 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { pct, size: 52 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 flex items-center justify-center text-lg", children: goal.emoji ?? meta.emoji })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm truncate max-w-[140px]", children: goal.name }),
                      goal.isLocked && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3 text-muted-foreground flex-shrink-0" }),
                      completed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-2.5 w-2.5 mr-0.5" }),
                        " Done"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: meta.label }),
                    days !== null && days > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                      " ",
                      days,
                      "d left"
                    ] }),
                    days === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive flex items-center gap-1 mt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                      " Deadline passed"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base font-display leading-tight", children: fmtDollars(goal.savedCents) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                      "of ",
                      fmtDollars(goal.targetCents)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "p",
                      {
                        className: "text-xs font-semibold mt-0.5",
                        style: { color: progressRingColor(pct) },
                        children: [
                          pct,
                          "%"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => onOpenDetail(goal),
                      className: "opacity-0 group-hover:opacity-100 transition-all mt-0.5 p-1 rounded-md hover:bg-muted text-muted-foreground",
                      "aria-label": "View goal details",
                      "data-ocid": `savings.goal_detail_button.${index + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-full rounded-full transition-all duration-700 ${progressColor(pct)}`,
                  style: { width: `${pct}%` }
                }
              ) }),
              goal.autoDepositCents && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-3 w-3 flex-shrink-0 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Auto ",
                  fmtDollarsFull(goal.autoDepositCents),
                  " /",
                  " ",
                  goal.autoDepositInterval
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg border border-border bg-muted/30 p-0.5 mr-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setActiveTab("deposit"),
                      className: `flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "deposit" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`,
                      "data-ocid": `savings.deposit_tab.${index + 1}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "h-3 w-3" }),
                        " Add"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setActiveTab("withdraw"),
                      className: `flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "withdraw" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"} ${goal.isLocked ? "opacity-40 cursor-not-allowed" : ""}`,
                      "data-ocid": `savings.withdraw_tab.${index + 1}`,
                      disabled: goal.isLocked,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
                        " Out"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0.01",
                    step: "0.01",
                    placeholder: "0.00",
                    value: amount,
                    onChange: (e) => setAmount(e.target.value),
                    onKeyDown: (e) => e.key === "Enter" && handleAction(),
                    className: "h-8 text-sm flex-1",
                    "data-ocid": `savings.amount_input.${index + 1}`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    onClick: handleAction,
                    disabled: deposit.isPending || withdraw.isPending,
                    className: "h-8 px-3 text-xs",
                    variant: activeTab === "withdraw" ? "outline" : "default",
                    "data-ocid": `savings.action_button.${index + 1}`,
                    children: activeTab === "deposit" ? "Deposit" : "Withdraw"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function GoalDetailModal({
  goal,
  onClose
}) {
  const updateGoal = useUpdateGoal();
  const lockGoal = useLockGoal();
  const deleteGoal = useDeleteGoal();
  const deposit = useDepositToGoal();
  const withdraw = useWithdrawFromGoal();
  const { data: history = [] } = useDepositHistory(goal.id);
  const [editing, setEditing] = reactExports.useState(false);
  const [editName, setEditName] = reactExports.useState(goal.name);
  const [editTarget, setEditTarget] = reactExports.useState(
    (goal.targetCents / 100).toString()
  );
  const [editAutoAmt, setEditAutoAmt] = reactExports.useState(
    goal.autoDepositCents ? (goal.autoDepositCents / 100).toString() : ""
  );
  const [editAutoInterval, setEditAutoInterval] = reactExports.useState(goal.autoDepositInterval ?? "monthly");
  const [confirmDelete, setConfirmDelete] = reactExports.useState(false);
  const [txAmount, setTxAmount] = reactExports.useState("");
  const [txNote, setTxNote] = reactExports.useState("");
  const pct = goal.targetCents > 0 ? Math.min(Math.round(goal.savedCents / goal.targetCents * 100), 100) : 0;
  function handleSaveEdit() {
    updateGoal.mutate(
      {
        goalId: goal.id,
        updates: {
          name: editName,
          targetCents: Math.round(Number.parseFloat(editTarget) * 100),
          autoDepositCents: editAutoAmt ? Math.round(Number.parseFloat(editAutoAmt) * 100) : void 0,
          autoDepositInterval: editAutoAmt ? editAutoInterval : void 0
        }
      },
      {
        onSuccess: () => {
          ue.success("Goal updated");
          setEditing(false);
        }
      }
    );
  }
  function handleDelete() {
    deleteGoal.mutate(goal.id, {
      onSuccess: () => {
        ue.success("Goal deleted");
        onClose();
      }
    });
  }
  function handleDeposit() {
    const cents = Math.round(Number.parseFloat(txAmount) * 100);
    if (!cents || cents <= 0) return;
    deposit.mutate(
      { goalId: goal.id, amountCents: cents, note: txNote || void 0 },
      {
        onSuccess: () => {
          ue.success(`Deposited ${fmtDollarsFull(cents)}`);
          setTxAmount("");
          setTxNote("");
        }
      }
    );
  }
  function handleWithdraw() {
    if (goal.isLocked) {
      ue.error("Goal is locked");
      return;
    }
    const cents = Math.round(Number.parseFloat(txAmount) * 100);
    if (!cents || cents <= 0) return;
    withdraw.mutate(
      { goalId: goal.id, amountCents: cents },
      {
        onSuccess: () => {
          ue.success(`Withdrew ${fmtDollarsFull(cents)}`);
          setTxAmount("");
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-lg max-h-[90vh] flex flex-col overflow-hidden",
      "data-ocid": "savings.goal_detail_dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: goal.emoji ?? CATEGORY_META[goal.category].emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold", children: goal.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-normal", children: CATEGORY_META[goal.category].label })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 -mx-6 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-4 bg-muted/40 rounded-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { pct, size: 72 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-display", children: fmtDollarsFull(goal.savedCents) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "of ",
                fmtDollarsFull(goal.targetCents),
                " goal"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-full rounded-full ${progressColor(pct)}`,
                  style: { width: `${pct}%` }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                pct,
                "% complete ·",
                " ",
                fmtDollarsFull(goal.targetCents - goal.savedCents),
                " remaining"
              ] })
            ] })
          ] }),
          editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4 border border-border rounded-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Edit Goal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Goal Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: editName,
                  onChange: (e) => setEditName(e.target.value),
                  "data-ocid": "savings.edit_name_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Target Amount ($)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: editTarget,
                  onChange: (e) => setEditTarget(e.target.value),
                  "data-ocid": "savings.edit_target_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Auto-deposit ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    placeholder: "Optional",
                    value: editAutoAmt,
                    onChange: (e) => setEditAutoAmt(e.target.value),
                    "data-ocid": "savings.edit_auto_input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Frequency" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: editAutoInterval,
                    onValueChange: (v) => setEditAutoInterval(v),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "savings.edit_interval_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" })
                      ] })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => setEditing(false),
                  className: "flex-1",
                  "data-ocid": "savings.edit_cancel_button",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  onClick: handleSaveEdit,
                  disabled: updateGoal.isPending,
                  className: "flex-1",
                  "data-ocid": "savings.edit_save_button",
                  children: "Save Changes"
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setEditing(true),
                className: "flex-1 gap-1.5",
                "data-ocid": "savings.edit_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-3.5 w-3.5" }),
                  " Edit Goal"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => lockGoal.mutate(
                  { goalId: goal.id, locked: !goal.isLocked },
                  {
                    onSuccess: () => ue.success(
                      goal.isLocked ? "Goal unlocked" : "Goal locked"
                    )
                  }
                ),
                className: `flex-1 gap-1.5 ${goal.isLocked ? "border-primary text-primary" : ""}`,
                "data-ocid": "savings.lock_toggle",
                children: goal.isLocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-3.5 w-3.5" }),
                  " Unlock"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }),
                  " Lock"
                ] })
              }
            )
          ] }),
          goal.isLocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 p-3 bg-primary/8 border border-primary/20 rounded-lg text-sm text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This goal is locked. Withdrawals are disabled until you unlock it." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Quick Transaction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  placeholder: "Amount ($)",
                  value: txAmount,
                  onChange: (e) => setTxAmount(e.target.value),
                  className: "flex-1",
                  "data-ocid": "savings.detail_amount_input"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Note (optional)",
                  value: txNote,
                  onChange: (e) => setTxNote(e.target.value),
                  className: "flex-1",
                  "data-ocid": "savings.detail_note_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: handleDeposit,
                  disabled: deposit.isPending,
                  className: "flex-1 gap-1.5",
                  "data-ocid": "savings.detail_deposit_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "h-3.5 w-3.5" }),
                    " Deposit"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: handleWithdraw,
                  disabled: withdraw.isPending || goal.isLocked,
                  className: "flex-1 gap-1.5",
                  "data-ocid": "savings.detail_withdraw_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5" }),
                    " Withdraw"
                  ]
                }
              )
            ] })
          ] }),
          goal.autoDepositCents && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-muted/30 rounded-xl border border-border space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-3.5 w-3.5 text-primary" }),
              "Auto-Deposit Active"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              fmtDollarsFull(goal.autoDepositCents),
              " automatically added",
              " ",
              goal.autoDepositInterval
            ] })
          ] }),
          goal.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 flex-shrink-0" }),
            "Target date:",
            " ",
            new Date(goal.deadline).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }),
            daysRemaining(goal.deadline) !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `ml-auto text-xs font-medium ${(daysRemaining(goal.deadline) ?? 0) < 30 ? "text-destructive" : "text-muted-foreground"}`,
                children: daysRemaining(goal.deadline) === 0 ? "Overdue" : `${daysRemaining(goal.deadline)}d remaining`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Transaction History" }),
            history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No transactions yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: history.slice(0, 8).map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryRow, { entry }, entry.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          confirmDelete ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3 bg-destructive/8 border border-destructive/20 rounded-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: "Delete this goal?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This action cannot be undone. Any saved amount will be released back to your wallet." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => setConfirmDelete(false),
                  className: "flex-1",
                  "data-ocid": "savings.delete_cancel_button",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "destructive",
                  onClick: handleDelete,
                  disabled: deleteGoal.isPending,
                  className: "flex-1",
                  "data-ocid": "savings.delete_confirm_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 mr-1" }),
                    " Delete Goal"
                  ]
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => setConfirmDelete(true),
              className: "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
              "data-ocid": "savings.delete_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1.5" }),
                " Delete Goal"
              ]
            }
          )
        ] }) })
      ]
    }
  );
}
function HistoryRow({ entry }) {
  const isWithdraw = entry.type === "withdraw";
  const isAuto = entry.type === "auto" || entry.type === "roundup";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isWithdraw ? "bg-destructive/10" : "bg-primary/10"}`,
        children: isWithdraw ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 text-destructive" }) : isAuto ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "h-4 w-4 text-primary" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: entry.note ?? (isWithdraw ? "Withdrawal" : "Deposit") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        new Date(entry.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        isAuto && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full", children: "Auto" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: `text-sm font-semibold font-display ${isWithdraw ? "text-destructive" : "text-primary"}`,
        children: [
          isWithdraw ? "-" : "+",
          fmtDollarsFull(entry.amountCents)
        ]
      }
    )
  ] });
}
function RoundUpSection() {
  const { data: settings } = useRoundUpSettings();
  const toggle = useToggleRoundUp();
  if (!settings) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "border-border overflow-hidden",
      "data-ocid": "savings.roundup_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 bg-gradient-to-r from-primary/60 via-primary to-accent/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-primary" }) }),
          "Round-Up Savings",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: settings.enabled ? "Active" : "Inactive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: settings.enabled,
                onCheckedChange: (v) => {
                  toggle.mutate(v, {
                    onSuccess: () => ue.success(
                      v ? "Round-up savings enabled! 🎉" : "Round-up savings disabled"
                    )
                  });
                },
                "data-ocid": "savings.roundup_toggle"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-0 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Automatically round up every P2P transfer to the nearest $5 and save the difference into your Emergency Fund." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-muted/40 rounded-xl text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-display text-primary", children: fmtDollarsFull(settings.totalRoundedUpCents) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Saved via Round-ups" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-muted/40 rounded-xl text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-display", children: settings.transactions.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Transactions Rounded" })
            ] })
          ] }),
          settings.transactions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Recent Round-Ups" }),
            settings.transactions.slice(0, 4).map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between py-1.5 border-b border-border/50 last:border-0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5 text-primary flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium", children: [
                        fmtDollarsFull(tx.originalCents),
                        " →",
                        " ",
                        fmtDollarsFull(tx.roundedCents)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(tx.timestamp).toLocaleDateString() })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-primary", children: [
                    "+",
                    fmtDollarsFull(tx.savedCents)
                  ] })
                ]
              },
              tx.id
            ))
          ] })
        ] })
      ]
    }
  );
}
function CompletedGoalsSection({ goals }) {
  if (goals.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", "data-ocid": "savings.completed_section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-sm", children: "Completed Goals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: goals.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: goals.map((goal, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { delay: i * 0.08 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Card,
          {
            className: "border-primary/20 bg-primary/5 relative overflow-hidden",
            "data-ocid": `savings.completed_card.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: goal.emoji ?? CATEGORY_META[goal.category].emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: goal.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary flex-shrink-0" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: CATEGORY_META[goal.category].label })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm font-display text-primary", children: fmtDollars(goal.savedCents) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "100% ✓" })
                ] })
              ] }) })
            ]
          }
        )
      },
      goal.id
    )) })
  ] });
}
function EmptyState({ onCreateGoal }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      className: "text-center py-16 px-6 space-y-5",
      "data-ocid": "savings.empty_state",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-28 h-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              animate: { y: [0, -6, 0] },
              transition: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 2.8,
                ease: "easeInOut"
              },
              className: "text-7xl text-center leading-none",
              children: "🐷"
            }
          ),
          ["coin1", "coin2", "coin3"].map((key, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute text-sm",
              style: { top: `${20 + i * 15}%`, right: `${5 + i * 8}%` },
              animate: { opacity: [0, 1, 0], y: [0, -12, -24], x: [0, 4, 8] },
              transition: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.8,
                delay: i * 0.5
              },
              children: "💰"
            },
            key
          ))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-w-sm mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold font-display", children: "Start saving today" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Set a goal, track your progress, and reach your dreams one deposit at a time. Your first goal is just one click away." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: onCreateGoal,
              size: "lg",
              className: "gap-2 px-6",
              "data-ocid": "savings.create_first_goal_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }),
                " Create First Goal"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "lg",
              className: "gap-2 px-6",
              "data-ocid": "savings.learn_more_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
                " See How It Works"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 justify-center pt-2", children: [
          "🛡️ Emergency Fund",
          "✈️ Vacation",
          "🏠 Home Down Payment",
          "💍 Wedding"
        ].map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onCreateGoal,
            className: "px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:bg-muted transition-colors",
            children: label
          },
          label
        )) })
      ]
    }
  );
}
const DEFAULT_FORM = {
  name: "",
  category: "other",
  targetCents: "",
  deadline: "",
  autoEnabled: false,
  autoDepositCents: "",
  autoDepositInterval: "monthly"
};
function CreateGoalModal({
  open,
  onClose
}) {
  const createGoal = useCreateSavingsGoal();
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }
  function handleCreate() {
    if (!form.name.trim() || !form.targetCents) {
      ue.error("Please fill in goal name and target amount");
      return;
    }
    const targetCents = Math.round(Number.parseFloat(form.targetCents) * 100);
    if (Number.isNaN(targetCents) || targetCents <= 0) {
      ue.error("Target amount must be greater than $0");
      return;
    }
    const meta = CATEGORY_META[form.category];
    createGoal.mutate(
      {
        name: form.name.trim(),
        category: form.category,
        targetCents,
        currency: "USD",
        isLocked: false,
        emoji: meta.emoji,
        deadline: form.deadline ? new Date(form.deadline).getTime() : void 0,
        autoDepositCents: form.autoEnabled && form.autoDepositCents ? Math.round(Number.parseFloat(form.autoDepositCents) * 100) : void 0,
        autoDepositInterval: form.autoEnabled && form.autoDepositCents ? form.autoDepositInterval : void 0
      },
      {
        onSuccess: () => {
          ue.success(`${meta.emoji} "${form.name}" goal created!`);
          setForm(DEFAULT_FORM);
          onClose();
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "savings.create_dialog", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-5 w-5 text-primary" }),
      " New Savings Goal"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Goal Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "e.g. Europe Vacation 2025",
            value: form.name,
            onChange: (e) => set("name", e.target.value),
            "data-ocid": "savings.goal_name_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.category,
              onValueChange: (v) => set("category", v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "savings.category_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c, children: [
                  CATEGORY_META[c].emoji,
                  " ",
                  CATEGORY_META[c].label
                ] }, c)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Amount ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: "1",
              step: "1",
              placeholder: "1,000",
              value: form.targetCents,
              onChange: (e) => set("targetCents", e.target.value),
              "data-ocid": "savings.target_input"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
          " Target Date",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: form.deadline,
            onChange: (e) => set("deadline", e.target.value),
            "data-ocid": "savings.deadline_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-3 border border-border rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-3.5 w-3.5 text-primary" }),
              " Auto-Deposit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically add funds on a schedule" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: form.autoEnabled,
              onCheckedChange: (v) => set("autoEnabled", v),
              "data-ocid": "savings.auto_deposit_toggle"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: form.autoEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            className: "grid grid-cols-2 gap-2 overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Amount ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    placeholder: "50",
                    value: form.autoDepositCents,
                    onChange: (e) => set("autoDepositCents", e.target.value),
                    "data-ocid": "savings.auto_amount_input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Frequency" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.autoDepositInterval,
                    onValueChange: (v) => set("autoDepositInterval", v),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "savings.auto_interval_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Weekly" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: "Monthly" })
                      ] })
                    ]
                  }
                )
              ] })
            ]
          }
        ) })
      ] }),
      form.name && form.targetCents && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 bg-muted/40 rounded-xl text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: CATEGORY_META[form.category].emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: form.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Goal:",
            " ",
            fmtDollars(
              Math.round(Number.parseFloat(form.targetCents) * 100) || 0
            ),
            form.autoEnabled && form.autoDepositCents && ` · Auto ${fmtDollars(Math.round(Number.parseFloat(form.autoDepositCents) * 100) || 0)}/${form.autoDepositInterval}`
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: onClose,
            className: "flex-1",
            "data-ocid": "savings.cancel_button",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleCreate,
            disabled: createGoal.isPending,
            className: "flex-1",
            "data-ocid": "savings.submit_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
              " Create Goal"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
function SavingsPage() {
  const { data: goals = [], isLoading } = useSavingsGoals();
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [detailGoal, setDetailGoal] = reactExports.useState(null);
  const activeGoals = goals.filter((g) => g.savedCents < g.targetCents);
  const completedGoals = goals.filter((g) => g.savedCents >= g.targetCents);
  const totalSaved = goals.reduce((s, g) => s + g.savedCents, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetCents, 0);
  const overallPct = totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) : 0;
  const totalAutoMonthly = goals.filter((g) => g.autoDepositCents && g.autoDepositInterval === "monthly").reduce((s, g) => s + (g.autoDepositCents ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-8", "data-ocid": "savings.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-display font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-6 w-6 text-primary" }),
          "Savings Goals"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Build your future, one goal at a time" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => setShowCreate(true),
          className: "gap-2 shrink-0",
          "data-ocid": "savings.create_goal_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " New Goal"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Card,
          {
            className: "relative overflow-hidden border-border",
            "data-ocid": "savings.balance_widget",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-accent/60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1", children: "Total Savings Balance" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-bold font-display", children: fmtDollarsFull(totalSaved) }),
                    totalTarget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm mb-1", children: [
                      "of ",
                      fmtDollars(totalTarget),
                      " across ",
                      goals.length,
                      " goal",
                      goals.length !== 1 ? "s" : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-muted rounded-full overflow-hidden max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        className: "h-full bg-primary rounded-full",
                        initial: { width: 0 },
                        animate: { width: `${overallPct}%` },
                        transition: { duration: 0.8, delay: 0.2 }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                      overallPct,
                      "% of total savings targets reached"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 sm:gap-6 shrink-0", children: [
                  {
                    label: "Active Goals",
                    value: activeGoals.length,
                    icon: Target
                  },
                  {
                    label: "Completed",
                    value: completedGoals.length,
                    icon: CircleCheck
                  },
                  {
                    label: "Auto / mo",
                    value: fmtDollars(totalAutoMonthly),
                    icon: Repeat
                  }
                ].map(({ label, value, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold font-display leading-tight", children: value }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground whitespace-nowrap", children: label })
                ] }, label)) })
              ] }) })
            ]
          }
        )
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: ["sk1", "sk2", "sk3", "sk4"].map((skKey) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-12 h-12 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-16" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-full rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" })
    ] }) }, skKey)) }) : goals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { onCreateGoal: () => setShowCreate(true) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      activeGoals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3.5 w-3.5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-sm", children: "Active Goals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: activeGoals.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: activeGoals.map((goal, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          GoalCard,
          {
            goal,
            index: i,
            onOpenDetail: setDetailGoal
          },
          goal.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CompletedGoalsSection, { goals: completedGoals }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RoundUpSection, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreateGoalModal, { open: showCreate, onClose: () => setShowCreate(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!detailGoal,
        onOpenChange: (v) => !v && setDetailGoal(null),
        children: detailGoal && /* @__PURE__ */ jsxRuntimeExports.jsx(
          GoalDetailModal,
          {
            goal: detailGoal,
            onClose: () => setDetailGoal(null)
          }
        )
      }
    )
  ] });
}
export {
  SavingsPage as default
};
